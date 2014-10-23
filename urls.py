import webapp2
import settings
from main import MainHandler, CreateTokenHandler, ChartHandler, \
    CreateAccountHandler, CreateApplicationHandler, CreateApplicationAgainstProdHandler, \
    ProxyHandler, RegisterPillHandler, UpdateAdminAccessToken, UserDashboardHandler

hello_admin_app = webapp2.WSGIApplication(routes=[
    ('/', MainHandler),
    ('/access_token', CreateTokenHandler),
    ('/charts', ChartHandler),
    ('/create_account', CreateAccountHandler),
    ('/create/app', CreateApplicationHandler),
    ('/create/app_against_prod', CreateApplicationAgainstProdHandler),
    ('/proxy/(.*)', ProxyHandler),
    ('/register_pill', RegisterPillHandler),
    ('/update', UpdateAdminAccessToken),
    ('/user_dashboard', UserDashboardHandler),
], debug=settings.DEBUG)
