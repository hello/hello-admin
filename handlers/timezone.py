import time
import settings
from handlers.helpers import ProtectedRequestHandler


class TimezoneAPI(ProtectedRequestHandler):
    def get(self):
        self.hello_request(
            api_url="devices/timezone",
            type="GET",
            url_params={
                "email": self.request.get("email", default_value=None),
                "sense_id": self.request.get("sense_id", default_value=None),
                "event_ts": int(self.request.get("event_ts", default_value=time.time()*1000))
            },
            app_info=settings.ADMIN_APP_INFO
        )


class TimezoneHistoryAPI(ProtectedRequestHandler):
    def get(self):
        self.hello_request(
            api_url="account/timezone_history/{}".format(self.request.get("email")),
            type="GET",
            app_info=settings.ADMIN_APP_INFO
        )