import webapp2

import settings
from handlers.setup import ProxyHandler, AppHandler, AppScopesHandler, RecentTokensHandler, CreateTokenHandler, \
    CreateAccountHandler, CreateApplicationAgainstProdHandler, RegisterPillHandler, SetupHandler, UpdateAdminAccessToken
from handlers.ext import ZendeskHandler
from handlers.user import UserAPI
from handlers.metrics import PreSleepAPI
from handlers.views import MainHandler, UserDashboardHandler, AppScopeHandler, DataVisual, ChartHandler

api_routes = [
    ('/api/app/?$', AppHandler),
    ('/api/app_scope/?$', AppScopesHandler),
    ('/api/user/?$', UserAPI),
    ('/api/presleep/?$', PreSleepAPI),
    ('/api/recent_tokens/?$', RecentTokensHandler),
    ('/api/zendesk/?$', ZendeskHandler),
    # ('/api/proxy/?$', ProxyAPI),
]


page_routes = [
    ('/', MainHandler),
    ('/app_scope/?$', AppScopeHandler),
    ('/access_token', CreateTokenHandler),
    ('/charts', ChartHandler),
    ('/create_account', CreateAccountHandler),
    ('/setup', SetupHandler),
    ('/create/app_against_prod', CreateApplicationAgainstProdHandler),
    ('/proxy/(.*)', ProxyHandler),
    ('/register_pill', RegisterPillHandler),
    ('/update', UpdateAdminAccessToken),
    ('/user_dashboard/?$', UserDashboardHandler),
    ('/viz/?$', DataVisual),
]

hello_admin_app = webapp2.WSGIApplication(
    routes=api_routes + page_routes,
    debug=settings.DEBUG
)
