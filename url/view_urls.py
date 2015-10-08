from view.views import AccountProfileView, RoomConditionsMinuteView, TimelineV2View, LogsFacetHistoryView, \
    TimelineLogsView
from view.views import ActiveDevicesHistoryView
from view.views import AlarmRingsHistoryView
from view.views import AlarmsView
from view.views import BatteryView
from view.views import BlackListView
from view.views import FeaturesView
from view.views import CreateProvisionKeyView
from view.views import DustStatsView
from view.views import ErrorView
from view.views import FirmwarePathView
from view.views import FirmwareView
from view.views import KeyStoreView
from view.views import ProvisionView
from view.views import LabelView
from view.views import LogsFacetView
from view.views import MotionView
from view.views import NotificationView
from view.views import OnboardingLogsView
from view.views import OrdersView
from view.views import PairingView
from view.views import PasswordResetView
from view.views import PCHSerialNumberCheckView
from view.views import RecentAccountsView
from view.views import RoomConditionsView
from view.views import SearchifyStatsView
from view.views import SenseEventsView
from view.views import SenseLogsNewView
from view.views import SenseLogsView
from view.views import SettingsView
from view.views import SetupView
from view.views import TeamsView
from view.views import TimelineView
from view.views import TokenGeneratorView
from view.views import InactiveDevicesView
from view.views import InspectorView
from view.views import ZendeskHistoryView
from view.views import ZendeskNowView
from view.views import ZendeskView
from view.views import SenseUptimeView


routes = [
    ('/', AccountProfileView),
    ('/account_profile/?$', AccountProfileView),
    ('/active_devices_history/?$', ActiveDevicesHistoryView),
    ('/alarm_rings_history/?$', AlarmRingsHistoryView),
    ('/alarms/?$', AlarmsView),
    ('/battery/?$', BatteryView),
    ('/black_list/?$', BlackListView),
    ('/features/?$', FeaturesView),
    ('/configuration/?$', FeaturesView),
    ('/dust_stats/?$', DustStatsView),
    ('/error/?$', ErrorView),
    ('/firmware/?$', FirmwareView),
    ('/firmware_path/?$', FirmwarePathView),
    ('/key_store/?$', KeyStoreView),
    ('/keystore/?$', KeyStoreView),
    ('/keys/?$', ProvisionView),
    ('/provision/?$', ProvisionView),
    ('/label/?$', LabelView),
    ('/log_facets/?$', LogsFacetView),
    ('/logs_facet/?$', LogsFacetView),
    ('/motion/?$', MotionView),
    ('/notification/?$', NotificationView),
    ('/onboarding_logs/?$', OnboardingLogsView),
    ('/orders/?$', OrdersView),
    ('/pairing/?$', PairingView),
    ('/password_reset/?$', PasswordResetView),
    ('/pch_serial_number_check/?$', PCHSerialNumberCheckView),
    ('/create_provision_key/?$', CreateProvisionKeyView),
    ('/recent_accounts/?$', RecentAccountsView),
    ('/room_conditions/?$', RoomConditionsView),
    ('/room_conditions_minute/?$', RoomConditionsMinuteView),
    ('/searchify_stats/?$', SearchifyStatsView),
    ('/sense_events/?$', SenseEventsView),
    ('/sense_logs/?$', SenseLogsView),
    ('/sense_logs_new/?$', SenseLogsNewView),
    ('/settings/?$', SettingsView),
    ('/setup/?$', SetupView),
    ('/teams/?$', TeamsView),
    ('/timeline/?$', TimelineView),
    ('/token_generator/?$', TokenGeneratorView),
    ('/troubleshoot/?$', InactiveDevicesView),
    ('/inactive_devices/?$', InactiveDevicesView),
    ('/inspector/?$', InspectorView),
    ('/users_inspection/?$', InspectorView),
    ('/zendesk/?$', ZendeskView),
    ('/zendesk_history/?$', ZendeskHistoryView),
    ('/zendesk_now/?$', ZendeskNowView),
    ('/sense_uptime/?$', SenseUptimeView),
    ('/timeline_v2/?$', TimelineV2View),
    ('/logs_facet_history/?$', LogsFacetHistoryView),
    ('/timeline_logs/?$', TimelineLogsView),
]