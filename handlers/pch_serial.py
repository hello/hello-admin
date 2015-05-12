import settings
import time
from handlers.helpers import ProtectedRequestHandler, ResponseOutput
from utils import epoch_to_human
from google.appengine.api import memcache

THROTTLE_PERIOD = 2*60
PCH_SENSE_SN_KEY = {
    "sense": "pch_sense_sn",
    "pill": "pch_pill_sn",
}


class PCHSerialNumberCheckAPI(ProtectedRequestHandler):
    @property
    def device_type(self):
        return self.request.get("device_type", default_value="sense")

    def check_sn(self):
        self.hello_request(
            api_url="pch/check/{}".format(self.device_type),
            type="POST",
            body_data=self.request.get("sn"),
            app_info=settings.ADMIN_APP_INFO,
            content_type="text/plain" if self.device_type == "pill" else "application/json"
        )

    def post(self):
        key = PCH_SENSE_SN_KEY[self.device_type]
        current_cache = memcache.get(key=key)
        if current_cache is None:  # memcache has expired, i.e. can check device serial number now
            next_expiration_time = time.time() + THROTTLE_PERIOD
            memcache.add(key=key, value=epoch_to_human(next_expiration_time), time=next_expiration_time)
            self.check_sn()
        else:
            response_output = ResponseOutput()
            response_output.set_status(400)
            response_output.set_error("You can't check {} serial number again until {}".format(self.device_type, current_cache))
            self.response.write(response_output.get_serialized_output())


