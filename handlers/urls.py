from handlers.alarms import AlarmRingsHistoryAPI
from handlers.alarms import AlarmsAPI
from handlers.alarms import AlarmsByEmailAPI
from handlers.configuration import FeaturesAPI
from handlers.cron import ActiveDevicesHistory15MinutesPurge
from handlers.cron import ActiveDevicesHistoryPurge
from handlers.cron import AlarmsCountPush
from handlers.cron import DevicesCountPush
from handlers.cron import DropOldSenseLogsSearchifyIndex
from handlers.cron import HoldsCountPush
from handlers.cron import StoreRecentlyActiveDevicesStats15Minutes
from handlers.cron import StoreRecentlyActiveDevicesStatsDaily
from handlers.cron import StoreRecentlyActiveDevicesStatsMinute
from handlers.cron import WavesCountPush
from handlers.cron import ZendeskCronHandler
from handlers.deprecated import InactiveDevicesAPI, PreSleepAPI
from handlers.devices import ActiveDevices15MinutesHistoryAPI
from handlers.devices import ActiveDevicesDailyHistoryAPI
from handlers.devices import ActiveDevicesMinuteHistoryAPI
from handlers.devices import DeviceAPI
from handlers.devices import DeviceByEmailAPI
from handlers.devices import DeviceInactiveAPI
from handlers.devices import DeviceKeyStoreHint
from handlers.devices import DeviceOwnersAPI
from handlers.devices import SenseBlackListAPI
from handlers.devices import SenseColorAPI
from handlers.diagnostic import SenseUptimeAPI
from handlers.events import SenseEventsAPI
from handlers.firmware import FirmwareAPI
from handlers.firmware import FirmwareHistoryAPI
from handlers.firmware import FirmwareInfoAPI
from handlers.firmware import FirmwareUnhashAPI
from handlers.firmware import FirmwareGroupStatusAPI
from handlers.firmware import FirmwareGroupPathAPI
from handlers.keys import PillKeyDecryptAPI
from handlers.keys import PillKeyProvision
from handlers.keys import PillProvisionAPI
from handlers.keys import SenseKeyProvision
from handlers.label_data import LabelDataAPI
from handlers.memcache import RefreshMemcache
from handlers.motion import MotionAPI
from handlers.notification import NotificationAPI
from handlers.onboarding import OnboardingLogsByResultAPI
from handlers.onboarding import OnboardingLogsBySenseIdAPI
from handlers.onboarding import OnboardingLogsByEmailAPI
from handlers.orders import OrdersAPI
from handlers.papertrail import PaperTrailEventsAPI
from handlers.papertrail import PaperTrailSystemsAPI
from handlers.pch_serial import PCHSerialNumberCheckAPI
from handlers.pill_status import PillStatusAPI
from handlers.room_conditions import LastRoomConditionsAPI
from handlers.room_conditions import RoomConditionsAPI
from handlers.searchify_logs import DustStatsAPI
from handlers.searchify_logs import LogsPatternFacetsAPI
from handlers.searchify_logs import SenseLogsAPI, SearchifyStatsAPI
from handlers.searchify_logs import WifiSignalStrengthAPI
from handlers.setup import AppAPI
from handlers.setup import AppendAppInfo
from handlers.setup import AppScopeAPI
from handlers.setup import CreateAccountAPI
from handlers.setup import CreateGroupsAPI
from handlers.setup import CreateKeyStoreLockerAPI
from handlers.setup import ProxyAPI
from handlers.setup import RegisterPillAPI, SetupAPI
from handlers.setup import TokenAPI
from handlers.setup import UpdateAdminAccessTokenAPI
from handlers.setup import UpdateGeckoBoardCredentials
from handlers.setup import ViewPermissionAPI
from handlers.teams import TeamsAPI
from handlers.timeline import TimelineAPI
from handlers.timezone import TimezoneAPI
from handlers.timezone import TimezoneHistoryAPI
from handlers.users import AccountCountsBreakdownByCreatedDateAPI
from handlers.users import ForcePasswordUpdateAPI
from handlers.users import OmniSearchAPI
from handlers.users import PasswordResetAPI
from handlers.users import RecentUsersAPI
from handlers.users import UserSearchAPI
from handlers.views import AccountProfileView
from handlers.views import ActiveDevicesHistoryView
from handlers.views import AlarmRingsHistoryView
from handlers.views import AlarmsView
from handlers.views import BatteryView
from handlers.views import BlackListView
from handlers.views import ChartHandler
from handlers.views import ConfigurationView
from handlers.views import CreateKeyView
from handlers.views import DustStatsView
from handlers.views import ErrorView
from handlers.views import FirmwarePathView
from handlers.views import FirmwareView
from handlers.views import KeyStoreView
from handlers.views import KeysView
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
from handlers.views import SenseVisualView
from handlers.views import SettingsView
from handlers.views import SetupView
from handlers.views import TeamsView
from handlers.views import TimelineView
from handlers.views import TokenGeneratorView
from handlers.views import TroubleshootView
from handlers.views import UsersInpsectionView
from handlers.views import UserView
from handlers.views import ZendeskHistoryView
from handlers.views import ZendeskNowView
from handlers.views import ZendeskView
from handlers.views import SenseUptimeView
from handlers.zendesk import ZendeskAPI
from handlers.zendesk import ZendeskHistoryAPI
from handlers.zendesk import ZendeskNowAPI
from handlers.zendesk import ZendeskStatsAPI
import settings
import webapp2
from handlers.orders import OrdersMapAPI
from handlers.timeline import TimelineAlgorithmAPI
from handlers.devices import ColorlessSensesAPI
from handlers.cron import SenseColorUpdate
from handlers.cron import SenseColorUpdateQueue
from handlers.clearbit import ClearbitAPI
from handlers.cron import FirmwareCrashLogsRetain

cron_routes = [
    ('/cron/active_devices_history_15_minutes_purge', ActiveDevicesHistory15MinutesPurge),
    ('/cron/active_devices_history_purge', ActiveDevicesHistoryPurge),
    ('/cron/alarms_count_push', AlarmsCountPush),
    ('/cron/devices_count_push', DevicesCountPush),
    ('/cron/drop_old_sense_logs_searchify_index', DropOldSenseLogsSearchifyIndex),
    ('/cron/holds_count_push', HoldsCountPush),
    ('/cron/store_recently_active_devices_stats_15_minutes', StoreRecentlyActiveDevicesStats15Minutes),
    ('/cron/store_recently_active_devices_stats_daily', StoreRecentlyActiveDevicesStatsDaily),
    ('/cron/store_recently_active_devices_stats_minute', StoreRecentlyActiveDevicesStatsMinute),
    ('/cron/waves_count_push', WavesCountPush),
    ('/cron/zendesk_daily_stats', ZendeskCronHandler),
    ('/cron/sense_color_update', SenseColorUpdate),
    ('/cron/sense_color_update_queue', SenseColorUpdateQueue),
    ('/cron/firmware_crash_logs_retain', FirmwareCrashLogsRetain),

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
    ('/api/battery/?$', PillStatusAPI),
    ('/api/create_groups/?$', CreateGroupsAPI),
    ('/api/create_key_store_locker/?$', CreateKeyStoreLockerAPI),
    ('/api/device_by_email/?$', DeviceByEmailAPI),
    ('/api/devices/?$', DeviceAPI),
    ('/api/devices/inactive/?$', DeviceInactiveAPI),
    ('/api/devices/key_store/?$', DeviceKeyStoreHint),
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
    ('/api/force_password_update/?$', ForcePasswordUpdateAPI),
    ('/api/label_data/?$', LabelDataAPI),
    ('/api/last_room_conditions/?$', LastRoomConditionsAPI),
    ('/api/log_facets/?$', LogsPatternFacetsAPI),
    ('/api/motion/?$', MotionAPI),
    ('/api/notification/?$', NotificationAPI),
    ('/api/omni_search/?$', OmniSearchAPI),
    ('/api/onboarding_logs_by_result/?$', OnboardingLogsByResultAPI),
    ('/api/onboarding_logs_by_sense_id/?$', OnboardingLogsBySenseIdAPI),
    ('/api/onboarding_logs_by_email/?$', OnboardingLogsByEmailAPI),
    ('/api/orders/?$', OrdersAPI),
    ('/api/papertrail_events/?$', PaperTrailEventsAPI),
    ('/api/papertrail_systems/?$', PaperTrailSystemsAPI),
    ('/api/password_reset/?$', PasswordResetAPI),
    ('/api/pch_sn_check/?$', PCHSerialNumberCheckAPI),
    ('/api/pill_key_provision/?$', PillKeyProvision),
    ('/api/presleep/?$', PreSleepAPI),
    ('/api/recent_users/?$', RecentUsersAPI),
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
    ('/api/troubleshoot/?$', InactiveDevicesAPI),
    ('/api/update_geckoboard_credentials/?$', UpdateGeckoBoardCredentials),
    ('/api/user_search/?$', UserSearchAPI),
    ('/api/viewer_permission/?$', ViewPermissionAPI),
    ('/api/wifi_signal_strength/?$', WifiSignalStrengthAPI),
    ('/api/zendesk/?$', ZendeskAPI),
    ('/api/zendesk_history/?$', ZendeskHistoryAPI),
    ('/api/zendesk_now/?$', ZendeskNowAPI),
    ('/api/zendesk_stats/?$', ZendeskStatsAPI),
    ('/api/orders_map/?$', OrdersMapAPI),
    ('/api/colorless_senses/?$', ColorlessSensesAPI),
    ('/api/clearbit/?$', ClearbitAPI),
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
    ('/configuration/?$', ConfigurationView),
    ('/create_account', CreateAccountAPI),
    ('/dust_stats/?$', DustStatsView),
    ('/error/?$', ErrorView),
    ('/firmware/?$', FirmwareView),
    ('/firmware_path/?$', FirmwarePathView),
    ('/key_store/?$', KeyStoreView),
    ('/keys/?$', KeysView),
    ('/label/?$', LabelView),
    ('/log_facets/?$', LogsPatternFacetsView),
    ('/motion/?$', MotionView),
    ('/notification/?$', NotificationView),
    ('/onboarding_logs/?$', OnboardingLogsView),
    ('/orders/?$', OrdersView),
    ('/pairing/?$', PairingView),
    ('/password_reset/?$', PasswordResetView),
    ('/pch_serial_number_check/?$', PCHSerialNumberCheckView),
    ('/provision/?$', CreateKeyView),
    ('/proxy/(.*)', ProxyAPI),
    ('/recent_accounts/?$', RecentAccountsView),
    ('/refresh_memcache/?$', RefreshMemcache),
    ('/register_pill', RegisterPillAPI),
    ('/room_conditions/?$', RoomConditionsView),
    ('/searchify_stats/?$', SearchifyStatsView),
    ('/sense/?$', SenseVisualView),
    ('/sense_events/?$', SenseEventsView),
    ('/sense_logs/?$', SenseLogsView),
    ('/sense_logs_new/?$', SenseLogsNewView),
    ('/settings/?$', SettingsView),
    ('/setup/?$', SetupView),
    ('/teams/?$', TeamsView),
    ('/timeline/?$', TimelineView),
    ('/token_generator/?$', TokenGeneratorView),
    ('/troubleshoot/?$', TroubleshootView),
    ('/update', UpdateAdminAccessTokenAPI),
    ('/users/?$', UserView),
    ('/users_inspection/?$', UsersInpsectionView),
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
