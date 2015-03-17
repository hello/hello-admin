from collections import defaultdict
import json
from handlers.helpers import ProtectedRequestHandler, ResponseOutput

__author__ = 'zet'


class PillStatusAPI(ProtectedRequestHandler):
    def get(self):
        email = self.request.get('email', '')
        pill_id = self.request.get('pill_id', '')
        battery_data = ResponseOutput()

        if email:
            battery_data = self.hello_request(
                api_url="devices/pill/{}/status".format(email),
                type="GET",
                test_mode=True
            )
        elif pill_id:
            battery_data = self.hello_request(
                api_url="devices/pill/id/{}/status".format(pill_id),
                type="GET",
                test_mode=True
            )

        battery_by_pill_id = defaultdict(list)
        for d in battery_data.data:
            battery_by_pill_id['pill{}'.format(d['deviceId'])].append(d)
        self.response.write(json.dumps({'data': dict(battery_by_pill_id).values()}))