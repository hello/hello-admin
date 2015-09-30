from core.handlers.base import ProtectedRequestHandler

class DustCalibrationAPI(ProtectedRequestHandler):
    def get(self):
        self.hello_request(
            api_url="calibration/{}".format(self.request.get("sense_id")),
            type="GET"
        )

    def put(self):
        self.send_to_slack_admin_logs_channel("{} has put a new calibration {}".format(self.current_user, self.request.body))
        self.hello_request(
            api_url="calibration",
            body_data=self.request.body,
            type="PUT"
        )

class DustOffsetAPI(ProtectedRequestHandler):
    def get(self):
        self.hello_request(
            api_url="calibration/average_dust/{}".format(self.request.get("account_id")),
            url_params={"sense_internal_id": self.request.get("sense_internal_id")},
            type="GET"
        )