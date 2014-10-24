#!/usr/bin/env python
#
# Copyright 2007 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
import webapp2
import jinja2
import copy
import settings
import json
import logging as log
import os
import datetime as dt
import urllib
from google.appengine.api import users
from rauth import OAuth2Service
from models import AppInfo, AdminUser, AccessToken
from helpers import display_error

JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True)


class BaseRequestHandler(webapp2.RequestHandler):
    def log_and_redirect(self, redirect_path, redirect_message):
        pass

    def display_error(self, error_message, status_code=500):
        template = JINJA_ENVIRONMENT.get_template('templates/error.html')
        self.error(status_code)
        template_values = {
            'error_message': error_message,
            'status_code': status_code
        }
        self.response.write(template.render(template_values))
        return

    def _extra_context(self, context):
        extras = {
            "logout_url": users.create_logout_url('/'),
            "user": self.current_user
        }

        context.update(extras)
        return context

    def render(self, template_file, template_values=None):
        context = {} if template_values is None else copy.copy(template_values)
        template = JINJA_ENVIRONMENT.get_template(template_file)
        return template.render(self._extra_context(context))

    def render_to_response(self, template_file, context={}):
        s = self.render(template_file, template_values=context)
        self.response.out.write(s)

    @property
    def current_user(self):
        return users.get_current_user()


def make_oauth2_service(app_info_model):
    service = OAuth2Service(
        client_id=app_info_model.client_id,
        client_secret='',
        name='hello',
        authorize_url=app_info_model.endpoint + 'oauth2/authorize',
        access_token_url=app_info_model.endpoint + 'oauth2/token',
        base_url=app_info_model.endpoint
    )
    return service


def get_user(app_info_model):
    service = OAuth2Service(
        client_id=app_info_model.client_id,
        client_secret='',
        name='hello',
        authorize_url=app_info_model.endpoint + 'oauth2/authorize',
        access_token_url=app_info_model.endpoint + 'oauth2/token',
        base_url=app_info_model.endpoint
    )
    return service


def get_most_recent_tokens(n=10):
    return AccessToken.query_tokens()


class MainHandler(BaseRequestHandler):
    def get(self):
        self.render_to_response('templates/index.html')


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

        info_query = AppInfo.query().order(-AppInfo.created)
        results = info_query.fetch(1)
        log.info("Querying datastore for most recent AppInfo")

        if not results:
            self.error(500)
            self.response.write("Missing AppInfo. Bailing.")
            return

        app_info_model = results[0]
        hello = make_oauth2_service(app_info_model)

        session = hello.get_session(app_info_model.access_token)
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


class CreateApplicationHandler(BaseRequestHandler):
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


class CreateApplicationAgainstProdHandler(BaseRequestHandler):
    def get(self):
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


class UpdateAdminAccessToken(BaseRequestHandler):
    def get(self):
        admin_user = AdminUser.get_by_id(settings.ENVIRONMENT)
        app_info_model = AppInfo.get_by_id(settings.ENVIRONMENT)

        if admin_user is None:

            friendly_user_message = "User not found for id = %s" \
                % settings.ENVIRONMENT
            log.warn(friendly_user_message)
            self.display_error(friendly_user_message)
            return

        if app_info_model is None:
            friendly_user_message = "AppInfo not found for id = %s" \
                % settings.ENVIRONMENT
            log.warn(friendly_user_message)
            self.display_error(friendly_user_message)
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
            self.display_error(error_message)
            return

        if not isinstance(json_data, dict):
            friendly_user_message = "json_data is not a dict. bailing."
            log.error(friendly_user_message)
            log.error(resp.content)
            error_message = "%s - %s" % (friendly_user_message, resp.content)
            self.display_error(error_message)
            return

        if 'access_token' not in json_data:
            friendly_user_message = "The key access_token was not found \
                in the response"
            log.error(friendly_user_message)
            log.error(resp.content)
            error_message = "%s - %s" % (friendly_user_message, resp.content)
            self.display_error(error_message)
            return

        access_token = json_data['access_token']
        app_info_model.access_token = access_token
        app_info_model.put()
        msg = "updated app client_id = %s successfully." % \
            app_info_model.client_id
        log.info(msg)
        self.redirect('/')


class RegisterPillHandler(BaseRequestHandler):
    def post(self):

        info_query = AppInfo.query().order(-AppInfo.created)
        results = info_query.fetch(1)
        log.info("Querying datastore for most recent AppInfo")

        if not results:
            self.error(500)
            self.response.write("Missing AppInfo. Bailing.")
            return

        headers = {
            'Content-type': 'application/json',
            'Accept': 'application/json'
        }
        app_info_model = results[0]
        hello = make_oauth2_service(app_info_model)

        session = hello.get_session(app_info_model.access_token)
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
            error_message = "%s" % (resp.content)
            self.display_error(error_message, status_code=resp.status_code)
            return

        self.redirect('/')


class ChartHandler(BaseRequestHandler):
    def get(self):
        template = JINJA_ENVIRONMENT.get_template('templates/charts.html')
        tokens = get_most_recent_tokens()
        day = dt.datetime.strftime(dt.datetime.now(), "%Y-%m-%d")

        self.response.write(template.render({'tokens': tokens, 'day': day}))


class ProxyHandler(BaseRequestHandler):
    def get(self, path):
        data = []
        info_query = AppInfo.query().order(-AppInfo.created)
        results = info_query.fetch(1)
        log.info("Querying datastore for most recent AppInfo")

        if not results:
            self.error(500)
            self.response.write("Missing AppInfo. Bailing.")
            return

        app_info_model = results[0]
        hello = make_oauth2_service(app_info_model)

        session = hello.get_session(self.request.get('access_token'))

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


class FetchUserAPI(BaseRequestHandler):
    def get(self):
        output = {'user_profile': {}, 'error': ''}
        try:
            email = self.request.get('email')
            info_query = AppInfo.query().order(-AppInfo.created)
            results = info_query.fetch(1)
            if not results:
                self.error(500)
                self.response.write("Missing AppInfo. Bailing.")

            app_info_model = results[0]
            hello = make_oauth2_service(app_info_model)
            session = hello.get_session(app_info_model.access_token)
            response = session.get("account/q", params={'email': email})

            if response.status_code == 200:
                log.info('SUCCESS - {}'.format(response.content))
                output['user_profile'] = response.json()
            else:
                raise RuntimeError('{}: Failed to retrieve user "{}"'.format(
                    response.status_code,
                    email
                ))
        except Exception as e:
            output['error'] = display_error(e)
        self.response.write(json.dumps(output))


class UserDashboardHandler(BaseRequestHandler):
    def get(self):
        template = JINJA_ENVIRONMENT.get_template('templates/user_dashboard.html')
        self.response.write(template.render({}))


class FetchRecentUsersAPI(BaseRequestHandler):
    def get(self):
        output = {'data': [], 'error': ''}
        try:
            info_query = AppInfo.query().order(-AppInfo.created)
            results = info_query.fetch(1)

            if not results:
                self.error(500)
                self.response.write("Missing AppInfo. Bailing.")
                return

            app_info_model = results[0]
            hello = make_oauth2_service(app_info_model)
            session = hello.get_session(app_info_model.access_token)
            response = session.get("account/recent")

            if response.status_code == 200:
                log.info('SUCCESS - {}'.format(response.content))
                output['data'] = [{'email': r['email'], 'last_modified': r['last_modified']} for r in response.json()]
            else:
                raise RuntimeError('{}: fail to retrieve recent users'.format(response.status_code))
        except Exception as e:
            output['error'] = display_error(e)
            log.error('ERROR: {}'.format(display_error(e)))
        self.response.write(json.dumps(output))


class RecentUsersViewHandler(BaseRequestHandler):
    def get(self):
        self.render_to_response('templates/user_dashboard.html')



