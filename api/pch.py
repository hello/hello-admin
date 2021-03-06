import time
import logging as log

from google.appengine.api import memcache
from google.appengine.api import urlfetch

from core.models.response import ResponseOutput
from core.handlers.base import ProtectedRequestHandler
from core.utils.time_helpers import epoch_to_human


THROTTLE_PERIOD = 60
PCH_SENSE_SN_KEY = {
    "sense": "pch_sense_sn",
    "pill": "pch_pill_sn",
}


class PCHSerialNumberCheckAPI(ProtectedRequestHandler):
    @property
    def device_type(self):
        return self.request.get("device_type", default_value="sense")

    def check_sn(self):
        urlfetch.set_default_fetch_deadline(15)
        log.info("SNs: {}".format(self.request.get("sn")))
        self.hello_request(
            api_url="pch/check/{}".format(self.device_type),
            type="POST",
            body_data=self.request.get("sn"),
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


