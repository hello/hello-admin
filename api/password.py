import json
from handlers.helpers import ProtectedRequestHandler, CustomerExperienceRequestHandler


class PasswordResetAPI(ProtectedRequestHandler):
    def post(self):
        """
        Send a password reset link to input email
        """
        body = json.loads(self.request.body)
        email = body.get("email")
        self.hello_request(
            api_info=self.suripu_app,
            api_url="password_reset",
            type="POST",
            body_data=json.dumps({"email": email})
        )
        self.send_to_slack_admin_logs_channel("Employee {} sent a link to reset password to customer {}".format(self.current_user_email, email))


class PasswordForceUpdateAPI(CustomerExperienceRequestHandler):
    def post(self):
        """
        Force update password on behalf of user
        """
        body = json.loads(self.request.body)
        email = body.get("email")
        password = body.get("password")
        self.hello_request(
            api_url="account/update_password",
            type="POST",
            body_data=json.dumps({"email": email, "password": password}),
        )
        self.send_to_slack_admin_logs_channel("Employee {} hard-reseted password for customer {}".format(self.current_user_email, email))