from core.handlers.base import ProtectedRequestHandler
import json

class DustOffsetAPI(ProtectedRequestHandler):
    def get(self):
        # self.hello_request(
        #     api_url="calibration/{}".format(self.request.get("sense_id"))
        #     type="GET",
        # )
        self.response.write(json.dumps({"error": "x", "data": {
            "sense_id": "sep-28",
            "dust_offset": 1579,
            "dust_calibration_delta": "Just Placeholder, Back-end not ready",
            "tested_at": 1356789789777
        }}))

    def put(self):
        # self.hello_request(
        #     body_data=json.dumps({"sense_id": self.request.get("sense_id")}),
        #     type="PUT",
        # )
        self.response.write(json.dumps({"error": "", "data": {}}))