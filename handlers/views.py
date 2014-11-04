import datetime as dt
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


class ChartHandler(BaseRequestHandler):
    def get(self):
        template = JINJA_ENVIRONMENT.get_template('templates/charts.html')
        tokens = AccessToken.query_tokens()
        day = dt.datetime.strftime(dt.datetime.now(), "%Y-%m-%d")
        self.response.write(template.render({'tokens': tokens, 'day': day}))

class UserDashboardView(BaseRequestHandler):
    def get(self):
        self.render_to_response(template_file='templates/user_dashboard.html',
                                context={'title': '- User Dashboard'})

class HomeView(BaseRequestHandler):
    def get(self):
        self.render_to_response(template_file='templates/home.html',
                                context={'title': 'Home'})

class SenseVisualView(BaseRequestHandler):
    def get(self):
        self.render_to_response(template_file='templates/sense.html',
                                context={'title': '- Sense Visual'})

class ZendeskView(BaseRequestHandler):
     def get(self):
         self.render_to_response(template_file='templates/zendesk.html',
                                context={'title': '- Zendesk'})

class SettingsView(BaseRequestHandler):
     def get(self):
        self.render_to_response(template_file='templates/settings.html',
                                context={'title': '- Settings'})
