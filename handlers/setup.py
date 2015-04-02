import json
import logging as log
import urllib
import settings
from models.setup import AppInfo, AdminUser, AccessToken, UserGroup
from handlers.helpers import make_oauth2_service, ProtectedRequestHandler, SuperEngineerRequestHandler
from models.ext import ZendeskCredentials, SearchifyCredentials, KeyStoreLocker, GeckoboardCredentials
from google.appengine.api import memcache


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
    def post(self):
        self.hello_request(
            api_url="applications",
            type="POST",
            body_data=json.dumps(json.loads(self.request.body))
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

        session = self.authorize_session(settings.APP_INFO)

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


class TokenAPI(ProtectedRequestHandler):
    def get(self):
        """
        List current tokens
        """
        output = {'data': [], 'error': ''}

        username = self.request.get("username", default_value="")
        app = self.request.get("app", default_value="admin-data-viewer")
        tokens = AccessToken.query_tokens(username, app)
        output['data'] = [{'username': t.username, 'token': t.token, 'app': t.app} for t in tokens]
        self.response.write(json.dumps(output))

    def post(self):
        """
        Get or create a token for a user
        """
        output = {'data': [], 'error': ''}
        post_data = json.loads(self.request.body)
        username = post_data.get("username", "")
        app = post_data.get("app", "")

        tokens = AccessToken.query_tokens(username, app)
        if tokens != []:
            output['data'] = {'token': tokens[0].token}
        else:
            password = post_data.get("password", "")
            output['data'] = self.make_tokens(username, app, password)
        self.response.write(json.dumps(output))

    def put(self):
        """
        Create a token for a user
        """
        output = {'data': [], 'error': ''}
        put_data = json.loads(self.request.body)
        username = put_data.get("username", "")
        app = put_data.get("app", "")
        password = put_data.get("password", "")

        output['data'] = self.make_tokens(username, app, password)
        self.response.write(json.dumps(output))


    def make_tokens(self, username, app, password):
        """
        :param username: username that needs a token to access
        :type username: str
        :param app: app name (client id) that username want to access via
        :type app: str
        :param password: password for username
        :type password: str
        :return: dict {'token': <token>}
        """
        app_info_model = settings.APP_INFO

        if app_info_model is None:
            self.error(500)
            self.response.write("Missing AppInfo. Bailing.")
            return

        app_info_model.client_id = app
        hello = make_oauth2_service(app_info_model)

        data = {
            "grant_type": "PASSWORD",
            "client_id": app,
            "client_secret": '',
            "username": username,
            "password": password
        }

        response = hello.get_raw_access_token(data=data)
        log.info(response.url)

        try:
            json_data = json.loads(response.content)

        except ValueError, e:
            log.error("Failed to decode JSON. Bailing")
            log.error("For username: %s" % username)
            log.error("Json was: %s" % response.content)
            log.error("Error was: %s" % e)
            self.error(500)
            return
        log.warn(response.content)
        if not isinstance(json_data, dict):
            log.error("json_data is not a dict. bailing.")
            log.error(response.content)
            self.error(500)
            return

        if 'access_token' not in json_data:
            log.error("The key access_token was not found in the response")
            log.error(response.content)
            self.error(500)
            return
        access_token = json_data['access_token']

        token = AccessToken(
            username=username,
            token=access_token,
            app=app,
            env=settings.ENVIRONMENT
        )
        token.put()
        return {'token': access_token}


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


class SetupAPI(SuperEngineerRequestHandler):
    def get(self):
        admin_user = AdminUser(
            id=settings.ENVIRONMENT,
            username='replace me with a real user',
            password='with with correct pw'
        )
        admin_user.put()
        self.update_or_create_memcache(key="admin_user", value=admin_user, environment=settings.ENVIRONMENT)

        app_info = AppInfo(
            id=settings.ENVIRONMENT,
            client_id=settings.DEFAULT_LOCAL_DEV_CLIENT_ID,
            endpoint=settings.DEFAULT_LOCAL_API_URL,
            access_token='will be created by /update',
            env=settings.ENVIRONMENT
        )
        app_info.put()
        self.update_or_create_memcache(key="app_info", value=app_info, environment= settings.ENVIRONMENT)

        zendesk_credentials = ZendeskCredentials(
            domain='https://helloinc.zendesk.com',
            email_account='marina@sayhello.com',
            api_token='ask_marina'
        )
        zendesk_credentials.put()
        self.update_or_create_memcache(key="zendesk_credentials", value=zendesk_credentials)

        searchify_credentials = SearchifyCredentials(
            api_client='ask_tim'
        )
        searchify_credentials.put()
        self.update_or_create_memcache(key="searchify_credentials", value=searchify_credentials)

        geckoboard_credentials = GeckoboardCredentials(
            api_key='ask_kevin_twohy'
        )
        geckoboard_credentials.put()
        self.update_or_create_memcache(key="geckoboard_credentials", value=geckoboard_credentials)

        self.response.write("Essential credentials initialized!")

class AppendAppInfo(SuperEngineerRequestHandler):
    def get(self):
        app_source = self.request.get("app_source", "new_api")
        app_info = AppInfo(
            id=app_source,
            client_id="application client ID",
            endpoint="https://",
            access_token='to be filled',
            env=app_source
        )
        app_info.put()
        self.update_or_create_memcache(key="app_info", value=app_info, environment=app_source)


class UpdateGeckoBoardCredentials(SuperEngineerRequestHandler):
    def get(self):
        api_key = self.request.get("api_key", "")
        geckoboard_credentials = GeckoboardCredentials(
            api_key=api_key
        )
        geckoboard_credentials.put()
        self.update_or_create_memcache(key="geckoboard_credentials", value=geckoboard_credentials)


class UpdateAdminAccessTokenAPI(SuperEngineerRequestHandler):
    """
    Update access token after admin user and app info entities are updated and memcache is flushed
    """
    def get(self):
        admin_user = settings.ADMIN_USER
        app_info_model = settings.APP_INFO

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
        self.update_or_create_memcache(key="app_info", value=app_info_model, environment=settings.ENVIRONMENT)
        msg = "updated app client_id = %s successfully." % \
            app_info_model.client_id
        log.info(msg)

        self.redirect('/refresh_memcache')


class CreateKeyStoreLockerAPI(SuperEngineerRequestHandler):
    def get(self):
        """
        Populate groups entity
        """
        for key_id in ['pvt', 'dvt', 'mp']:
            key_store_entity = KeyStoreLocker(
                id=key_id,
                private_key="Fill in private key for provisioning {} sense".format(key_id)
            )
            key_store_entity.put()
            self.update_or_create_memcache(key=key_id, value= key_store_entity)

        self.response.write("Empty RSA private keys for sense provision initialized !")

    def post(self):
        """
        Save provisioning keys to datastore
        """
        output = {'data': [], 'error': ''}
        key = self.request.get('keys', '')
        key_id = self.request.get('key_id', '')
        if not key_id or not key:
            output['error'] = 'Missing key id or key'
            self.response.write(json.dumps(output))

        priv = KeyStoreLocker.get_by_id(key_id)
        priv.private_key = key

        priv.put()
        self.update_or_create_memcache(key=key_id, value=priv)

        self.redirect('/')


class CreateGroupsAPI(ProtectedRequestHandler):
    def get(self):
        """
        Populate groups entity
        """
        output = {'data': [], 'error': ''}

        groups_data = {
            'super_engineer': 'long@sayhello.com, tim@sayhello.com, pang@sayhello.com, chris@sayhello.com, kingshy@sayhello.com, josef@sayhello.com, jimmy@sayhello.com',
            'customer_experience': 'marina@sayhello.com, tim@sayhello.com',
            'software': 'pang@sayhello.com, benjo@sayhello.com',
            'hardware': 'scott@sayhello.com, ben@sayhello.com',
            'firmware': 'chris@sayhello.com, kingshy@sayhello.com, benjo@sayhello.com, jchen@sayhello.com, km@sayhello.com, kevin@sayhello.com',
            'super_firmware': 'chris@sayhello.com, josef@sayhello.com, tim@sayhello.com',
        }
        groups_entity = UserGroup(**groups_data)
        groups_entity.put()
        self.update_or_create_memcache(key="user_group", value=groups_entity)
        output['data'] = groups_data

        self.response.write(json.dumps(output))


class ViewPermissionAPI(ProtectedRequestHandler):
    def get(self):
        """
        See if user has permission to view data
        """
        viewer = self.current_user.email()
        output = {
            "viewer": viewer,
            "has_access_to_customers_data": viewer in self.customer_experience() or viewer in self.super_engineer()
        }
        self.response.write(json.dumps(output))
