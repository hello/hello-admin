import webapp2
import jinja2
from google.appengine.api import users
import os
from copy import copy
from rauth import OAuth2Service
from models.setup import AppInfo

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
        :type error_message: str
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
        :type context: dict
        """
        extras = {
            "logout_url": users.create_logout_url('/'),
            "user": self.current_user.email()
        }

        context.update(extras)
        return context

    def render(self, template_file, template_values=None):
        context = {} if template_values is None else copy(template_values)
        template = JINJA_ENVIRONMENT.get_template(template_file)
        return template.render(self._extra_context(context))

    def render_to_response(self, template_file, context={}):
        """
        :type template_file: str
        :type context: dict
        """
        s = self.render(template_file, template_values=context)
        self.response.write(s)

    def authorize_session(self, token=None):
        """
        :param token: token issued to user to use an specific app
        """
        info_query = AppInfo.query().order(-AppInfo.created)
        results = info_query.fetch(1)

        if not results:
            self.error(500)
            self.response.write("Missing AppInfo. Bailing.")

        app_info_model = results[0]
        hello = make_oauth2_service(app_info_model)

        if token is None:  # token could be set to impersonate an user
            token = app_info_model.access_token
        return hello.get_session(token)

    @property
    def current_user(self):
        return users.get_current_user()

def make_oauth2_service(app_info_model):
    """
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
