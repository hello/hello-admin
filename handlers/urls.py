import webapp2
from handlers.pill_status import PillStatusAPI
from handlers.deprecated import InactiveDevicesAPI, PreSleepAPI
from handlers.searchify_logs import SenseLogsAPI, ApplicationLogsAPI, SearchifyStatsAPI
from handlers.timeline import TimelineAPI
import settings
from handlers.configuration import FeaturesAPI
from handlers.cron import ZendeskCronHandler
from handlers.cron import SensePurge
from handlers.cron import ApplicationPurge
from handlers.cron import WorkersPurge
from handlers.cron import SearchifyPurgeQueue
from handlers.cron import GeckoboardPush
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
from handlers.searchify_logs import WorkerLogsAPI
from views import WorkerLogsView
from handlers.memcache import RefreshMemcache
from handlers.orders import OrdersAPI
from handlers.users import RecentUsersAPI
from handlers.setup import AppendAppInfo
from handlers.users import ForcePasswordUpdateAPI
from handlers.cron import StoreRecentlyActiveDevicesStats
from handlers.devices import ActiveDevicesHistoryAPI
from handlers.views import ActiveDevicesHistoryView
from handlers.events import SenseEventsAPI
from handlers.views import SenseEventsView
from handlers.firmware import FirmwareUnhashAPI

cron_routes = [
    ('/cron/sense_purge/?$', SensePurge),
    ('/cron/application_purge/?$', ApplicationPurge),
    ('/cron/workers_purge/?$', WorkersPurge),
    ('/cron/searchify_purge_queue/?$', SearchifyPurgeQueue),
    ('/cron/zendesk_daily_stats', ZendeskCronHandler),
    ('/cron/geckoboard_push', GeckoboardPush),
    ('/cron/store_recently_active_devices_stats', StoreRecentlyActiveDevicesStats),
]

api_routes = [
    ('/api/app/?$', AppAPI),
    ('/api/app_scope/?$', AppScopeAPI),
    ('/api/battery/?$', PillStatusAPI),
    ('/api/create_groups/?$', CreateGroupsAPI),
    ('/api/create_key_store_locker/?$', CreateKeyStoreLockerAPI),
    ('/api/sense_logs/?$', SenseLogsAPI),
    ('/api/application_logs/?$', ApplicationLogsAPI),
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
    ('/api/worker_logs/?$', WorkerLogsAPI),
    ('/api/orders/?$', OrdersAPI),
    ('/api/append_app_info/?$', AppendAppInfo),
    ('/api/omni_search/?$', OmniSearchAPI),
    ('/api/force_password_update/?$', ForcePasswordUpdateAPI),
    ('/api/update_geckoboard_credentials/?$', UpdateGeckoBoardCredentials),
    ('/api/active_devices_history/?$', ActiveDevicesHistoryAPI),
    ('/api/sense_events/?$', SenseEventsAPI),
    ('/api/firmware_unhash/?$', FirmwareUnhashAPI),
]

page_routes = [
    ('/', UserView),
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
]

file_upload_routes = [
    ('/pill_bin_upload', PillKeyDecryptAPI),
    ('/pill_bin_upload/([^/]+)/([^/]+)', PillProvisionAPI),
]

hello_admin_app = webapp2.WSGIApplication(
    routes=cron_routes + api_routes + page_routes + file_upload_routes,
    debug=settings.DEBUG
)
