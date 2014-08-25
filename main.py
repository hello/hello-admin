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

from google.appengine.ext import ndb
import settings
import json
import logging
import os
import urllib
from rauth import OAuth2Service
import requests

class AppInfo(ndb.Model):
    client_id = ndb.StringProperty(required=True)
    endpoint = ndb.StringProperty(required=True)
    access_token = ndb.StringProperty(required=True)
    created = ndb.DateTimeProperty(auto_now_add=True)

class AdminUser(ndb.Model):
    username = ndb.StringProperty(required=True)
    password = ndb.StringProperty(required=True)
    created = ndb.DateTimeProperty(auto_now_add=True)

class BaseRequestHandler(webapp2.RequestHandler):
    def log_and_redirect(self, redirect_path, redirect_message):
        pass

    def display_error(self, error_message):
        template = JINJA_ENVIRONMENT.get_template('templates/error.html')
        self.error(500)
        template_values = {'error_message' : error_message}
        self.response.write(template.render(template_values))
        return


JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True)


def make_oauth2_service(app_info_model):
    service = OAuth2Service(
        client_id= app_info_model.client_id,
        client_secret='',
        name='hello',
        authorize_url= app_info_model.endpoint + 'oauth2/authorize',
        access_token_url= app_info_model.endpoint + 'oauth2/token',
        base_url=app_info_model.endpoint)
    return service


class MainHandler(BaseRequestHandler):
    def get(self):
        access_token = self.request.get('access_token', default_value='')
        error_message = self.request.get('error_message', default_value='')
        app_info_model = AppInfo.get_by_id(settings.ENVIRONMENT)
        logging.info("Querying datastore for most recent AppInfo")

        if app_info_model is None:
            self.error(500)
            self.response.write("Missing AppInfo. Bailing.")
            return

        hello = make_oauth2_service(app_info_model)
        headers = {'Content-type': 'application/json', 'Accept': 'application/json'}

        session = hello.get_session(app_info_model.access_token)
        resp = session.get('applications', headers=headers)

        template_values = {
            'applications' : resp.json(),
            'access_token' : access_token,
            'error' : error_message, 
        }

        if resp.status_code != 200:
            err = resp.json()
            template_values['error'] = "API CALL %s - HTTP %s. Check the logs for details." % (err['code'], err['message'])

        template = JINJA_ENVIRONMENT.get_template('templates/index.html')
        self.response.write(template.render(template_values))

class CreateTokenHandler(BaseRequestHandler):
    def post(self):
        username = self.request.get("username", default_value="tim@sayhello.com")
        password = self.request.get("password", default_value="tim")
        client_id = self.request.get('client_id', default_value="unknown")
        
        logging.info(username)

        
        app_info_model = AppInfo.get_by_id(settings.ENVIRONMENT)

        if app_info_model is None:
            self.error(500)
            self.response.write("Missing AppInfo. Bailing.")
            return

        # override here because we want to generate a token for a given app, not necessarily the admin one
        app_info_model.client_id = client_id
        hello = make_oauth2_service(app_info_model)

        data = {
            "grant_type" : "password",
            "client_id" : app_info_model.client_id,
            "client_secret" : '',
            "username" : username,
            "password" : password
        }

        resp = hello.get_raw_access_token(data=data)
        logging.info(resp.url)

        try:
            json_data = json.loads(resp.content)
        except ValueError, e:
            logging.error("Failed to decode JSON. Bailing")
            logging.error("For username: %s" % username)
            logging.error("Json was: %s" % resp.content)
            self.error(500)
            return
        logging.warn(resp.content)
        if not isinstance(json_data, dict):
            logging.error("json_data is not a dict. bailing.")
            logging.error(resp.content)
            self.error(500)
            return

        if 'access_token' not in json_data:
            logging.error("The key access_token was not found in the response")
            logging.error(resp.content)
            self.error(500)
            return

        access_token = json_data['access_token']
        session = hello.get_session(access_token)
        # account_resp = session.get('account')
        # if account_resp.status_code != 200:
        #     logging.error("Could not fetch account info")
        #     logging.error("Status code was: %s and response was: %s" % (account_resp.status_code, account_resp.content))
        #     self.error(500)
        #     return

        template_values = {
            'message': "Access token = %s" % access_token
        }

        # template = JINJA_ENVIRONMENT.get_template('templates/index.html')
        # self.response.write(template.render(template_values))
        self.redirect('/?' + urllib.urlencode({'access_token' : access_token}))


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

        
        headers = {'Content-type': 'application/json', 'Accept': 'application/json'}

        info_query = AppInfo.query().order(-AppInfo.created)
        results = info_query.fetch(1)
        logging.info("Querying datastore for most recent AppInfo")

        if not results:
            self.error(500)
            self.response.write("Missing AppInfo. Bailing.")
            return

        app_info_model = results[0]
        hello = make_oauth2_service(app_info_model)
        
        session = hello.get_session(app_info_model.access_token)
        logging.info("Submitting data")
        logging.info(data)
        resp = session.post('account', data=json.dumps(data), headers=headers)

        logging.info(resp.url)
        logging.info(resp.status_code)
        logging.info(resp.content)

        template_values = {}
        if resp.status_code == 409:
            template_values['error'] = '[HTTP %s] Account already exists. Response: %s ' % (resp.status_code, resp.content)
        elif resp.status_code == 200:
            template_values['message'] = "User %s created successfully" % email
        else:
            template_values['error'] = '[HTTP %s] Response: %s ' % (resp.status_code, resp.content)

        template = JINJA_ENVIRONMENT.get_template('templates/index.html')
        self.response.write(template.render(template_values))

class CreateApplicationHandler(BaseRequestHandler):
    def get(self):

        admin_user = AdminUser(id=settings.ENVIRONMENT, username='username', password='password')
        admin_user.put()

        app_info = AppInfo(id=settings.ENVIRONMENT, client_id = settings.CLIENT_ID, endpoint = 'updateme', access_token = 'updateme')
        app_info.put()


class UpdateAdminAccessToken(BaseRequestHandler):
    def get(self):
        admin_user = AdminUser.get_by_id(settings.ENVIRONMENT)
        app_info_model = AppInfo.get_by_id(settings.ENVIRONMENT)

        if admin_user is None:

            friendly_user_message = "User not found for id = %s" % settings.ENVIRONMENT
            logging.warn(friendly_user_message)
            self.display_error(friendly_user_message)
            return

        if app_info_model is None:
            friendly_user_message = "AppInfo not found for id = %s" % settings.ENVIRONMENT
            logging.warn(friendly_user_message)
            self.display_error(friendly_user_message)
            return

        hello = make_oauth2_service(app_info_model)

        data = {
            "grant_type" : "password",
            "client_id" : app_info_model.client_id,
            "client_secret" : '',
            "username" : admin_user.username,
            "password" : admin_user.password
        }

        resp = hello.get_raw_access_token(data=data)
        logging.info(resp.url)

        if resp.status_code != 200:
            logging.error("Status code %s for url = %s" % (resp.status_code, resp.url))
            logging.error(data)
            logging.error("Response body = %s" % resp.content)
            logging.error("Redirecting to homepage with error message")
            self.redirect('/?=%s' % (urllib.urlencode({'error_message' : 'Failed to generate access token'})))
            return

        try:
            json_data = json.loads(resp.content)
        except ValueError, e:
            friendly_user_message = "Failed to decode JSON. Bailing" 
            logging.error(user_message)
            logging.error("For username: %s" % username)
            logging.error("Json was: %s" % resp.content)

            error_message = "%s - %s" % (friendly_user_message, resp.content)
            self.display_error(error_message)
            return

        if not isinstance(json_data, dict):
            friendly_user_message = "json_data is not a dict. bailing."
            logging.error(friendly_user_message)
            logging.error(resp.content)
            error_message = "%s - %s" % (friendly_user_message, resp.content)
            self.display_error(error_message)
            return

        if 'access_token' not in json_data:
            friendly_user_message = "The key access_token was not found in the response"
            logging.error(friendly_user_message)
            logging.error(resp.content)
            error_message = "%s - %s" % (friendly_user_message, resp.content)
            self.display_error(error_message)
            return

        access_token = json_data['access_token']
        app_info_model.access_token = access_token
        app_info_model.put()
        logging.info("updated app (client_id = %s) successfully." % app_info_model.client_id)
        self.redirect('/')

app = webapp2.WSGIApplication([
    ('/', MainHandler),
    ('/access_token', CreateTokenHandler),
    ('/create_account', CreateAccountHandler),
    ('/create/app', CreateApplicationHandler),
    ('/update', UpdateAdminAccessToken),
], settings.DEBUG)
