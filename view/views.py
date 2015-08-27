from core.handlers.base import BaseRequestHandler
from core.handlers.base import ProtectedRequestHandler
from core.handlers.base import CustomerExperienceRequestHandler
from core.handlers.base import FirmwareRequestHandler
from core.handlers.base import SuperFirmwareRequestHandler
from core.handlers.base import ShippingRequestHandler
from core.handlers.base import SettingsModeratorRequestHandler
from core.handlers.base import TokenMakerRequestHandler


class ZendeskView(CustomerExperienceRequestHandler):
    """Returns zendesk statistics, underconstruction"""
    def get(self):
         self.render_to_response(template_file='zendesk.html',
                                context={'title': 'Zendesk'})

class SettingsView(SettingsModeratorRequestHandler):
    """Returns a panel for manipulating apps, accounts"""
    def get(self):
        self.render_to_response(template_file='settings.html',
                                context={'title': 'Settings'})

class SenseLogsView(ProtectedRequestHandler):
    """
    Returns sense logs viewer
    """
    def get(self):
        self.render_to_response(template_file='sense_logs.html',
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
        self.render_to_response(template_file='firmware.html',
                                context={'title': 'Firmware'})

class FeaturesView(FirmwareRequestHandler):
    """Flip features for users/devices."""
    def get(self):
        self.render_to_response(template_file='features.html',
                                context={'title': 'Features'})

class TeamsView(FirmwareRequestHandler):
    """Returns a panel for monitoring groups of devices & users"""
    def get(self):
        self.render_to_response(template_file='teams.html',
                                context={'title': 'Teams'})

class InactiveDevicesView(ProtectedRequestHandler):
    """Returns a panel for monitoring potential in-troube devices"""
    def get(self):
        self.render_to_response(template_file='inactive_devices.html',
                                context={'title': 'Inactive Devices'})

class TimelineView(ProtectedRequestHandler):
    """Returns a panel for monitoring potential timeline viewing"""
    def get(self):
        self.render_to_response(template_file='timeline.html',
                                context={'title': 'Timeline'})

class BatteryView(ProtectedRequestHandler):
    """Returns a panel for monitoring potential timeline viewing"""
    def get(self):
        self.render_to_response(template_file='battery.html',
                                context={'title': 'Battery'})

class PairingView(ProtectedRequestHandler):
    """Returns a panel for register/unregister senses/pills"""
    def get(self):
        self.render_to_response(template_file='pairing.html',
                                context={'title': 'Pairing'})

class NotificationView(ProtectedRequestHandler):
    """Returns a panel for monitoring potential timeline viewing"""
    def get(self):
        self.render_to_response(template_file='notification.html',
                                context={'title': 'Notification'})

class KeyStoreView(ProtectedRequestHandler):
    """Returns a panel for monitoring potential timeline viewing"""
    def get(self):
        self.render_to_response(template_file='key_store.html',
                                context={'title': 'Key Store'})

class MotionView(ProtectedRequestHandler):
    """Returns a panel for monitoring potential timeline viewing"""
    def get(self):
        self.render_to_response(template_file='motion.html',
                                context={'title': 'Motion'})

class ErrorView(BaseRequestHandler):
    def get(self):
        self.render_to_response(template_file='error.html',
                                context={'title': 'Denied'})

class ProvisionView(ProtectedRequestHandler):
    def get(self):
        self.render_to_response(template_file='provision.html',
                                context={'title': 'Provision'})

class ZendeskHistoryView(ProtectedRequestHandler):
    def get(self):
        self.render_to_response(template_file='zendesk_history.html',
                                context={'title': 'Zendesk History'})

class ZendeskNowView(ProtectedRequestHandler):
    def get(self):
        self.render_to_response(template_file='zendesk_now.html',
                                context={'title': 'Zendesk Now'})

class CreateProvisionKeyView(ProtectedRequestHandler):
    def get(self):
        self.render_to_response(template_file='create_provision_key.html',
                                context={'title': 'Create Key'})

class RoomConditionsView(ProtectedRequestHandler):
    def get(self):
        self.render_to_response(template_file='room_conditions.html',
                                context={'title': 'Room Conditions'})

class RoomConditionsMinuteView(ProtectedRequestHandler):
    def get(self):
        self.render_to_response(template_file='room_conditions_minute.html',
                                context={'title': 'Room Conditions - Minute Resolution'})

class LabelView(ProtectedRequestHandler):
    def get(self):
        self.render_to_response(template_file='label.html',
                                context={'title': 'Label !'})

class AlarmsView(ProtectedRequestHandler):
    def get(self):
        self.render_to_response(template_file='alarms.html',
                                context={'title': 'Alarms'})

class SetupView(BaseRequestHandler):
    def get(self):
        self.render_to_response(template_file='setup.html',
                                context={'title': 'Setup'})

class PasswordResetView(ProtectedRequestHandler):
    def get(self):
        self.render_to_response(template_file='password_reset.html',
                                context={'title': 'Password Reset'})

class OrdersView(ShippingRequestHandler):
    """Search for order by order ID"""
    def get(self):
        self.render_to_response(template_file='orders.html',
                                context={'title': 'Orders'})

class ActiveDevicesHistoryView(ProtectedRequestHandler):
    def get(self):
        self.render_to_response(template_file='active_devices_history.html',
                                context={'title': 'Active Devices History'})

class SenseEventsView(ProtectedRequestHandler):
    def get(self):
        self.render_to_response(template_file='sense_events.html',
                                context={'title': 'Sense Events'})

class DustStatsView(ProtectedRequestHandler):
    def get(self):
        self.render_to_response(template_file='dust_stats.html',
                                context={'title': 'Dust Statistics'})

class InspectorView(ProtectedRequestHandler):
    def get(self):
        self.render_to_response(template_file='inspector.html',
                                context={'title': 'Inspect Recent Users To Detect Trouble'})

class AccountProfileView(ProtectedRequestHandler):
    def get(self):
        self.render_to_response(template_file='account_profile.html',
                                context={'title': "Account Profile"})

class RecentAccountsView(ProtectedRequestHandler):
    def get(self):
        self.render_to_response(template_file='recent_accounts.html',
                                context={'title': "Recent Accounts"})

class PCHSerialNumberCheckView(ProtectedRequestHandler):
    def get(self):
        self.render_to_response(template_file='pch_serial_number_check.html',
                                context={'title': "PCH Serial Number Check"})

class OnboardingLogsView(ProtectedRequestHandler):
    def get(self):
        self.render_to_response(template_file='onboarding_logs.html',
                                context={'title': "Onboarding Logs"})

class LogsPatternFacetsView(ProtectedRequestHandler):
    def get(self):
        self.render_to_response(template_file='log_facets.html',
                                context={'title': "Log Facets"})

class SearchifyStatsView(ProtectedRequestHandler):
    def get(self):
        self.render_to_response(template_file='searchify_stats.html',
                                context={'title': "Searchify Statistics"})

class BlackListView(ProtectedRequestHandler):
    def get(self):
        self.render_to_response(template_file='black_list.html',
                                context={'title': "Devices Whose Logs Do Not Matter"})

class AlarmRingsHistoryView(ProtectedRequestHandler):
    def get(self):
        self.render_to_response(template_file='alarm_rings_history.html',
                                context={'title': "Alarms, Ringtime & Timezone"})

class TokenGeneratorView(TokenMakerRequestHandler):
    def get(self):
        self.render_to_response(template_file='token_generator.html',
                                context={'title': "Token Generator"})

class FirmwarePathView(SuperFirmwareRequestHandler):
    def get(self):
        self.render_to_response(template_file='firmware_path.html',
                                context={'title': "Firmware Upgrade Path"})

class SenseUptimeView(ProtectedRequestHandler):
    def get(self):
        self.render_to_response(template_file='sense_uptime.html',
                                context={'title': "Sense Uptime"})