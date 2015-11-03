import json
from core.handlers.base import ProtectedRequestHandler

class LogsLevelAPI(ProtectedRequestHandler):
    def put(self):
        body = json.loads(self.request.body)
        self.hello_request(
            api_url="devices/{}/set_log_level".format(body.get("device_id")),
            type="PUT",
            url_params={
                "fw_version": body.get("fw_version"),
                "log_level": body.get("log_level"),
            }
        )

    def get(self):
        self.hello_request(
            api_url="devices/get_log_levels",
            type="GET",
        )
