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

import json
import logging
import os
from rauth import OAuth2Service
import requests

class AppInfo(ndb.Model):
    client_id = ndb.StringProperty(required=True)
    endpoint = ndb.StringProperty(required=True)
    access_token = ndb.StringProperty(required=True)
    created = ndb.DateTimeProperty(auto_now_add=True)

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


class MainHandler(webapp2.RequestHandler):
    def get(self):
        template_values = {}
        template = JINJA_ENVIRONMENT.get_template('templates/index.html')
        self.response.write(template.render(template_values))

class CreateTokenHandler(webapp2.RequestHandler):
    def post(self):
        username = self.request.get("username", default_value="tim@sayhello.com")
        password = self.request.get("password", default_value="tim")
        
        logging.info(username)

        info_query = AppInfo.query().order(-AppInfo.created)
        results = info_query.fetch(1)
        logging.info("Querying datastore for most recent AppInfo")

        if not results:
            self.error(500)
            self.response.write("Missing AppInfo. Bailing.")
            return

        app_info_model = results[0]
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

        template = JINJA_ENVIRONMENT.get_template('templates/index.html')
        self.response.write(template.render(template_values))


class CreateAccountHandler(webapp2.RequestHandler):
    def post(self):
        firstname = self.request.get("firstname")
        lastname = self.request.get("lastname")
        email = self.request.get("email")
        password = self.request.get("password")
        gender = self.request.get("gender")
        height = self.request.get("height")
        weight = self.request.get("weight")
        tz = self.request.get("tz")


        data = {
            "firstname": firstname,
            "lastname": lastname,
            "email": email,
            "password": password,
            "gender": gender,
            "height": height,
            "weight": weight,
            "tz": tz
        }

        if not all([firstname, lastname, email, password, gender, height, weight, tz]):
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

app = webapp2.WSGIApplication([
    ('/', MainHandler),
    ('/access_token', CreateTokenHandler),
    ('/create_account', CreateAccountHandler),
], debug=True)
