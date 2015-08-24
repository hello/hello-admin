import logging as log
import json
import settings

from handlers.helpers import ProtectedRequestHandler

class SenseEventsAPI(ProtectedRequestHandler):
    def get(self):
        device_id = self.request.get("device_id", "")
        start_ts = int(self.request.get("start_ts", 0))
        limit = int(self.request.get("limit", 0))

        self.hello_request(
            api_url="events/{}".format(device_id),
            type="GET",
            url_params={"start_ts": start_ts} if limit == 0 else {"start_ts": start_ts, "limit": limit}
        )
