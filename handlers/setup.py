import json
import logging as log
import urllib

import settings
from models.setup import AppInfo, AdminUser, AccessToken
from handlers.utils import display_error
from handlers.helpers import make_oauth2_service, BaseRequestHandler
from models.ext import ZendeskCredentials


class AppHandler(BaseRequestHandler):
    def get(self):
        output = {'data': [], 'error': ''}
        id = self.request.get('id')

        try:
            session = self.authorize_session()
            if id:
                response = session.get("applications/{}".format(id))
            else:
                response = session.get("applications")

            if response.status_code == 200:
                output['data'] = response.json()
            else:
                raise RuntimeError('{}: fail to retrieve applications'.format(response.status_code))
        except Exception as e:
            output['error'] = display_error(e)
            log.error('ERROR: {}'.format(display_error(e)))
        self.response.write(json.dumps(output))


class AppScopesHandler(BaseRequestHandler):
    def get(self):
        output = {'data': [], 'error': ''}
        app_id = self.request.get('app_id')

        try:
            session = self.authorize_session()

            if app_id:
                response = session.get("applications/{}/scopes".format(app_id))
            else:
                response = session.get("applications/scopes")

            if response.status_code == 200:
                output['data'] = response.json()
            else:
                raise RuntimeError('{}: fail to retrieve applications scopes'.format(response.status_code))
        except Exception as e:
            output['error'] = display_error(e)
            log.error('ERROR: {}'.format(display_error(e)))
        self.response.write(json.dumps(output))

    def put(self):
        output = {'data': [], 'error': ''}
        req = json.loads(self.request.body)
        app_id = req.get('app_id', None)
        scopes = req.get('scopes', None)

        try:
            if None in [app_id, scopes]:
                raise RuntimeError("Invalid request!")

            headers = {
                'Content-type': 'application/json',
                'Accept': 'application/json'
            }

            session = self.authorize_session()

            response = session.put('applications/{}/scopes'.format(app_id), data=json.dumps(scopes), headers=headers)
            log.info('updated_scopes: {}'.format(scopes))
            if response.status_code not in [200, 204]:
                raise RuntimeError('{}: fail to update application scope'.format(response.status_code))

        except Exception as e:
            output['error'] = display_error(e)
            log.error('ERROR: {}'.format(display_error(e)))
        self.response.write(json.dumps(output))


class CreateTokenHandler(BaseRequestHandler):
    def get(self):
        app_info_model = AppInfo.get_by_id(settings.ENVIRONMENT)
        log.info("Querying datastore for most recent AppInfo")

        if app_info_model is None:
            self.error(500)
            self.response.write("Missing AppInfo. Bailing.")
            return

        hello = make_oauth2_service(app_info_model)
        headers = {
            'Content-type': 'application/json',
            'Accept': 'application/json'
        }

        session = hello.get_session(app_info_model.access_token)
        resp = session.get('applications', headers=headers)
        self.response.write(resp.content)

    def post(self):
        username = self.request.get("username", default_value="x@sayhello.com")
        password = self.request.get("password", default_value="x")
        client_id = self.request.get('client_id', default_value="unknown")

        log.info("username: %s, password:%s, client_id:%s" % (username, password, client_id))

        app_info_model = AppInfo.get_by_id(settings.ENVIRONMENT)

        if app_info_model is None:
            self.error(500)
            self.response.write("Missing AppInfo. Bailing.")
            return

        # override here because we want to generate a token for a given app,
        # not necessarily the admin one
        app_info_model.client_id = client_id
        hello = make_oauth2_service(app_info_model)

        data = {
            "grant_type": "password",
            "client_id": app_info_model.client_id,
            "client_secret": '',
            "username": username,
            "password": password
        }

        resp = hello.get_raw_access_token(data=data)
        log.info(resp.url)

        try:
            json_data = json.loads(resp.content)
        except ValueError, e:
            log.error("Failed to decode JSON. Bailing")
            log.error("For username: %s" % username)
            log.error("Json was: %s" % resp.content)
            log.error("Error was: %s" % e)
            self.error(500)
            return
        log.warn(resp.content)
        if not isinstance(json_data, dict):
            log.error("json_data is not a dict. bailing.")
            log.error(resp.content)
            self.error(500)
            return

        if 'access_token' not in json_data:
            log.error("The key access_token was not found in the response")
            log.error(resp.content)
            self.error(500)
            return

        access_token = json_data['access_token']

        token = AccessToken(
            username=username,
            token=access_token,
            app=client_id
        )
        token.put()

        self.response.write(json.dumps({'access_token': access_token}))


class CreateAccountHandler(BaseRequestHandler):
    def post(self):
        name = self.request.get("name")
        email = self.request.get("email")
        password = self.request.get("password")
        gender = self.request.get("gender")
        height = self.request.get("height")
        weight = self.request.get("weight")
        tz = self.request.get("tz")

        data = {
            "name": name,
            "email": email,
            "password": password,
            "gender": gender,
            "height": height,
            "weight": weight,
            "tz": tz
        }

        if not all([name, email, password, gender, height, weight, tz]):
            self.error(400)
            self.response.write("All fields not specified")
            self.response.write(json.dumps(data))
            return

        headers = {
            'Content-type': 'application/json',
            'Accept': 'application/json'
        }

        session = self.authorize_session()

        log.info("Submitting data")
        log.info(data)
        resp = session.post('account', data=json.dumps(data), headers=headers)

        log.info(resp.url)
        log.info(resp.status_code)
        log.info(resp.content)

        template_values = {}
        if resp.status_code == 409:
            template_values['error'] = '[HTTP %s] Account already exists.\
             Response: %s ' % (resp.status_code, resp.content)
        elif resp.status_code == 200:
            template_values['message'] = "User %s created successfully" % email
        else:
            template_values['error'] = '[HTTP %s] Response: %s' \
                % (resp.status_code, resp.content)
        self.error(resp.status_code)
        self.response.write(json.dumps(template_values))


class ProxyHandler(BaseRequestHandler):
    def get(self, path):
        data = []

        session = self.authorize_session()

        resp = session.get('/v1/' + path)
        if resp.status_code != 200:
            self.error(resp.status_code)
            self.response.write(resp.content)
            log.error(resp.content)
            return
        log.info(resp.status_code)
        data = resp.json()
        log.info(data)
        segments = data[0]
        log.info("Received %d segments" % len(segments['segments']))
        self.response.write(json.dumps(segments))


class RecentTokensHandler(BaseRequestHandler):
    def get(self):
        """
        Grab recent tokens (up to 20)
        """
        output = {'data': [], 'error': ''}
        try:
            output['data'] = [{'username': t.username, 'access_token': t.token} for t in AccessToken.query_tokens()]
        except Exception as e:
            output['error'] = display_error(e)
            log.error('ERROR: {}'.format(display_error(e)))

        self.response.write(json.dumps(output))


class RegisterPillHandler(BaseRequestHandler):
    def post(self):

        headers = {
            'Content-type': 'application/json',
            'Accept': 'application/json'
        }

        session = self.authorize_session()

        data = dict(
            pill_id=self.request.get('pill_id'),
            account_id=self.request.get('account_id')
        )
        log.info(data)

        resp = session.post(
            'devices/pill',
            data=json.dumps(data),
            headers=headers
        )
        if resp.status_code not in [200, 204]:
            log.error("%s - %s", resp.status_code, resp.content)
            error_message = "%s" % resp.content
            self.show_handler_error(error_message, status_code=resp.status_code)
            return
        self.redirect('/')

class UpdateAdminAccessTokenHandler(BaseRequestHandler):
    def get(self):
        admin_user = AdminUser.get_by_id(settings.ENVIRONMENT)
        app_info_model = AppInfo.get_by_id(settings.ENVIRONMENT)

        if admin_user is None:

            friendly_user_message = "User not found for id = %s" \
                % settings.ENVIRONMENT
            log.warn(friendly_user_message)
            self.show_handler_error(friendly_user_message)
            return

        if app_info_model is None:
            friendly_user_message = "AppInfo not found for id = %s" \
                % settings.ENVIRONMENT
            log.warn(friendly_user_message)
            self.show_handler_error(friendly_user_message)
            return

        hello = make_oauth2_service(app_info_model)

        data = {
            "grant_type": "password",
            "client_id": app_info_model.client_id,
            "client_secret": '',
            "username": admin_user.username,
            "password": admin_user.password
        }

        resp = hello.get_raw_access_token(data=data)
        log.info(resp.url)

        if resp.status_code != 200:
            log.error("Status code %s for url = %s" % (resp.status_code, resp.url))
            log.error(data)
            log.error("Response body = %s" % resp.content)
            log.error("Redirecting to homepage with error message")
            params = {'error_message': 'Failed to generate access token'}
            self.redirect('/?=%s' % (urllib.urlencode(params)))
            return

        try:
            json_data = json.loads(resp.content)
        except ValueError, e:
            friendly_user_message = "Failed to decode JSON. Bailing"
            log.error(friendly_user_message)
            log.error("For username: %s" % admin_user.username)
            log.error("Json was: %s" % resp.content)
            log.error("Error was: %s", e)

            error_message = "%s - %s" % (friendly_user_message, resp.content)
            self.show_handler_error(error_message)
            return

        if not isinstance(json_data, dict):
            friendly_user_message = "json_data is not a dict. bailing."
            log.error(friendly_user_message)
            log.error(resp.content)
            error_message = "%s - %s" % (friendly_user_message, resp.content)
            self.show_handler_error(error_message)
            return

        if 'access_token' not in json_data:
            friendly_user_message = "The key access_token was not found \
                in the response"
            log.error(friendly_user_message)
            log.error(resp.content)
            error_message = "%s - %s" % (friendly_user_message, resp.content)
            self.show_handler_error(error_message)
            return

        access_token = json_data['access_token']
        app_info_model.access_token = access_token
        app_info_model.put()
        msg = "updated app client_id = %s successfully." % \
            app_info_model.client_id
        log.info(msg)
        self.redirect('/')


class CreateApplicationAgainstProdHandler(BaseRequestHandler):
    def get(self):
        if settings.DEBUG:
            admin_user = AdminUser(
                id='dev',
                username='replace me with a real user',
                password='with with correct pw'
            )
            admin_user.put()

            app_info = AppInfo(
                id='dev',
                client_id=settings.PROD_CLIENT,
                endpoint=settings.PROD_API,
                access_token='updateme'
            )
            app_info.put()


class SetupHandler(BaseRequestHandler):
    def get(self):
        admin_user = AdminUser(
            id=settings.ENVIRONMENT,
            username='username',
            password='password'
        )
        admin_user.put()

        app_info = AppInfo(
            id=settings.ENVIRONMENT,
            client_id=settings.CLIENT_ID,
            endpoint='updateme',
            access_token='updateme'
        )
        app_info.put()
        zendesk_credentials = ZendeskCredentials(
            id=settings.ENVIRONMENT,
            domain='https://something.zendesk.com',
            email_account='email@sayhello.com',
            api_token='ask_marina'
        )
        zendesk_credentials.put()


class UpdateAdminAccessToken(BaseRequestHandler):
    def get(self):
        admin_user = AdminUser.get_by_id(settings.ENVIRONMENT)
        app_info_model = AppInfo.get_by_id(settings.ENVIRONMENT)

        if admin_user is None:

            friendly_user_message = "User not found for id = %s" \
                % settings.ENVIRONMENT
            log.warn(friendly_user_message)
            self.show_handler_error(friendly_user_message)
            return

        if app_info_model is None:
            friendly_user_message = "AppInfo not found for id = %s" \
                % settings.ENVIRONMENT
            log.warn(friendly_user_message)
            self.show_handler_error(friendly_user_message)
            return

        hello = make_oauth2_service(app_info_model)

        data = {
            "grant_type": "password",
            "client_id": app_info_model.client_id,
            "client_secret": '',
            "username": admin_user.username,
            "password": admin_user.password
        }

        resp = hello.get_raw_access_token(data=data)
        log.info(resp.url)

        if resp.status_code != 200:
            log.error("Status code %s for url = %s" % (resp.status_code, resp.url))
            log.error(data)
            log.error("Response body = %s" % resp.content)
            log.error("Redirecting to homepage with error message")
            params = {'error_message': 'Failed to generate access token'}
            self.redirect('/?=%s' % (urllib.urlencode(params)))
            return

        try:
            json_data = json.loads(resp.content)
        except ValueError, e:
            friendly_user_message = "Failed to decode JSON. Bailing"
            log.error(friendly_user_message)
            log.error("For username: %s" % admin_user.username)
            log.error("Json was: %s" % resp.content)
            log.error("Error was: %s", e)

            error_message = "%s - %s" % (friendly_user_message, resp.content)
            self.show_handler_error(error_message)
            return

        if not isinstance(json_data, dict):
            friendly_user_message = "json_data is not a dict. bailing."
            log.error(friendly_user_message)
            log.error(resp.content)
            error_message = "%s - %s" % (friendly_user_message, resp.content)
            self.show_handler_error(error_message)
            return

        if 'access_token' not in json_data:
            friendly_user_message = "The key access_token was not found \
                in the response"
            log.error(friendly_user_message)
            log.error(resp.content)
            error_message = "%s - %s" % (friendly_user_message, resp.content)
            self.show_handler_error(error_message)
            return

        access_token = json_data['access_token']
        app_info_model.access_token = access_token
        app_info_model.put()
        msg = "updated app client_id = %s successfully." % \
            app_info_model.client_id
        log.info(msg)
        self.redirect('/')