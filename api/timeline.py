from core.handlers.base import ProtectedRequestHandler
import settings

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
                "client_id": settings.MOBILE_OAUTH_CLIENT_ID
            })
        ).data.get("access_token")

    def get(self):
        token = self.get_impersonatee_token()
        print "TOKEN", token
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


class TimelineLogsAPI(ProtectedRequestHandler):
    def get(self):
        self.hello_request(
            api_url="timelines/summary/{}".format(self.request.get("date")),
            type="GET",
        )


class TimelineLogsHistoryAPI(ProtectedRequestHandler):
    def get(self):
        self.hello_request(
            api_url="timelines/summary_batch",
            url_params={"start_date": self.request.get("start_date"), "end_date": self.request.get("end_date")},
            type="GET",
        )

