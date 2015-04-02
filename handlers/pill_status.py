from collections import defaultdict
import settings
import json
from handlers.helpers import ProtectedRequestHandler, ResponseOutput

__author__ = 'zet'


class PillStatusAPI(ProtectedRequestHandler):
    def get(self):
        search_input = self.request.get("search_input")
        end_ts = int(self.request.get("end_ts", 0))
        url_params = {"end_ts": end_ts}
        url_params.update({"email": search_input} if '@' in search_input else {"pill_id_partial": search_input})
        battery_data = self.hello_request(
            api_url="devices/pill_status",
            type="GET",
            raw_output=True,
            override_app_info=settings.ADMIN_APP_INFO,
            url_params=url_params
        )

        battery_by_pill_id = defaultdict(list)
        for d in battery_data.data:
            battery_by_pill_id['pill{}'.format(d['deviceId'])].append(d)
        self.response.write(json.dumps({'data': dict(battery_by_pill_id).values()}))