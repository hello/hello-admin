from helpers import ProtectedRequestHandler
from handlers.utils import get_current_pacific_datetime
import json

class AlarmsAPI(ProtectedRequestHandler):
    def get(self):
        ''' Get all imminent alarms '''
        impersonatee_token = self.request.get("impersonatee_token")
        self.hello_request(
            api_url="alarms",
            type="GET",
            impersonatee_token=impersonatee_token
        )
    def post(self):
        ''' Set an alarm '''
        body = json.loads(self.request.body)
        self.hello_request(
            api_url="alarms/{}".format(body['client_time_utc']),
            type="POST",
            impersonatee_token=body['impersonatee_token'],
            body_data=json.dumps(body['data'])
        )