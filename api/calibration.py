from core.handlers.base import ProtectedRequestHandler
from core.models.response import ResponseOutput
from models.ext import DustCalibrationLeftOverPairs

AVG_CALIBRATED_ADC = 300
BASE = 300
K_FACTOR = 1.3

class DustCalibrationAPI(ProtectedRequestHandler):
    def get(self):
        self.hello_request(
            api_url="calibration/{}".format(self.request.get("sense_id")),
            type="GET"
        )

    def put(self):
        self.slack_pusher.send_to_dust_calibration_channel("{} has put a new calibration {}".format(self.current_user, self.request.body))
        self.hello_request(
            api_url="calibration",
            body_data=self.request.body,
            type="PUT"
        )

class DustOffsetAPI(ProtectedRequestHandler):
    def get(self):
        raw_response = self.hello_request(
            api_url="calibration/average_dust/{}".format(self.request.get("account_id")),
            url_params={"sense_internal_id": self.request.get("sense_internal_id")},
            type="GET",
            raw_output=True
        )
        adc_offset_dict = {}

        if raw_response.data:
            adc_offset_dict["adc_offset"] = int((AVG_CALIBRATED_ADC - raw_response.data.values()[0] - BASE)/(-1 * K_FACTOR))

        raw_response.set_data(adc_offset_dict)
        self.response.write(raw_response.get_serialized_output())


class DustCalibrationLeftOverPairsAPI(ProtectedRequestHandler):
    def get(self):
        all_left_over_pairs = DustCalibrationLeftOverPairs.query()

        response_output = ResponseOutput(
            data=[p.to_dict() for p in all_left_over_pairs],
            status=200,
            viewer=self.current_user_email
        )

        self.response.write(response_output.get_serialized_output())


