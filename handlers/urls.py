import webapp2
import settings
from handlers.configuration import FeaturesAPI
from handlers.cron import ZendeskCronHandler
from handlers.cron import SearchifyPurge
from handlers.zendesk import ZendeskAPI
from handlers.zendesk import ZendeskStatsAPI
from handlers.zendesk import ZendeskHistoryAPI
from handlers.zendesk import ZendeskNowAPI
from handlers.firmware import FirmwareAPI
from handlers.devices import DeviceAPI
from handlers.devices import DeviceInactiveAPI
from handlers.devices import DeviceKeyStoreHint
from handlers.metrics import BatteryAPI
from handlers.devices import DeviceOwnersAPI
from handlers.metrics import DebugLogAPI
from handlers.metrics import ApplicationLogsAPI
from handlers.metrics import SearchifyStatsAPI
from handlers.metrics import PreSleepAPI
from handlers.metrics import TimelineAPI
from handlers.metrics import TroubleshootAPI
from handlers.setup import AppAPI
from handlers.setup import AppScopeAPI
from handlers.setup import CreateAccountAPI
from handlers.setup import CreateApplicationAgainstProdAPI
from handlers.setup import CreateGroupsAPI
from handlers.setup import CreateKeyStoreLockerAPI
from handlers.setup import ProxyAPI
from handlers.setup import TokenAPI
from handlers.setup import RegisterPillAPI, SetupAPI
from handlers.setup import UpdateAdminAccessTokenAPI
from handlers.teams import TeamsAPI
from handlers.users import UserAPI
from handlers.views import BatteryView
from handlers.keys import KeysAPI
from handlers.views import ChartHandler
from handlers.views import ConfigurationView
from handlers.views import DebugLogView
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
from handlers.views import KeysView
from handlers.views import ZendeskHistoryView
from handlers.views import ZendeskNowView

cron_routes = [
    ('/cron/zendesk_daily_stats', ZendeskCronHandler),
    ('/cron/searchify_purge', SearchifyPurge),
]

api_routes = [
    ('/api/app/?$', AppAPI),
    ('/api/app_scope/?$', AppScopeAPI),
    ('/api/battery/?$', BatteryAPI),
    ('/api/create_groups/?$', CreateGroupsAPI),
    ('/api/create_key_store_locker/?$', CreateKeyStoreLockerAPI),
    ('/api/debug_log/?$', DebugLogAPI),
    ('/api/application_logs/?$', ApplicationLogsAPI),
    ('/api/devices/?$', DeviceAPI),
    ('/api/devices/inactive/?$', DeviceInactiveAPI),
    ('/api/devices/owners/?$', DeviceOwnersAPI),
    ('/api/devices/key_store/?$', DeviceKeyStoreHint),
    ('/api/features/?$', FeaturesAPI),
    ('/api/firmware/?$', FirmwareAPI),
    ('/api/presleep/?$', PreSleepAPI),
    ('/api/tokens/?$', TokenAPI),
    ('/api/teams/?$', TeamsAPI),
    ('/api/troubleshoot/?$', TroubleshootAPI),
    ('/api/searchify_stats/?$', SearchifyStatsAPI),
    ('/api/user/?$', UserAPI),
    ('/api/zendesk/?$', ZendeskAPI),
    ('/api/zendesk_stats/?$', ZendeskStatsAPI),
    ('/api/zendesk_history/?$', ZendeskHistoryAPI),
    ('/api/zendesk_now/?$', ZendeskNowAPI),
    ('/api/timeline/?$', TimelineAPI),
    ('/api/viewer_permission/?$', ViewPermissionAPI),
    ('/api/notification/?$', NotificationAPI),
    ('/api/motion/?$', MotionAPI),
    ('/api/keys/?$', KeysAPI),
]

page_routes = [
    ('/', UserView),
    ('/battery/?$', BatteryView),
    ('/charts', ChartHandler),
    ('/configuration/?$', ConfigurationView),
    ('/create/app_against_prod', CreateApplicationAgainstProdAPI),
    ('/create_account', CreateAccountAPI),
    ('/debug_log/?$', DebugLogView),
    ('/application_logs/?$', ApplicationLogsView),
    ('/error/?$', ErrorView),
    ('/firmware/?$', FirmwareView),
    ('/proxy/(.*)', ProxyAPI),
    ('/register_pill', RegisterPillAPI),
    ('/sense/?$', SenseVisualView),
    ('/settings/?$', SettingsView),
    ('/setup', SetupAPI),
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
]

hello_admin_app = webapp2.WSGIApplication(
    routes=cron_routes + api_routes + page_routes,
    debug=settings.DEBUG
)
