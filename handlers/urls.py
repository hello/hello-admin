import webapp2
import settings
from handlers.configuration import FeaturesAPI
from handlers.cron import ZendeskCronHandler
from handlers.ext import ZendeskAPI
from handlers.ext import ZendeskStatsAPI
from handlers.firmware import FirmwareAPI
from handlers.devices import DeviceAPI
from handlers.metrics import DebugLogAPI
from handlers.metrics import PreSleepAPI
from handlers.setup import AppAPI
from handlers.setup import AppScopeAPI
from handlers.setup import CreateAccountAPI
from handlers.setup import CreateApplicationAgainstProdAPI
from handlers.setup import CreateGroupsAPI
from handlers.setup import CreateTokenAPI
from handlers.setup import ProxyAPI
from handlers.setup import RecentTokensAPI
from handlers.setup import RegisterPillAPI, SetupAPI
from handlers.setup import UpdateAdminAccessTokenAPI
from handlers.teams import TeamsAPI
from handlers.users import UserAPI
from handlers.views import ChartHandler
from handlers.views import ConfigurationView
from handlers.views import DebugLogView
from handlers.views import ErrorView
from handlers.views import FirmwareView
from handlers.views import SenseVisualView
from handlers.views import SettingsView
from handlers.views import TeamsView
from handlers.views import UserView
from handlers.views import ZendeskView


cron_routes = [
    ('/cron/zendesk_daily_stats', ZendeskCronHandler)
]

api_routes = [
    ('/api/app/?$', AppAPI),
    ('/api/app_scope/?$', AppScopeAPI),
    ('/api/create_groups/?$', CreateGroupsAPI),
    ('/api/debug_log/?$', DebugLogAPI),
    ('/api/devices/?$', DeviceAPI),
    ('/api/features/?$', FeaturesAPI),
    ('/api/firmware/?$', FirmwareAPI),
    ('/api/presleep/?$', PreSleepAPI),
    ('/api/recent_tokens/?$', RecentTokensAPI),
    ('/api/teams/?$', TeamsAPI),
    ('/api/user/?$', UserAPI),
    ('/api/zendesk/?$', ZendeskAPI),
    ('/api/zendesk_stats/?$', ZendeskStatsAPI),
]

page_routes = [
    ('/', UserView),
    ('/access_token', CreateTokenAPI),
    ('/charts', ChartHandler),
    ('/configuration/?$', ConfigurationView),
    ('/create/app_against_prod', CreateApplicationAgainstProdAPI),
    ('/create_account', CreateAccountAPI),
    ('/debug_log/?$', DebugLogView),
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
]

hello_admin_app = webapp2.WSGIApplication(
    routes=cron_routes + api_routes + page_routes,
    debug=settings.DEBUG
)
