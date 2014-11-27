import jinja2
import os
from handlers.helpers import BaseRequestHandler

JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True
)


class UserAPI(BaseRequestHandler):
    def get(self):
        """
        Grab users by email / list of recent users
        """
        email = self.request.get('email', default_value="")
        self.hello_request(
            api_url="account/q" if email != "" else "account/recent",
            type="GET",
            url_params={'email': email},
    )