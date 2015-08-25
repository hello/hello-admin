import webapp2

from api.account import RecentAccountsAPI, AccountSearchAPI, AccountCountsBreakdownByCreatedDateAPI
from api.alarm import AlarmsAPI, AlarmsByEmailAPI, AlarmRingsHistoryAPI
from api.namespace import NamespaceAPI
from api.password import PasswordResetAPI, PasswordForceUpdateAPI
from api.feature import FeaturesAPI
from cron.datastore_cron import StoreRecentlyActiveDevicesStatsMinute, StoreRecentlyActiveDevicesStats15Minutes, \
    StoreRecentlyActiveDevicesStatsDaily, ActiveDevicesHistoryPurge, ActiveDevicesHistory15MinutesPurge
from cron.firmware_cron import FirmwareLogsAlert
from cron.geckoboard_cron import DevicesCountPush, AlarmsCountPush
from cron.searchify_cron import DropOldSenseLogsSearchifyIndex
from cron.sense_color_cron import SenseColorUpdate, SenseColorUpdateQueue
from cron.timezone_cron import UpdateTimezoneByPartnerQueue, UpdateTimezoneByPartner
from cron.zendesk_cron import ZendeskCron
from api.device import ActiveDevices15MinutesHistoryAPI
from api.device import ActiveDevicesDailyHistoryAPI
from api.device import ActiveDevicesMinuteHistoryAPI
from api.device import DeviceAPI
from api.device import DeviceByEmailAPI
from api.device import DeviceInactiveAPI
from api.device import DeviceKeyStoreAPI
from api.device import DeviceOwnersAPI
from api.device import SenseBlackListAPI
from api.device import SenseColorAPI
from api.uptime import SenseUptimeAPI
from api.event import SenseEventsAPI
from api.firmware import FirmwareAPI
from api.firmware import FirmwareHistoryAPI
from api.firmware import FirmwareInfoAPI
from api.firmware import FirmwareUnhashAPI
from api.firmware import FirmwareGroupStatusAPI
from api.firmware import FirmwareGroupPathAPI
from api.keystore import PillKeyDecryptAPI
from api.keystore import PillKeyProvision
from api.keystore import PillProvisionAPI
from api.keystore import SenseKeyProvision
from api.label import LabelDataAPI
from handlers.memcache import RefreshMemcache
from api.motion import MotionAPI
from api.notification import NotificationAPI
from api.onboarding import OnboardingLogsByResultAPI
from api.onboarding import OnboardingLogsBySenseIdAPI
from api.onboarding import OnboardingLogsByEmailAPI
from api.order import OrdersAPI
from api.papertrail import PaperTrailEventsAPI
from api.papertrail import PaperTrailSystemsAPI
from api.pch import PCHSerialNumberCheckAPI
from api.battery import BatteryAPI
from api.ambience import LastRoomConditionsAPI
from api.ambience import RoomConditionsAPI
from api.searchify import DustStatsAPI
from api.searchify import LogsPatternFacetsAPI
from api.searchify import SenseLogsAPI, SearchifyStatsAPI
from api.searchify import WifiSignalStrengthAPI
from api.setup import AppAPI
from api.setup import AppendAppInfo
from api.setup import AppScopeAPI
from api.setup import CreateAccountAPI
from api.setup import CreateKeyStoreLockerAPI
from api.setup import ProxyAPI
from api.setup import RegisterPillAPI, SetupAPI
from api.setup import TokenAPI
from api.setup import UpdateAdminAccessTokenAPI
from api.setup import UpdateGeckoBoardCredentials
from api.setup import ViewPermissionAPI
from api.team import TeamsAPI
from api.timeline import TimelineAPI
from api.timezone import TimezoneAPI
from api.timezone import TimezoneHistoryAPI
from handlers.views import AccountProfileView, RoomConditionsMinuteView
from handlers.views import ActiveDevicesHistoryView
from handlers.views import AlarmRingsHistoryView
from handlers.views import AlarmsView
from handlers.views import BatteryView
from handlers.views import BlackListView
from handlers.views import ChartHandler
from handlers.views import FeaturesView
from handlers.views import CreateProvisionKeyView
from handlers.views import DustStatsView
from handlers.views import ErrorView
from handlers.views import FirmwarePathView
from handlers.views import FirmwareView
from handlers.views import KeyStoreView
from handlers.views import ProvisionView
from handlers.views import LabelView
from handlers.views import LogsPatternFacetsView
from handlers.views import MotionView
from handlers.views import NotificationView
from handlers.views import OnboardingLogsView
from handlers.views import OrdersView
from handlers.views import PairingView
from handlers.views import PasswordResetView
from handlers.views import PCHSerialNumberCheckView
from handlers.views import RecentAccountsView
from handlers.views import RoomConditionsView
from handlers.views import SearchifyStatsView
from handlers.views import SenseEventsView
from handlers.views import SenseLogsNewView
from handlers.views import SenseLogsView
from handlers.views import SettingsView
from handlers.views import SetupView
from handlers.views import TeamsView
from handlers.views import TimelineView
from handlers.views import TokenGeneratorView
from handlers.views import InactiveDevicesView
from handlers.views import InspectorView
from handlers.views import ZendeskHistoryView
from handlers.views import ZendeskNowView
from handlers.views import ZendeskView
from handlers.views import SenseUptimeView
from api.zendesk import ZendeskAPI
from api.zendesk import ZendeskHistoryAPI
from api.zendesk import ZendeskNowAPI
from api.zendesk import ZendeskStatsAPI
import settings
from api.order import OrdersMapAPI
from api.timeline import TimelineAlgorithmAPI
from api.device import ColorlessSensesAPI
from api.clearbit import ClearbitAPI
from api.setup import CreateBuggyFirmwareAPI
from api.datastore import InitializeDataStore


cron_routes = [
    ('/cron/active_devices_history_15_minutes_purge', ActiveDevicesHistory15MinutesPurge),
    ('/cron/active_devices_history_purge', ActiveDevicesHistoryPurge),
    ('/cron/alarms_count_push', AlarmsCountPush),
    ('/cron/devices_count_push', DevicesCountPush),
    ('/cron/drop_old_sense_logs_searchify_index', DropOldSenseLogsSearchifyIndex),
    ('/cron/store_recently_active_devices_stats_15_minutes', StoreRecentlyActiveDevicesStats15Minutes),
    ('/cron/store_recently_active_devices_stats_daily', StoreRecentlyActiveDevicesStatsDaily),
    ('/cron/store_recently_active_devices_stats_minute', StoreRecentlyActiveDevicesStatsMinute),
    ('/cron/zendesk_daily_stats', ZendeskCron),
    ('/cron/sense_color_update', SenseColorUpdate),
    ('/cron/sense_color_update_queue', SenseColorUpdateQueue),
    ('/cron/firmware_crash_logs_retain', FirmwareLogsAlert),
    ('/cron/update_timezone_by_partner', UpdateTimezoneByPartner),
    ('/cron/update_timezone_by_partner_queue', UpdateTimezoneByPartnerQueue),
]

api_routes = [
    ('/api/account_breakdown/?$', AccountCountsBreakdownByCreatedDateAPI),
    ('/api/active_devices_15_minutes_history/?$', ActiveDevices15MinutesHistoryAPI),
    ('/api/active_devices_daily_history/?$', ActiveDevicesDailyHistoryAPI),
    ('/api/active_devices_minute_history/?$', ActiveDevicesMinuteHistoryAPI),
    ('/api/alarm_rings_history/?$', AlarmRingsHistoryAPI),
    ('/api/alarms/?$', AlarmsAPI),
    ('/api/alarms_by_email/?$', AlarmsByEmailAPI),
    ('/api/app/?$', AppAPI),
    ('/api/app_scope/?$', AppScopeAPI),
    ('/api/append_app_info/?$', AppendAppInfo),
    ('/api/battery/?$', BatteryAPI),
    ('/api/create_key_store_locker/?$', CreateKeyStoreLockerAPI),
    ('/api/device_by_email/?$', DeviceByEmailAPI),
    ('/api/devices/?$', DeviceAPI),
    ('/api/devices/inactive/?$', DeviceInactiveAPI),
    ('/api/devices/key_store/?$', DeviceKeyStoreAPI),
    ('/api/devices/owners/?$', DeviceOwnersAPI),
    ('/api/sense_uptime/?$', SenseUptimeAPI),
    ('/api/dust_stats/?$', DustStatsAPI),
    ('/api/features/?$', FeaturesAPI),
    ('/api/firmware/?$', FirmwareAPI),
    ('/api/firmware/history/?$', FirmwareHistoryAPI),
    ('/api/firmware/info/?$', FirmwareInfoAPI),
    ('/api/firmware_unhash/?$', FirmwareUnhashAPI),
    ('/api/firmware_group_status/?$', FirmwareGroupStatusAPI),
    ('/api/firmware_group_path/?$', FirmwareGroupPathAPI),
    ('/api/password_force_update/?$', PasswordForceUpdateAPI),
    ('/api/label_data/?$', LabelDataAPI),
    ('/api/last_room_conditions/?$', LastRoomConditionsAPI),
    ('/api/log_facets/?$', LogsPatternFacetsAPI),
    ('/api/motion/?$', MotionAPI),
    ('/api/notification/?$', NotificationAPI),
    ('/api/onboarding_logs_by_result/?$', OnboardingLogsByResultAPI),
    ('/api/onboarding_logs_by_sense_id/?$', OnboardingLogsBySenseIdAPI),
    ('/api/onboarding_logs_by_email/?$', OnboardingLogsByEmailAPI),
    ('/api/orders/?$', OrdersAPI),
    ('/api/papertrail_events/?$', PaperTrailEventsAPI),
    ('/api/papertrail_systems/?$', PaperTrailSystemsAPI),
    ('/api/password_reset/?$', PasswordResetAPI),
    ('/api/pch_sn_check/?$', PCHSerialNumberCheckAPI),
    ('/api/pill_key_provision/?$', PillKeyProvision),
    ('/api/recent_accounts/?$', RecentAccountsAPI),
    ('/api/room_conditions/?$', RoomConditionsAPI),
    ('/api/searchify_stats/?$', SearchifyStatsAPI),
    ('/api/sense_black_list/?$', SenseBlackListAPI),
    ('/api/sense_color/?$', SenseColorAPI),
    ('/api/sense_events/?$', SenseEventsAPI),
    ('/api/sense_key_provision/?$', SenseKeyProvision),
    ('/api/sense_logs/?$', SenseLogsAPI),
    ('/api/teams/?$', TeamsAPI),
    ('/api/timeline/?$', TimelineAPI),
    ('/api/timeline_algorithm/?$', TimelineAlgorithmAPI),
    ('/api/timezone/?$', TimezoneAPI),
    ('/api/timezone_history/?$', TimezoneHistoryAPI),
    ('/api/tokens/?$', TokenAPI),
    ('/api/update_geckoboard_credentials/?$', UpdateGeckoBoardCredentials),
    ('/api/account_search/?$', AccountSearchAPI),
    ('/api/viewer_permission/?$', ViewPermissionAPI),
    ('/api/wifi_signal_strength/?$', WifiSignalStrengthAPI),
    ('/api/zendesk/?$', ZendeskAPI),
    ('/api/zendesk_history/?$', ZendeskHistoryAPI),
    ('/api/zendesk_now/?$', ZendeskNowAPI),
    ('/api/zendesk_stats/?$', ZendeskStatsAPI),
    ('/api/orders_map/?$', OrdersMapAPI),
    ('/api/colorless_senses/?$', ColorlessSensesAPI),
    ('/api/clearbit/?$', ClearbitAPI),
    ('/api/create/buggy_firmware/?$', CreateBuggyFirmwareAPI),
    ("/api/init/?$", InitializeDataStore),
    ("/api/namespace/?$", NamespaceAPI),
]

page_routes = [
    ('/', AccountProfileView),
    ('/account_profile/?$', AccountProfileView),
    ('/active_devices_history/?$', ActiveDevicesHistoryView),
    ('/alarm_rings_history/?$', AlarmRingsHistoryView),
    ('/alarms/?$', AlarmsView),
    ('/api/setup', SetupAPI),
    ('/battery/?$', BatteryView),
    ('/black_list/?$', BlackListView),
    ('/charts', ChartHandler),
    ('/features/?$', FeaturesView),
    ('/configuration/?$', FeaturesView),
    ('/create_account', CreateAccountAPI),
    ('/dust_stats/?$', DustStatsView),
    ('/error/?$', ErrorView),
    ('/firmware/?$', FirmwareView),
    ('/firmware_path/?$', FirmwarePathView),
    ('/key_store/?$', KeyStoreView),
    ('/keystore/?$', KeyStoreView),
    ('/keys/?$', ProvisionView),
    ('/provision/?$', ProvisionView),
    ('/label/?$', LabelView),
    ('/log_facets/?$', LogsPatternFacetsView),
    ('/motion/?$', MotionView),
    ('/notification/?$', NotificationView),
    ('/onboarding_logs/?$', OnboardingLogsView),
    ('/orders/?$', OrdersView),
    ('/pairing/?$', PairingView),
    ('/password_reset/?$', PasswordResetView),
    ('/pch_serial_number_check/?$', PCHSerialNumberCheckView),
    ('/create_provision_key/?$', CreateProvisionKeyView),
    ('/proxy/(.*)', ProxyAPI),
    ('/recent_accounts/?$', RecentAccountsView),
    ('/refresh_memcache/?$', RefreshMemcache),
    ('/register_pill', RegisterPillAPI),
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
    ('/update', UpdateAdminAccessTokenAPI),
    ('/inspector/?$', InspectorView),
    ('/users_inspection/?$', InspectorView),
    ('/zendesk/?$', ZendeskView),
    ('/zendesk_history/?$', ZendeskHistoryView),
    ('/zendesk_now/?$', ZendeskNowView),
    ('/sense_uptime/?$', SenseUptimeView),
]

file_upload_routes = [
    ('/pill_bin_upload', PillKeyDecryptAPI),
    ('/pill_bin_upload/([^/]+)/([^/]+)', PillProvisionAPI),
]

hello_admin_app = webapp2.WSGIApplication(
    routes=cron_routes + api_routes + page_routes + file_upload_routes,
    debug=settings.DEBUG
)
