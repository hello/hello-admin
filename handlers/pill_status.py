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

        last_week_data = self.hello_request(
            api_url="devices/pill_status",
            type="GET",
            raw_output=True,
            app_info=self.get_app_info(),
            url_params=url_params,
        ).data

        previous_last_week_data = []

        if last_week_data:
            url_params["end_ts"] = min([d['lastSeen'] for d in last_week_data])
            previous_last_week_data = self.hello_request(
                api_url="devices/pill_status",
                type="GET",
                raw_output=True,
                app_info=self.get_app_info(),
                url_params=url_params,
            ).data

        output = {'error': '', 'data': []}

        try:
            aggregate_data = last_week_data + previous_last_week_data
            battery_by_pill_id = defaultdict(list)

            if not aggregate_data:
                output['error'] = "No data found!"

            for d in aggregate_data:
                battery_by_pill_id['pill{}'.format(d['deviceId'])].append(d)

            output['data'] = dict(battery_by_pill_id).values()

        except Exception as e:
            output['error'] = e.message

        self.response.write(json.dumps(output))
