import webapp2

import settings
from handlers.setup import ProxyAPI, AppAPI, AppScopeAPI, RecentTokensAPI, CreateTokenAPI, \
    CreateAccountAPI, CreateApplicationAgainstProdAPI, RegisterPillAPI, SetupAPI, UpdateAdminAccessTokenAPI
from handlers.ext import ZendeskAPI
from handlers.user import UserAPI
from handlers.metrics import PreSleepAPI
from handlers.views import UserDashboardView, ChartHandler, SenseVisualView, SettingsView, HomeView, ZendeskView

api_routes = [
    ('/api/app/?$', AppAPI),
    ('/api/app_scope/?$', AppScopeAPI),
    ('/api/user/?$', UserAPI),
    ('/api/presleep/?$', PreSleepAPI),
    ('/api/recent_tokens/?$', RecentTokensAPI),
    ('/api/zendesk/?$', ZendeskAPI),
]


page_routes = [
    ('/', HomeView),
    ('/access_token', CreateTokenAPI),
    ('/charts', ChartHandler),
    ('/create_account', CreateAccountAPI),
    ('/setup', SetupAPI),
    ('/create/app_against_prod', CreateApplicationAgainstProdAPI),
    ('/proxy/(.*)', ProxyAPI),
    ('/register_pill', RegisterPillAPI),
    ('/update', UpdateAdminAccessTokenAPI),
    ('/user_dashboard/?$', UserDashboardView),
    ('/sense/?$', SenseVisualView),
    ('/settings/?$', SettingsView),
    ('/zendesk/?$', ZendeskView),
]

hello_admin_app = webapp2.WSGIApplication(
    routes=api_routes + page_routes,
    debug=settings.DEBUG
)
