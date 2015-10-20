from google.appengine._internal.django.utils.datetime_safe import datetime
from core.handlers.base import ProtectedRequestHandler


class PillLastHeartbeatAPI(ProtectedRequestHandler):
    def get(self):
        self.hello_request(
            api_url="heartbeat/{}".format(self.request.get("pill_id")),
            type="GET",
        )


class PillHeartbeatsAPI(ProtectedRequestHandler):
    def get(self):
        url_params={
            "email": self.request.get("email"),
            "pill_id_partial": self.request.get("pill_id_partial"),
            "start_ts": self.request.get("start_ts", default_value=int(datetime.datetime.now().strftime("%s") * 1000))
        }

        email = self.request.get("email")
        if email:
            url_params["email"] = email

        pill_id_partial = self.request.get("pill_id_partial")
        if email:
            url_params["pill_id_partial"] = pill_id_partial

        self.hello_request(
            api_url="heartbeats",
            url_params=url_params,
            type="GET",
        )