import datetime as dt
import jinja2
import os
from handlers.helpers import BaseRequestHandler
from handlers.helpers import ProtectedRequestHandler
from handlers.helpers import CustomerExperienceRequestHandler
from handlers.helpers import FirmwareRequestHandler
from handlers.helpers import SuperFirmwareRequestHandler
from handlers.helpers import ShippingRequestHandler
from handlers.helpers import SettingsModeratorRequestHandler
from handlers.helpers import TokenMakerRequestHandler
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

class ZendeskView(CustomerExperienceRequestHandler):
    """Returns zendesk statistics, underconstruction"""
    def get(self):
         self.render_to_response(template_file='templates/zendesk.html',
                                context={'title': 'Zendesk'})

class SettingsView(SettingsModeratorRequestHandler):
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

class SenseLogsNewView(ProtectedRequestHandler):
    """
    Returns sense logs viewer
    """
    def get(self):
        self.redirect("/sense_logs")

class FirmwareView(FirmwareRequestHandler):
    """Returns a panel for moderating firmware content"""
    def get(self):
        self.render_to_response(template_file='templates/firmware.html',
                                context={'title': 'Firmware'})

class FeaturesView(FirmwareRequestHandler):
    """Flip features for users/devices."""
    def get(self):
        self.render_to_response(template_file='templates/features.html',
                                context={'title': 'Features'})

class TeamsView(FirmwareRequestHandler):
    """Returns a panel for monitoring groups of devices & users"""
    def get(self):
        self.render_to_response(template_file='templates/teams.html',
                                context={'title': 'Teams'})

class InactiveDevicesView(ProtectedRequestHandler):
    """Returns a panel for monitoring potential in-troube devices"""
    def get(self):
        self.render_to_response(template_file='templates/inactive_devices.html',
                                context={'title': 'Inactive Devices'})

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

class ErrorView(BaseRequestHandler):
    def get(self):
        self.render_to_response(template_file='templates/error.html',
                                context={'title': 'Denied'})

class ProvisionView(ProtectedRequestHandler):
    def get(self):
        self.render_to_response(template_file='templates/provision.html',
                                context={'title': 'Provision'})

class ZendeskHistoryView(ProtectedRequestHandler):
    def get(self):
        self.render_to_response(template_file='templates/zendesk_history.html',
                                context={'title': 'Zendesk History'})

class ZendeskNowView(ProtectedRequestHandler):
    def get(self):
        self.render_to_response(template_file='templates/zendesk_now.html',
                                context={'title': 'Zendesk Now'})

class CreateProvisionKeyView(ProtectedRequestHandler):
    def get(self):
        self.render_to_response(template_file='templates/create_provision_key.html',
                                context={'title': 'Create Key'})

class RoomConditionsView(ProtectedRequestHandler):
    def get(self):
        self.render_to_response(template_file='templates/room_conditions.html',
                                context={'title': 'Room Conditions'})

class RoomConditionsMinuteView(ProtectedRequestHandler):
    def get(self):
        self.render_to_response(template_file='templates/room_conditions_minute.html',
                                context={'title': 'Room Conditions - Minute Resolution'})

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

class PasswordResetView(ProtectedRequestHandler):
    def get(self):
        self.render_to_response(template_file='templates/password_reset.html',
                                context={'title': 'Password Reset'})

class OrdersView(ShippingRequestHandler):
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

class InspectorView(ProtectedRequestHandler):
    def get(self):
        self.render_to_response(template_file='templates/inspector.html',
                                context={'title': 'Inspect Recent Users To Detect Trouble'})

class AccountProfileView(ProtectedRequestHandler):
    def get(self):
        self.render_to_response(template_file='templates/account_profile.html',
                                context={'title': "Account Profile"})

class RecentAccountsView(ProtectedRequestHandler):
    def get(self):
        self.render_to_response(template_file='templates/recent_accounts.html',
                                context={'title': "Recent Accounts"})

class PCHSerialNumberCheckView(ProtectedRequestHandler):
    def get(self):
        self.render_to_response(template_file='templates/pch_serial_number_check.html',
                                context={'title': "PCH Serial Number Check"})

class OnboardingLogsView(ProtectedRequestHandler):
    def get(self):
        self.render_to_response(template_file='templates/onboarding_logs.html',
                                context={'title': "Onboarding Logs"})

class LogsPatternFacetsView(ProtectedRequestHandler):
    def get(self):
        self.render_to_response(template_file='templates/log_facets.html',
                                context={'title': "Log Facets"})

class SearchifyStatsView(ProtectedRequestHandler):
    def get(self):
        self.render_to_response(template_file='templates/searchify_stats.html',
                                context={'title': "Searchify Statistics"})

class BlackListView(ProtectedRequestHandler):
    def get(self):
        self.render_to_response(template_file='templates/black_list.html',
                                context={'title': "Devices Whose Logs Do Not Matter"})

class AlarmRingsHistoryView(ProtectedRequestHandler):
    def get(self):
        self.render_to_response(template_file='templates/alarm_rings_history.html',
                                context={'title': "Alarms, Ringtime & Timezone"})

class TokenGeneratorView(TokenMakerRequestHandler):
    def get(self):
        self.render_to_response(template_file='templates/token_generator.html',
                                context={'title': "Token Generator"})

class FirmwarePathView(SuperFirmwareRequestHandler):
    def get(self):
        self.render_to_response(template_file='templates/firmware_path.html',
                                context={'title': "Firmware Upgrade Path"})

class SenseUptimeView(ProtectedRequestHandler):
    def get(self):
        self.render_to_response(template_file='templates/sense_uptime.html',
                                context={'title': "Sense Uptime"})
