import os
import logging as log
from copy import copy
import urllib

from google.appengine.api.namespace_manager import namespace_manager
from google.appengine.api import urlfetch

import jinja2
import json
import webapp2
from google.appengine.api import users
from google.appengine.api import memcache

from core.models.response import ResponseOutput
from core.models.slack import Slack
from core.utils.common import stripStringToList, extract_dicts_by_fields
from models.ext import SearchifyCredentials, ZendeskCredentials, GeckoboardCredentials
from rauth import OAuth2Service
from rauth.session import OAuth2Session
import settings
from models.setup import AppInfo
from models.setup import AdminUser
from models.setup import UserGroup
from core.models.authentication import ApiInfo, SURIPU_APP_ID, SURIPU_ADMIN_ID, SURIPU_APP_V2_ID, AVAILABLE_NAMESPACES, \
    LOCAL_AVAILABLE_NAMESPACES


class BaseRequestHandler(webapp2.RequestHandler):
    def __init__(self, request, response):
        super(BaseRequestHandler, self).__init__()
        self.initialize(request, response)
        self.persist_namespace()

    @property
    def jinja_env(self):
        return jinja2.Environment(
            loader=jinja2.FileSystemLoader("template"),
            extensions=['jinja2.ext.autoescape'],
            autoescape=True
        )

    @property
    def groups_entity(self):
        return UserGroup.query().order(-UserGroup.created).get()

    def super_engineer(self):
        if not self.groups_entity:
            return []
        return stripStringToList(self.groups_entity.super_engineer)

    @property
    def namespace(self):
        return namespace_manager.get_namespace() or "production"

    def persist_namespace(self):
        namespace_from_cookies = self.request.cookies.get("namespace", None)
        namespace = namespace_from_cookies or "production"
        namespace_manager.set_namespace(namespace)

    @staticmethod
    def get_admin_user():
        return AdminUser.get_by_id(settings.ENVIRONMENT)

    def get_default_access_token(self):
        api_info = self.suripu_admin
        if api_info is None:
            self.error(500)
        else:
            return api_info.token

    def log_and_redirect(self, redirect_path, redirect_message):
        pass

    def show_handler_error(self, error_message, status_code=500):
        """
        :param error_message: custom error alert
        :type error_message: str
        :param status_code: status code of the response
        :type status_code: int
        """

        template = self.jinja_env.get_template('templates/error.html')
        self.error(status_code)
        template_values = {
            'error_message': error_message,
            'status_code': status_code
        }
        self.response.write(template.render(template_values))
        return

    def _extra_context(self, context):
        """
        :param context: a dictionary of extra value to be displayed
        :type context: dict
        """
        extras = {
            "logout_url": users.create_logout_url('/'),
            "user": self.current_user_email,
            "is_super_engineer": self.current_user_email in self.super_engineer(),
            "version": os.environ['CURRENT_VERSION_ID'],
            "env": settings.ENVIRONMENT,
            "available_namespaces": LOCAL_AVAILABLE_NAMESPACES if settings.DEBUG is True else AVAILABLE_NAMESPACES,
            "namespace": self.namespace
        }

        context.update(extras)
        return context

    @property
    def suripu_app(cls):
        return ApiInfo.get_by_id(SURIPU_APP_ID)

    @property
    def suripu_app_v2(cls):
        return ApiInfo.get_by_id(SURIPU_APP_V2_ID)

    @property
    def suripu_admin(cls):
        return ApiInfo.get_by_id(SURIPU_ADMIN_ID)

    @property
    def searchify_credentials(self):
        return SearchifyCredentials.query().get()

    @property
    def zendesk_credentials(self):
        return ZendeskCredentials.query().get()

    @property
    def geckoboard_credentials(self):
        return GeckoboardCredentials.query().get()

    @property
    def papertrail_credentials(self):
        return "AllkLtsvxLdFfsneCb3"

    @property
    def slack_deploys_webhok(self):
        return 'https://hooks.slack.com/services/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'

    @property
    def slack_stats_webhook(self):
        return 'https://hooks.slack.com/services/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'

    @property
    def slack_admin_webhook(self):
        return 'https://hooks.slack.com/services/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'

    @property
    def slack_dust_calibration_webhook(self):
        return 'https://hooks.slack.com/services/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'

    def render(self, template_file, template_values=None):
        """
        :param template_file: html file to be rendered
        :type template_file: str
        :param context: a dictionary of extra value to be displayed
        :type context: dict
        """
        context = {} if template_values is None else copy(template_values)
        template = self.jinja_env.get_template(template_file)
        return template.render(self._extra_context(context))

    def render_to_response(self, template_file, context={}):
        """
        :param template_file: html file to be rendered
        :type template_file: str
        :param context: a dictionary of extra value to be displayed
        :type context: dict
        """
        s = self.render(template_file, template_values=context)
        self.response.write(s)

    def hello_request(self, api_url, body_data="", url_params={}, type="GET", raw_output=False, filter_fields=[]
                          , access_token=None, api_info=None, content_type='application/json'):
        """
        :param api_url: api URL
        :type api_url: str
        :param body_data: data to be sent with the request body
        :type body_data: str
        :param url_params: URL parameters
        :type url_params: dict
        :param type: http request type, one of ["GET", "POST", "PUT", "PATCH", "DELETE"]
        :type type: str
        :param access_token: optional token to represent a user
        :type access_token: str
        :param raw_output: boolean value to control output, if raw_ouput is True, return an object rather than a response
        :type raw_output: bool
        :param filter_fields: optional list of fields for filtering
        :type filter_fields: list
        :return a ResponseOutput object in test mode  or a string otherwise
        """
        if access_token is None:
            access_token = self.get_default_access_token()
        if api_info is None:
            api_info = self.suripu_admin

        output = ResponseOutput()
        output.set_viewer(self.current_user_email if self.current_user is not None else "cron-bot")

        headers = {
            "Content-Type": content_type,
            "X-Hello-Admin": self.current_user_email,
            "X-Appengine-Country": self.request.headers.get("X-Appengine-Country", ""),
            "X-Appengine-Region": self.request.headers.get("X-Appengine-Region", ""),
            "X-Appengine-City": self.request.headers.get("X-Appengine-City", ""),
            "X-Appengine-CityLatLong": self.request.headers.get("X-Appengine-CityLatLong", ""),
            "Authorization" : "Bearer %s" % access_token
        }


        verbs_to_methods = {
            "GET": urlfetch.GET,
            "POST": urlfetch.POST,
            "PUT": urlfetch.PUT,
            "PATCH": urlfetch.PATCH,
            "DELETE": urlfetch.DELETE,
        }
        
        method = verbs_to_methods[type]
        query_params = urllib.urlencode(url_params)
        url = api_info.domain + api_url
        if query_params:
            url = url +'?' + query_params
        response = urlfetch.fetch(
            url=url,
            payload=body_data,
            method=method,
            headers=headers)

        output.set_status(response.status_code)
        log.info("%s %s", response.status_code, url)

        content = response.content.decode('utf-8', "replace")
        try:
            log.info("%s %s", url, content)
        except Exception, e:
            log.error("%s", e)

        if response.status_code == 200:
            if response.headers.get("content-type") == "text/plain":
                output.set_data(response.content)
            else:
                try:
                    response_data = json.loads(response.content)
                    if filter_fields != []:
                        response_data = extract_dicts_by_fields(response_data, filter_fields)
                    output.set_data(response_data)
                except ValueError:
                    output.set_data({})
        else:
            output.set_error(response.content)
            self.response.headers.add_header("err", response.content)

        if raw_output is True:
            return output
        else:
            return self.render_response(output)

    def render_response(self, output):
        return self.response.write(output.get_serialized_output())

    def update_or_create_memcache(self, key, value, environment="", time=86400):
        memcache_key = key + environment
        if memcache.get(memcache_key) is not None:
            memcache.set(key=memcache_key, value=value, time=time)
        else:
            memcache.add(key=memcache_key, value=value, time=time)

    @property
    def current_user(self):
        return users.get_current_user()

    @property
    def current_user_email(self):
        if self.current_user is None:
            return "cron bot"
        else:
            return self.current_user.email()

    def error_log(self):
        return

    @property
    def slack_pusher(self):
        return Slack(self.namespace, settings.SLACK_WEBHOOK)


class ProtectedRequestHandler(BaseRequestHandler):
    """
    Restrict general access and define priviedge users lists
    """
    def __init__(self, request, response):
        super(ProtectedRequestHandler, self).__init__(request, response)
        if settings.DEBUG is False:
            self.restrict()

    def restrict(self):
        if self.current_user_email == "customersupport@sayhello.com":
            self.redirect('/error')
        elif not self.is_restricted_primary():
            return
        elif self.is_restricted_secondary():
            self.redirect('/error')

    def is_restricted_primary(self):
        return not self.current_user_email in self.super_engineer()

    def is_restricted_secondary(self):
        """
        This method is to be extended by the heir handler
        """
        pass

    ## Retrieve groups grom DataStore

    def customer_experience(self):
        return stripStringToList(self.groups_entity.customer_experience)

    def software(self):
        return stripStringToList(self.groups_entity.software)

    def firmware(self):
        return stripStringToList(self.groups_entity.firmware)

    def hardware(self):
        return stripStringToList(self.groups_entity.hardware)

    def settings_moderator(self):
        return stripStringToList(self.groups_entity.settings_moderator)

    def token_maker(self):
        return stripStringToList(self.groups_entity.token_maker)

    def shipping(self):
        return stripStringToList(self.groups_entity.shipping)

    def contractor(self):
        return stripStringToList(self.groups_entity.contractor)

    def super_firmware(self):
        return stripStringToList(self.groups_entity.super_firmware)


class CustomerExperienceRequestHandler(ProtectedRequestHandler):
    """
    Grant access to only customer experience team members
    """
    def is_restricted_secondary(self):
        return not self.current_user_email in super(CustomerExperienceRequestHandler, self).customer_experience()


class SoftwareRequestHandler(ProtectedRequestHandler):
    """
    Grant access to only software team members
    """
    def is_restricted_secondary(self):
        return not self.current_user_email in super(SoftwareRequestHandler, self).software()


class FirmwareRequestHandler(ProtectedRequestHandler):
    """
    Grant access to only firmware team members
    """
    def is_restricted_secondary(self):
        return not self.current_user_email in super(FirmwareRequestHandler, self).firmware()


class HardwareRequestHandler(ProtectedRequestHandler):
    """
    Grant access to only hardware team members
    """
    def is_restricted_secondary(self):
        return not self.current_user_email in super(HardwareRequestHandler, self).hardware()

class SettingsModeratorRequestHandler(ProtectedRequestHandler):
    """
    Grant access to only hardware team members
    """
    def is_restricted_secondary(self):
        return not self.current_user_email in super(SettingsModeratorRequestHandler, self).settings_moderator()

class SuperFirmwareRequestHandler(ProtectedRequestHandler):
    """
    Grant access to only super engineers
    """
    def is_restricted_secondary(self):
        return not self.current_user_email in super(SuperFirmwareRequestHandler, self).super_firmware()

class TokenMakerRequestHandler(ProtectedRequestHandler):
    """
    Grant access to only hardware team members
    """
    def is_restricted_secondary(self):
        return not self.current_user_email in super(TokenMakerRequestHandler, self).token_maker()

class ShippingRequestHandler(ProtectedRequestHandler):
    """
    Grant access to only shipping team members plus contractor
    """
    def restrict(self):
        if not self.is_restricted_primary() or self.current_user_email in self.contractor():
            return
        elif self.is_restricted_secondary():
            self.redirect('/error')
            return

    def is_restricted_secondary(self):
        return not self.current_user_email in super(ShippingRequestHandler, self).shipping()


class SuperEngineerRequestHandler(ProtectedRequestHandler):
    """
    Grant access to only super engineers
    """
    def is_restricted_secondary(self):
        return not self.current_user_email in super(SuperEngineerRequestHandler, self).super_engineer()


class BaseCron(ProtectedRequestHandler):
    def persist_namespace(self):
        namespace_manager.set_namespace("production")
