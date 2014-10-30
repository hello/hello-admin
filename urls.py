import webapp2
import settings
from main import MainHandler, CreateTokenHandler, ChartHandler, \
    CreateAccountHandler, SetupHandler, CreateApplicationAgainstProdHandler, \
    ProxyHandler, RegisterPillHandler, UpdateAdminAccessToken, UserDashboardHandler, \
    UserAPI, AppAPI, AppScopeAPI, AppScopeHandler, ZendeskAPI, PreSleepAPI, RecentTokensAPI, Viz

api_routes = [
    ('/api/app/?$', AppAPI),
    ('/api/app_scope/?$', AppScopeAPI),
    ('/api/user/?$', UserAPI),
    ('/api/zendesk/?$', ZendeskAPI),
    ('/api/presleep/?$', PreSleepAPI),
    ('/api/recent_tokens/?$', RecentTokensAPI),
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
    ('/viz/?$', Viz),
]

hello_admin_app = webapp2.WSGIApplication(
    routes=api_routes + page_routes,
    debug=settings.DEBUG
)
