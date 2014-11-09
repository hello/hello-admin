import datetime as dt
from models.setup import AccessToken
import jinja2
import os
from handlers.helpers import BaseRequestHandler, ProtectedRequestHandler

this_file_path = os.path.dirname(__file__)
JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.split(this_file_path)[0]),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True
)


class ChartHandler(BaseRequestHandler):
    """
    Returns a timeline of sleep events
    """
    def get(self):
        template = JINJA_ENVIRONMENT.get_template('templates/charts.html')
        tokens = AccessToken.query_tokens()
        day = dt.datetime.strftime(dt.datetime.now(), "%Y-%m-%d")
        self.response.write(template.render({'tokens': tokens, 'day': day}))

class UserDashboardView(BaseRequestHandler):
    """
    Returns all you should know about an user, under construction
    """
    def get(self):
        self.render_to_response(template_file='templates/user_dashboard.html',
                                context={'title': '- User Dashboard'})

class UserView(BaseRequestHandler):
    """
    Returns a portal to quickly look for recent users and search for users.
    """
    def get(self):
        self.render_to_response(template_file='templates/home.html',
                                context={'title': 'User'})

class SenseVisualView(BaseRequestHandler):
    """
    Returns graphs of data from Sense (temperature, humidity, particulates, light)
    """
    def get(self):
        self.render_to_response(template_file='templates/sense.html',
                                context={'title': '- Sense Visual'})

class ZendeskView(BaseRequestHandler):
     """
     Returns zendesk statistics, underconstruction
     """
     def get(self):
         self.render_to_response(template_file='templates/zendesk.html',
                                context={'title': '- Zendesk'})

class SettingsView(ProtectedRequestHandler):
     """
     Returns a panel for manipulating apps, accounts
     """
     def get(self):
        self.render_to_response(template_file='templates/settings.html',
                                context={'title': '- Settings'})

class FirmwareView(ProtectedRequestHandler):
     """
     Returns a panel for adding files for OTA firmware updates
     """
     def get(self):
        self.render_to_response(template_file='templates/firmware.html',
                                context={'title': '- firmware'})

