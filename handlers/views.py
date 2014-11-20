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

class UserView(BaseRequestHandler):
    """
    Returns a portal to quickly look for recent users and search for users.
    """
    def get(self):
        self.render_to_response(template_file='templates/users.html',
                                context={'title': 'Users'})

class SenseVisualView(BaseRequestHandler):
    """
    Returns graphs of data from Sense (temperature, humidity, particulates, light)
    """
    def get(self):
        self.render_to_response(template_file='templates/sense.html',
                                context={'title': 'Sense'})

class ZendeskView(BaseRequestHandler):
    """
    Returns zendesk statistics, underconstruction
    """
    def get(self):
         self.render_to_response(template_file='templates/zendesk.html',
                                context={'title': 'Zendesk'})

class SettingsView(ProtectedRequestHandler):
    """
    Returns a panel for manipulating apps, accounts
    """
    def get(self):
        self.render_to_response(template_file='templates/settings.html',
                                context={'title': 'Settings'})

class DebugLogView(ProtectedRequestHandler):
    """
    Returns a beautiful & comfy log viewer
    """
    def get(self):
        self.render_to_response(template_file='templates/debug_log.html',
                                context={'title': 'Log'})

class FirmwareView(ProtectedRequestHandler):
    """
    Returns a panel for moderating firmware content
    """
    def get(self):
        self.render_to_response(template_file='templates/firmware.html',
                                context={'title': 'Firmware'})

class TeamsView(ProtectedRequestHandler):
    """
    Returns a panel for viewing specifications of devices,
    having ability to disconnect a device / flash firmware from a chosen list
    """
    def get(self):
        self.render_to_response(template_file='templates/teams.html',
                                context={'title': 'Teams'})

class ConfigurationView(ProtectedRequestHandler):
    """
    Returns a panel for monitoring team device IDs and groups (teams) by feature.
    """
    def get(self):
        self.render_to_response(template_file='templates/configuration.html',
                                context={'title': 'Configuration'})

class Teams2View(ProtectedRequestHandler):
    """
    Returns a panel for monitoring team device IDs and groups (teams) by feature.
    """
    def get(self):
        self.render_to_response(template_file='templates/teams2.html',
                                context={'title': 'Teams2'})

class ErrorView(BaseRequestHandler):
    def get(self):
        self.render_to_response(template_file='templates/error.html',
                                context={'title': 'Sorry'})