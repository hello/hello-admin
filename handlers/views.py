import datetime as dt
import jinja2
import os
from handlers.helpers import ProtectedRequestHandler
from handlers.helpers import CustomerExperienceRequestHandler
from handlers.helpers import FirmwareRequestHandler
from handlers.helpers import SuperEngineerRequestHandler
from models.setup import AccessToken

this_file_path = os.path.dirname(__file__)
JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.split(this_file_path)[0]),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True
)


class ChartHandler(ProtectedRequestHandler):
    """Returns a timeline of sleep events"""
    def get(self):
        template = JINJA_ENVIRONMENT.get_template('templates/charts.html')
        tokens = AccessToken.query_tokens()
        day = dt.datetime.strftime(dt.datetime.now(), "%Y-%m-%d")
        self.response.write(template.render({'tokens': tokens, 'day': day}))

class UserView(ProtectedRequestHandler):
    """Returns a portal to quickly look for recent users and search for users."""
    def get(self):
        self.render_to_response(template_file='templates/users.html',
                                context={'title': 'Users'})

class SenseVisualView(ProtectedRequestHandler):
    """Returns graphs of data from Sense (temperature, humidity, particulates, light)"""
    def get(self):
        self.render_to_response(template_file='templates/sense.html',
                                context={'title': 'Sense'})

class ZendeskView(CustomerExperienceRequestHandler):
    """Returns zendesk statistics, underconstruction"""
    def get(self):
         self.render_to_response(template_file='templates/zendesk.html',
                                context={'title': 'Zendesk'})

class SettingsView(SuperEngineerRequestHandler):
    """Returns a panel for manipulating apps, accounts"""
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

class ApplicationLogsView(ProtectedRequestHandler):
    """Returns a beautiful & comfy log viewer"""
    def get(self):
        self.render_to_response(template_file='templates/application_logs.html',
                                context={'title': 'Application Logs'})

class FirmwareView(FirmwareRequestHandler):
    """Returns a panel for moderating firmware content"""
    def get(self):
        self.render_to_response(template_file='templates/firmware.html',
                                context={'title': 'Firmware'})

class ConfigurationView(SuperEngineerRequestHandler):
    """Returns a panel for monitoring team device IDs and groups (teams) by feature."""
    def get(self):
        self.render_to_response(template_file='templates/configuration.html',
                                context={'title': 'Configuration'})

class TeamsView(ProtectedRequestHandler):
    """Returns a panel for monitoring groups of devices & users"""
    def get(self):
        self.render_to_response(template_file='templates/teams.html',
                                context={'title': 'Teams'})

class TroubleshootView(ProtectedRequestHandler):
    """Returns a panel for monitoring potential in-troube devices"""
    def get(self):
        self.render_to_response(template_file='templates/troubleshoot.html',
                                context={'title': 'Troubleshoot'})

class TimelineView(ProtectedRequestHandler):
    """Returns a panel for monitoring potential timeline viewing"""
    def get(self):
        self.render_to_response(template_file='templates/timeline.html',
                                context={'title': 'Timeline'})

class BatteryView(ProtectedRequestHandler):
    """Returns a panel for monitoring potential timeline viewing"""
    def get(self):
        self.render_to_response(template_file='templates/battery.html',
                                context={'title': 'Battery'})

class PairingView(ProtectedRequestHandler):
    """Returns a panel for register/unregister senses/pills"""
    def get(self):
        self.render_to_response(template_file='templates/pairing.html',
                                context={'title': 'Pairing'})

class NotificationView(ProtectedRequestHandler):
    """Returns a panel for monitoring potential timeline viewing"""
    def get(self):
        self.render_to_response(template_file='templates/notification.html',
                                context={'title': 'Notification'})

class KeyStoreView(FirmwareRequestHandler):
    """Returns a panel for monitoring potential timeline viewing"""
    def get(self):
        self.render_to_response(template_file='templates/key_store.html',
                                context={'title': 'Key Store'})

class MotionView(ProtectedRequestHandler):
    """Returns a panel for monitoring potential timeline viewing"""
    def get(self):
        self.render_to_response(template_file='templates/motion.html',
                                context={'title': 'Motion'})

class ErrorView(ProtectedRequestHandler):
    def get(self):
        self.render_to_response(template_file='templates/error.html',
                                context={'title': 'Denied'})

class KeysView(ProtectedRequestHandler):
    def get(self):
        self.render_to_response(template_file='templates/keys.html',
                                context={'title': 'Keys'})

class ZendeskHistoryView(ProtectedRequestHandler):
    def get(self):
        self.render_to_response(template_file='templates/zendesk_history.html',
                                context={'title': 'Zendesk History'})

class ZendeskNowView(ProtectedRequestHandler):
    def get(self):
        self.render_to_response(template_file='templates/zendesk_now.html',
                                context={'title': 'Zendesk Now'})

class CreateKeyView(ProtectedRequestHandler):
    def get(self):
        self.render_to_response(template_file='templates/create_key.html',
                                context={'title': 'Create Key'})

