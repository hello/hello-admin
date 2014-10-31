import datetime as dt
import logging as log
from models.setup import AccessToken
import jinja2
import os
from handlers.helpers import BaseRequestHandler

this_file_path = os.path.dirname(__file__)
JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.split(this_file_path)[0]),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True
)

class MainHandler(BaseRequestHandler):
     def get(self):
        self.render_to_response(template_file='templates/index.html',
                                context={'title': 'Hello - Admin'})

class UserDashboardHandler(BaseRequestHandler):
    def get(self):
        self.render_to_response(template_file='templates/user_dashboard.html',
                                context={'title': 'Hello - User Dashboard'})

class AppScopeHandler(BaseRequestHandler):
    def get(self):
        self.render_to_response(template_file='templates/app_scope.html',
                                context={'title': 'Hello - App Scopes'})

class DataVisual(BaseRequestHandler):
    def get(self):
        self.render_to_response(template_file='templates/viz.html',
                                context={'title': 'Hello - Data Visual'})

class ChartHandler(BaseRequestHandler):
    def get(self):
        template = JINJA_ENVIRONMENT.get_template('templates/charts.html')
        tokens = AccessToken.query_tokens()
        day = dt.datetime.strftime(dt.datetime.now(), "%Y-%m-%d")
        self.response.write(template.render({'tokens': tokens, 'day': day}))

