import webapp2
from handlers.pill_status import PillStatusAPI
from handlers.deprecated import InactiveDevicesAPI, PreSleepAPI
from handlers.searchify_logs import SenseLogsAPI, SearchifyStatsAPI
from handlers.timeline import TimelineAPI
import settings
from handlers.configuration import FeaturesAPI
from handlers.cron import ZendeskCronHandler
from handlers.cron import DevicesCountPush
from handlers.zendesk import ZendeskAPI
from handlers.zendesk import ZendeskStatsAPI
from handlers.zendesk import ZendeskHistoryAPI
from handlers.zendesk import ZendeskNowAPI
from handlers.firmware import FirmwareAPI
from handlers.firmware import FirmwareInfoAPI
from handlers.firmware import FirmwareHistoryAPI
from handlers.devices import DeviceAPI
from handlers.devices import DeviceInactiveAPI
from handlers.devices import DeviceKeyStoreHint
from handlers.devices import DeviceOwnersAPI
from handlers.room_conditions import RoomConditionsAPI
from handlers.setup import AppAPI
from handlers.setup import AppScopeAPI
from handlers.setup import CreateAccountAPI
from handlers.setup import CreateGroupsAPI
from handlers.setup import CreateKeyStoreLockerAPI
from handlers.setup import ProxyAPI
from handlers.setup import TokenAPI
from handlers.setup import RegisterPillAPI, SetupAPI
from handlers.setup import UpdateAdminAccessTokenAPI
from handlers.setup import UpdateGeckoBoardCredentials
from handlers.teams import TeamsAPI
from handlers.users import OmniSearchAPI
from handlers.views import BatteryView
from handlers.keys import SenseKeyProvision
from handlers.views import ChartHandler
from handlers.views import ConfigurationView
from handlers.views import SenseLogsView
from handlers.views import ApplicationLogsView
from handlers.views import ErrorView
from handlers.views import FirmwareView
from handlers.views import SenseVisualView
from handlers.views import SettingsView
from handlers.views import TeamsView
from handlers.views import UserView
from handlers.views import ZendeskView
from handlers.views import TroubleshootView
from handlers.views import TimelineView
from handlers.views import NotificationView
from handlers.views import PairingView
from handlers.views import KeyStoreView
from handlers.views import MotionView
from handlers.setup import ViewPermissionAPI
from handlers.notification import NotificationAPI
from handlers.motion import MotionAPI
from handlers.views import OrdersView
from handlers.views import KeysView
from handlers.views import ZendeskHistoryView
from handlers.views import ZendeskNowView
from handlers.views import CreateKeyView
from handlers.views import RoomConditionsView
from handlers.views import LabelView
from handlers.views import AlarmsView
from handlers.views import SetupView
from handlers.views import PasswordResetView
from handlers.keys import PillProvisionAPI
from handlers.keys import PillKeyDecryptAPI
from handlers.keys import PillKeyProvision
from handlers.label_data import LabelDataAPI
from handlers.alarms import AlarmsAPI
from handlers.users import PasswordResetAPI
from views import WorkerLogsView
from handlers.memcache import RefreshMemcache
from handlers.orders import OrdersAPI
from handlers.users import RecentUsersAPI
from handlers.setup import AppendAppInfo
from handlers.users import ForcePasswordUpdateAPI
from handlers.cron import StoreRecentlyActiveDevicesStatsMinute
from handlers.cron import StoreRecentlyActiveDevicesStats15Minutes
from handlers.cron import StoreRecentlyActiveDevicesStatsDaily
from handlers.devices import ActiveDevicesMinuteHistoryAPI
from handlers.devices import ActiveDevicesDailyHistoryAPI
from handlers.views import ActiveDevicesHistoryView
from handlers.events import SenseEventsAPI
from handlers.views import SenseEventsView
from handlers.firmware import FirmwareUnhashAPI
from handlers.searchify_logs import DustStatsAPI
from handlers.views import DustStatsView
from handlers.cron import AlarmsCountPush
from handlers.cron import WavesCountPush
from handlers.cron import HoldsCountPush
from handlers.cron import ActiveDevicesHistoryPurge
from handlers.cron import ActiveDevicesHistory15MinutesPurge
from handlers.users import UserSearchAPI
from handlers.views import UsersInpsectionView
from handlers.views import AccountProfileView
from handlers.devices import DeviceByEmailAPI
from handlers.timezone import TimezoneAPI
from handlers.pch_serial import PCHSerialNumberCheckAPI
from handlers.papertrail import PaperTrailEventsAPI
from handlers.papertrail import PaperTrailSystemsAPI
from handlers.views import RecentAccountsView
from handlers.users import AccountCountsBreakdownByCreatedDateAPI
from handlers.views import PCHSerialNumberCheckView
from handlers.searchify_logs import WifiSignalStrengthAPI
from handlers.onboarding import OnboardingLogsByResultAPI
from handlers.onboarding import OnboardingLogsBySenseIdAPI
from handlers.views import OnboardingLogsView
from handlers.room_conditions import LastRoomConditionsAPI
from handlers.devices import ActiveDevices15MinutesHistoryAPI
from handlers.searchify_logs import LogsPatternFacetsAPI
from handlers.views import LogsPatternFacetsView
from handlers.alarms import AlarmsByEmailAPI
from handlers.devices import SenseColorAPI
from handlers.views import SenseLogsNewView
from handlers.searchify_logs import SenseLogsNewAPI
from handlers.timezone import TimezoneHistoryAPI


cron_routes = [
    ('/cron/zendesk_daily_stats', ZendeskCronHandler),
    ('/cron/devices_count_push', DevicesCountPush),
    ('/cron/alarms_count_push', AlarmsCountPush),
    ('/cron/waves_count_push', WavesCountPush),
    ('/cron/holds_count_push', HoldsCountPush),
    ('/cron/store_recently_active_devices_stats_minute', StoreRecentlyActiveDevicesStatsMinute),
    ('/cron/store_recently_active_devices_stats_15_minutes', StoreRecentlyActiveDevicesStats15Minutes),
    ('/cron/store_recently_active_devices_stats_daily', StoreRecentlyActiveDevicesStatsDaily),
    ('/cron/active_devices_history_purge', ActiveDevicesHistoryPurge),
    ('/cron/active_devices_history_15_minutes_purge', ActiveDevicesHistory15MinutesPurge),
]

api_routes = [
    ('/api/app/?$', AppAPI),
    ('/api/app_scope/?$', AppScopeAPI),
    ('/api/battery/?$', PillStatusAPI),
    ('/api/create_groups/?$', CreateGroupsAPI),
    ('/api/create_key_store_locker/?$', CreateKeyStoreLockerAPI),
    ('/api/sense_logs/?$', SenseLogsAPI),
    ('/api/devices/?$', DeviceAPI),
    ('/api/devices/inactive/?$', DeviceInactiveAPI),
    ('/api/devices/owners/?$', DeviceOwnersAPI),
    ('/api/devices/key_store/?$', DeviceKeyStoreHint),
    ('/api/features/?$', FeaturesAPI),
    ('/api/firmware/?$', FirmwareAPI),
    ('/api/firmware/info/?$', FirmwareInfoAPI),
    ('/api/firmware/history/?$', FirmwareHistoryAPI),
    ('/api/presleep/?$', PreSleepAPI),
    ('/api/tokens/?$', TokenAPI),
    ('/api/teams/?$', TeamsAPI),
    ('/api/troubleshoot/?$', InactiveDevicesAPI),
    ('/api/searchify_stats/?$', SearchifyStatsAPI),
    ('/api/recent_users/?$', RecentUsersAPI),
    ('/api/zendesk/?$', ZendeskAPI),
    ('/api/zendesk_stats/?$', ZendeskStatsAPI),
    ('/api/zendesk_history/?$', ZendeskHistoryAPI),
    ('/api/zendesk_now/?$', ZendeskNowAPI),
    ('/api/timeline/?$', TimelineAPI),
    ('/api/viewer_permission/?$', ViewPermissionAPI),
    ('/api/notification/?$', NotificationAPI),
    ('/api/motion/?$', MotionAPI),
    ('/api/sense_key_provision/?$', SenseKeyProvision),
    ('/api/pill_key_provision/?$', PillKeyProvision),
    ('/api/room_conditions/?$', RoomConditionsAPI),
    ('/api/label_data/?$', LabelDataAPI),
    ('/api/alarms/?$', AlarmsAPI),
    ('/api/password_reset/?$', PasswordResetAPI),
    ('/api/orders/?$', OrdersAPI),
    ('/api/append_app_info/?$', AppendAppInfo),
    ('/api/omni_search/?$', OmniSearchAPI),
    ('/api/force_password_update/?$', ForcePasswordUpdateAPI),
    ('/api/update_geckoboard_credentials/?$', UpdateGeckoBoardCredentials),
    ('/api/active_devices_minute_history/?$', ActiveDevicesMinuteHistoryAPI),
    ('/api/active_devices_15_minutes_history/?$', ActiveDevices15MinutesHistoryAPI),
    ('/api/active_devices_daily_history/?$', ActiveDevicesDailyHistoryAPI),
    ('/api/sense_events/?$', SenseEventsAPI),
    ('/api/firmware_unhash/?$', FirmwareUnhashAPI),
    ('/api/dust_stats/?$', DustStatsAPI),
    ('/api/user_search/?$', UserSearchAPI),
    ('/api/device_by_email/?$', DeviceByEmailAPI),
    ('/api/timezone/?$', TimezoneAPI),
    ('/api/pch_sn_check/?$', PCHSerialNumberCheckAPI),
    ('/api/papertrail_events/?$', PaperTrailEventsAPI),
    ('/api/papertrail_systems/?$', PaperTrailSystemsAPI),
    ('/api/account_breakdown/?$', AccountCountsBreakdownByCreatedDateAPI),
    ('/api/wifi_signal_strength/?$', WifiSignalStrengthAPI),
    ('/api/onboarding_logs_by_result/?$', OnboardingLogsByResultAPI),
    ('/api/onboarding_logs_by_sense_id/?$', OnboardingLogsBySenseIdAPI),
    ('/api/last_room_conditions/?$', LastRoomConditionsAPI),
    ('/api/log_facets/?$', LogsPatternFacetsAPI),
    ('/api/alarms_by_email/?$', AlarmsByEmailAPI),
    ('/api/sense_color/?$', SenseColorAPI),
    ('/api/sense_logs_new/?$', SenseLogsNewAPI),
    ('/api/timezone_history/?$', TimezoneHistoryAPI),
]

page_routes = [
    ('/', AccountProfileView),
    ('/battery/?$', BatteryView),
    ('/charts', ChartHandler),
    ('/configuration/?$', ConfigurationView),
    ('/create_account', CreateAccountAPI),
    ('/sense_logs/?$', SenseLogsView),
    ('/application_logs/?$', ApplicationLogsView),
    ('/error/?$', ErrorView),
    ('/firmware/?$', FirmwareView),
    ('/proxy/(.*)', ProxyAPI),
    ('/register_pill', RegisterPillAPI),
    ('/sense/?$', SenseVisualView),
    ('/settings/?$', SettingsView),
    ('/api/setup', SetupAPI),
    ('/teams/?$', TeamsView),
    ('/update', UpdateAdminAccessTokenAPI),
    ('/users/?$', UserView),
    ('/zendesk/?$', ZendeskView),
    ('/troubleshoot/?$', TroubleshootView),
    ('/timeline/?$', TimelineView),
    ('/pairing/?$', PairingView),
    ('/notification/?$', NotificationView),
    ('/key_store/?$', KeyStoreView),
    ('/motion/?$', MotionView),
    ('/keys/?$', KeysView),
    ('/zendesk_history/?$', ZendeskHistoryView),
    ('/zendesk_now/?$', ZendeskNowView),
    ('/provision/?$', CreateKeyView),
    ('/room_conditions/?$', RoomConditionsView),
    ('/label/?$', LabelView),
    ('/alarms/?$', AlarmsView),
    ('/setup/?$', SetupView),
    ('/password_reset/?$', PasswordResetView),
    ('/worker_logs/?$', WorkerLogsView),
    ('/refresh_memcache/?$', RefreshMemcache),
    ('/orders/?$', OrdersView),
    ('/active_devices_history/?$', ActiveDevicesHistoryView),
    ('/sense_events/?$', SenseEventsView),
    ('/dust_stats/?$', DustStatsView),
    ('/users_inspection/?$', UsersInpsectionView),
    ('/account_profile/?$', AccountProfileView),
    ('/recent_accounts/?$', RecentAccountsView),
    ('/pch_serial_number_check/?$', PCHSerialNumberCheckView),
    ('/onboarding_logs/?$', OnboardingLogsView),
    ('/log_facets/?$', LogsPatternFacetsView),
    ('/sense_logs_new/?$', SenseLogsNewView),
]

file_upload_routes = [
    ('/pill_bin_upload', PillKeyDecryptAPI),
    ('/pill_bin_upload/([^/]+)/([^/]+)', PillProvisionAPI),
]

hello_admin_app = webapp2.WSGIApplication(
    routes=cron_routes + api_routes + page_routes + file_upload_routes,
    debug=settings.DEBUG
)
