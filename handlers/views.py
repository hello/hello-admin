import datetime as dt
import jinja2
import os
from handlers.helpers import BaseRequestHandler
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

class SenseLogsView(ProtectedRequestHandler):
    """
    Returns sense logs viewer
    """
    def get(self):
        self.render_to_response(template_file='templates/sense_logs.html',
                                context={'title': 'Sense Logs'})

class ApplicationLogsView(ProtectedRequestHandler):
    """Returns application logs viewer"""
    def get(self):
        self.render_to_response(template_file='templates/application_logs.html',
                                context={'title': 'Application Logs'})

class WorkerLogsView(ProtectedRequestHandler):
    """Returns worker logs viewer"""
    def get(self):
        self.render_to_response(template_file='templates/worker_logs.html',
                                context={'title': 'Worker Logs'})

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

class KeyStoreView(ProtectedRequestHandler):
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

class RoomConditionsView(ProtectedRequestHandler):
    def get(self):
        self.render_to_response(template_file='templates/room_conditions.html',
                                context={'title': 'Room Conditions'})

class LabelView(ProtectedRequestHandler):
    def get(self):
        self.render_to_response(template_file='templates/label.html',
                                context={'title': 'Label !'})

class AlarmsView(ProtectedRequestHandler):
    def get(self):
        self.render_to_response(template_file='templates/alarms.html',
                                context={'title': 'Alarms'})

class SetupView(BaseRequestHandler):
    def get(self):
        self.render_to_response(template_file='templates/setup.html',
                                context={'title': 'Setup'})

class PasswordResetView(BaseRequestHandler):
    def get(self):
        self.render_to_response(template_file='templates/password_reset.html',
                                context={'title': 'Password Reset'})

class OrdersView(ProtectedRequestHandler):
    """Search for order by order ID"""
    def get(self):
        self.render_to_response(template_file='templates/orders.html',
                                context={'title': 'Orders'})

class ActiveDevicesHistoryView(ProtectedRequestHandler):
    def get(self):
        self.render_to_response(template_file='templates/active_devices_history.html',
                                context={'title': 'Active Devices History'})

class SenseEventsView(ProtectedRequestHandler):
    def get(self):
        self.render_to_response(template_file='templates/sense_events.html',
                                context={'title': 'Sense Events'})

class DustStatsView(ProtectedRequestHandler):
    def get(self):
        self.render_to_response(template_file='templates/dust_stats.html',
                                context={'title': 'Dust Statistics'})

class UsersInpsectionView(ProtectedRequestHandler):
    def get(self):
        self.render_to_response(template_file='templates/users_inspection.html',
                                context={'title': 'Inspect Recent Users To Detect Trouble'})

class AccountProfileView(ProtectedRequestHandler):
    def get(self):
        self.render_to_response(template_file='templates/account_profile.html',
                                context={'title': "Account Profile"})