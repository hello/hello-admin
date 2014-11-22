import jinja2
import os
import settings
import webapp2
import json
from copy import copy
from google.appengine.api import users
from models.setup import AppInfo, UserGroup
from rauth import OAuth2Service
from rauth.session import OAuth2Session
from utils import stripStringToList
from utils import display_error

this_file_path = os.path.dirname(__file__)
JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.split(this_file_path)[0]),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True
)


class BaseRequestHandler(webapp2.RequestHandler):
    def log_and_redirect(self, redirect_path, redirect_message):
        pass

    def show_handler_error(self, error_message, status_code=500):
        """
        :param error_message: custom error alert
        :type error_message: str
        :param status_code: status code of the response
        :type status_code: int
        """

        template = JINJA_ENVIRONMENT.get_template('templates/error.html')
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
            "user": self.current_user.email().split('@')[0].title(),
            "version": os.environ['CURRENT_VERSION_ID'],
            "env": settings.ENVIRONMENT
        }

        context.update(extras)
        return context

    def render(self, template_file, template_values=None):
        """
        :param template_file: html file to be rendered
        :type template_file: str
        :param context: a dictionary of extra value to be displayed
        :type context: dict
        """
        context = {} if template_values is None else copy(template_values)
        template = JINJA_ENVIRONMENT.get_template(template_file)
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

    def authorize_session(self, token=None):
        """
        :param token: token issued to user to use an specific app
        :type token: str
        """
        info_query = AppInfo.query().order(-AppInfo.created)
        results = info_query.fetch(1)

        if not results:
            self.error(500)
            self.response.write("Missing AppInfo. Bailing.")

        app_info_model = results[0]
        hello = make_oauth2_service(app_info_model)

        if token is None:  # token could be set to impersonate an user otherwise
            token = app_info_model.access_token
        return hello.get_session(token)

    def hello_request(self, api_url, body_data="", url_params={}, type="GET"
                          , impersonatee_token=None, test_mode=False):
        """
        :param api_url: api URL
        :type api_url: str
        :param body_data: data to be sent with the request body
        :type api_url: str
        :param url_params: URL parameters
        :type url_params: dict
        :param type: http request type, one of ["GET", "POST", "PUT", "DELETE"]
        :type api_url: str
        :return a ResponseOutput object in test mode  or a string otherwise
        """

        output = ResponseOutput()
        session = self.authorize_session(token=impersonatee_token)
        request_detail = {
            "headers": {'Content-Type': 'application/json'},
        }

        if body_data and type in ['PUT', 'POST', 'PATCH']:
            request_detail['data'] = body_data
        if url_params:
            request_detail['params'] = url_params
        try:
            response = getattr(OAuth2Session, type.lower())(session, api_url, **request_detail)
            output.set_status(response.status_code)

            if response.status_code == 200:
                output.set_data(response.json())

        except Exception as e:
            output.set_error(display_error(e))

        if test_mode is True:
            return output
        else:
            self.hello_render(output)

    def hello_render(self, output):
        return self.response.write(render_response(output))

    @property
    def current_user(self):
        return users.get_current_user()

    def error_log(self):
        return

def make_oauth2_service(app_info_model):
    """
    :param app_info_model: an instance of AppInfo that store auth data for a certain app
    :type app_info_model: :class:`AppInfo`
    """
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
    """
    :param app_info_model: description
    :type app_info_model: :class:`AppInfo`
    """
    service = OAuth2Service(
        client_id=app_info_model.client_id,
        client_secret='',
        name='hello',
        authorize_url=app_info_model.endpoint + 'oauth2/authorize',
        access_token_url=app_info_model.endpoint + 'oauth2/token',
        base_url=app_info_model.endpoint
    )
    return service


class ProtectedRequestHandler(BaseRequestHandler):
    """
    Restrict general access and define priviedge users lists
    """
    def __init__(self, request, response):
        super(ProtectedRequestHandler, self).__init__()
        self.initialize(request, response)
        self.restrict()

    def restrict(self):
        if not self.is_restricted_primary():
            return
        if self.is_restricted_secondary():
            self.redirect('/error')

    def is_restricted_primary(self):
        return not self.current_user.email() in self.super_engineer()

    def is_restricted_secondary(self):
        """
        This method is to be extended by the heir handler
        """
        pass

    ## Retrieve groups grom DataStore
    @property
    def groups_entity(self):
        return UserGroup.query_groups().fetch(1)[0]

    def super_engineer(self):
        return stripStringToList(self.groups_entity.super_engineer)

    def customer_experience(self):
        return stripStringToList(self.groups_entity.customer_experience)

    def software(self):
        return stripStringToList(self.groups_entity.software)

    def firmware(self):
        return stripStringToList(self.groups_entity.firmware)

    def hardware(self):
        return stripStringToList(self.groups_entity.hardware)

class CustomerExperienceRequestHandler(ProtectedRequestHandler):
    """
    Grant access to only customer experience team members
    """
    def is_restricted_secondary(self):
        return not self.current_user.email() in super(CustomerExperienceRequestHandler, self).customer_experience()


class SoftwareRequestHandler(ProtectedRequestHandler):
    """
    Grant access to only software team members
    """
    def is_restricted_secondary(self):
        return not self.current_user.email() in super(SoftwareRequestHandler, self).software()


class FirmwareRequestHandler(ProtectedRequestHandler):
    """
    Grant access to only firmware team members
    """
    def is_restricted_secondary(self):
        return not self.current_user.email() in super(FirmwareRequestHandler, self).firmware()


class HardwareRequestHandler(ProtectedRequestHandler):
    """
    Grant access to only hardware team members
    """
    def is_restricted_secondary(self):
        return not self.current_user.email() in super(HardwareRequestHandler, self).hardware()


class SuperEngineerRequestHandler(ProtectedRequestHandler):
    """
    Grant admin to only super engineers
    """
    def is_restricted_secondary(self):
        return not self.current_user.email() in super(SuperEngineerRequestHandler, self).super_engineer()


class ResponseOutput():
    def __init__(self):
        self.data = []
        self.error = ""
        self.status = 401

    def set_data(self, data):
        if not isinstance(data, list) and not isinstance(data, dict):
            raise TypeError("Response data must be a list or a dict")
        self.data = data

    def set_error(self, error):
        if not isinstance(error, str):
            raise TypeError("Response error must be a string")
        self.error = error

    def set_status(self, status):
        if not isinstance(status, int) and not isinstance(status, long):
            raise TypeError("Response status must be an int or a longs")
        self.status = status


def render_response(response_output):
    """
    :param response_output: response output
    :type response_output: ResponseOutput
    :return json-serialized data as a str
    """
    return json.dumps(response_output.__dict__)
