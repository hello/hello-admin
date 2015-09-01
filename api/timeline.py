from core.handlers.base import ProtectedRequestHandler
__author__ = 'zet'
import json


class TimelineAPI(ProtectedRequestHandler):
    def get(self):
        """Retrieve user timeline"""
        email = self.request.get('email')
        date = self.request.get('date')
        self.hello_request(
            api_url="timeline/admin/{}/{}".format(email, date),
            type="GET",
            api_info=self.suripu_app
        )

    def post(self):
        """Invalidate cache for user timeline"""
        email = self.request.get('email')
        date = self.request.get('date')
        self.hello_request(
            api_url="timeline/admin/invalidate/{}/{}".format(email, date),
            type="GET",
            api_info=self.suripu_app
        )

class TimelineV2API(ProtectedRequestHandler):
    def get_impersonatee_token(self):
        return self.hello_request(
            api_url="token/implicit",
            type="POST",
            raw_output=True,
            api_info=self.suripu_admin,
            body_data=json.dumps({
                "email": self.request.get("email"),
                "client_id": "timeline-research"
            })
        ).data.get("access_token")

    def get(self):
        token = self.get_impersonatee_token()
        self.hello_request(
            api_url="timeline/{}".format(self.request.get("date")),
            type="GET",
            api_info=self.suripu_app_v2,
            access_token=token
        )


class TimelineAlgorithmAPI(ProtectedRequestHandler):
    def get(self):
        email = self.request.get('email')
        date = self.request.get('date')
        self.hello_request(
            api_url="timeline/admin/algo/{}/{}".format(email, date),
            type="GET",
            api_info=self.suripu_app
        )