import json
import settings
from helpers import ProtectedRequestHandler


class AlarmsAPI(ProtectedRequestHandler):
    def get(self):
        ''' Get all imminent alarms '''
        impersonatee_token = self.request.get("impersonatee_token")
        self.hello_request(
            api_url="alarms",
            type="GET",
            access_token=impersonatee_token
        )
    def post(self):
        ''' Set an alarm '''
        body = json.loads(self.request.body)
        self.hello_request(
            api_url="alarms/{}".format(body['client_time_utc']),
            type="POST",
            access_token=body['impersonatee_token'],
            body_data=json.dumps(body['data'])
        )


class AlarmsByEmailAPI(ProtectedRequestHandler):
    def get(self):
        self.hello_request(
            api_url="alarms/{}".format(self.request.get("email")),
            type="GET",
            app_info=settings.ADMIN_APP_INFO
        )

class AlarmRingsHistoryAPI(ProtectedRequestHandler):
    def get(self):
        self.hello_request(
            api_url="account/ring_history",
            type="GET",
            app_info=settings.ADMIN_APP_INFO,
            url_params={
                "email": self.request.get("email"),
                "start_time_millis": self.request.get("start"),
                "end_time_millis": self.request.get("end")
            }
        )