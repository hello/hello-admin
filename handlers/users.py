import jinja2
import os
import json
import settings
from handlers.helpers import BaseRequestHandler
from handlers.helpers import ProtectedRequestHandler
from handlers.helpers import ResponseOutput
from models.setup import RecentUsers
from google.appengine.api import memcache

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


class RecentUsersAPI(ProtectedRequestHandler):
    def get(self):
        """Update cached recently users"""
        MAX_RECENT_USERS_LENGTH = 60
        output = ResponseOutput()
        try:
            recent_users = json.loads(self.hello_request(
                api_url="account/recent",
                type="GET",
                test_mode=True
            ).get_serialized_output())['data']

            previously_cached_recent_users = json.loads(memcache.get("recent_users" + settings.ENVIRONMENT) or "[]")
            previously_cached_recent_ids = [u['id'] for u in previously_cached_recent_users]
            new_users = [u for u in recent_users if u['id'] not in previously_cached_recent_ids]

            combined_recent_users = (new_users + previously_cached_recent_users)[:MAX_RECENT_USERS_LENGTH]

            self.update_or_create_memcache(key="recent_users", value=json.dumps(combined_recent_users), environment=settings.ENVIRONMENT)
            output.set_status(200)
            output.set_data(combined_recent_users)

        except Exception as e:
            output.set_error(e.message)
            output.set_status(500)

        self.response.write(output.get_serialized_output())


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