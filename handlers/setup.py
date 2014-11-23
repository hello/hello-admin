import json
import logging as log
import urllib

import settings
from models.setup import AppInfo, AdminUser, AccessToken, UserGroup
from handlers.utils import display_error
from handlers.helpers import make_oauth2_service, ProtectedRequestHandler, SuperEngineerRequestHandler
from models.ext import ZendeskCredentials, SearchifyCredentials


class AppAPI(ProtectedRequestHandler):
    def get(self):
        """
        Get all specs of all apps or a single app if specified
        """
        id = self.request.get('id')
        self.hello_request(
            api_url="applications/{}".format(id) if id else "applications",
            type="GET"
        )


class AppScopeAPI(ProtectedRequestHandler):
    """
    Get the scopes of all apps or a single app if specified
    """
    def get(self):
        app_id = self.request.get('app_id', "")
        self.hello_request(
            api_url="applications/{}/scopes".format(app_id) if app_id else "applications/scopes",
            type="GET"
        )

    def put(self):
        req = json.loads(self.request.body)

        app_id = req.get('app_id', "")
        scopes = req.get('scopes', "")

        self.hello_request(
            api_url='applications/{}/scopes'.format(app_id),
            type="PUT",
            body_data=json.dumps(scopes)
        )


class CreateTokenAPI(ProtectedRequestHandler):
    def get(self):
        """
        Get all tokens created
        """
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
        """
        Create a token for a user requested for a specified app
        """
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


class CreateAccountAPI(ProtectedRequestHandler):
    def post(self):
        """
        Create an user account
        """
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


class ProxyAPI(ProtectedRequestHandler):
    def get(self, path):
        """
        Get proxy for cross domain call in ChartHanlder
        """
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


class RecentTokensAPI(ProtectedRequestHandler):
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


class RegisterPillAPI(ProtectedRequestHandler):
    def post(self):
        """
        Register a pill
        """
        data = dict(
            pill_id=self.request.get('pill_id'),
            account_id=self.request.get('account_id')
        )

        self.hello_request(
            api_url='device/pill',
            type='POST',
            body_data=json.dumps(data)
        )


class CreateApplicationAgainstProdAPI(SuperEngineerRequestHandler):
    def get(self):
        """
        Just helpful for local dev
        """
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


class SetupAPI(SuperEngineerRequestHandler):
    """
    Create entities for AppInfo, AdminUser and ZendeskCredentials
    """
    def get(self):

        env = AdminUser.get_by_id(settings.ENVIRONMENT)
        if env is not None:
            self.response.write('Credentials already existed')
            return

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

        searchify_credentials = SearchifyCredentials(
            id=settings.ENVIRONMENT,
            api_client='ask_tim'
        )
        searchify_credentials.put()


class UpdateAdminAccessTokenAPI(SuperEngineerRequestHandler):
    """
    Update access token after admin user and app info entities are updated and memcache is flushed
    """
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


class CreateGroupsAPI(SuperEngineerRequestHandler):
    def get(self):
        """
        Populate groups entity
        """
        output= {'data': [], 'error': ''}
        if settings.DEBUG:
            groups_data = {
                'super_engineer': 'long@sayhello.com',
                'customer_experience': 'marina@sayhello.com',
                'software': 'pang@sayhello.com, benjo@sayhello.com',
                'hardware': 'scott@sayhello.com',
                'firmware':  'chris@sayhello.com, kingshy@sayhello.com'
            }
            groups_entity = UserGroup(**groups_data)
            groups_entity.put()
            output['data'] = groups_data
        else:
            output['error'] = 'Not permitted'
        self.response.write(json.dumps(output))