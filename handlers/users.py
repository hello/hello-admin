import jinja2
import os
import json
from handlers.helpers import BaseRequestHandler
from handlers.helpers import ProtectedRequestHandler

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


class PasswordResetAPI(ProtectedRequestHandler):
    def post(self):
        """
        Send a password reset link to input email
        """
        body = json.loads(self.request.body)
        email = body.get("email")
        self.hello_request(
            api_url="password_reset",
            type="POST",
            body_data=json.dumps({"email": email})
        )