import settings
import time
from handlers.helpers import ProtectedRequestHandler, ResponseOutput
from utils import epoch_to_human
from google.appengine.api import memcache

THROTTLE_PERIOD = 2*60
PCH_SENSE_SN_MEMCACHE_KEY = "pch_sense-sn"


class PCHSerialNumberCheckSenseAPI(ProtectedRequestHandler):
    def check_sn_sense(self):
        self.hello_request(
            api_url="pch/check/sense",
            type="POST",
            body_data=self.request.body,
            app_info=settings.ADMIN_APP_INFO
        )

    def post(self):
        current_cache = memcache.get(PCH_SENSE_SN_MEMCACHE_KEY)
        if not current_cache:  # memcache has expired, i.e. can check sn sense now
            next_expiration_time = time.time() + THROTTLE_PERIOD
            memcache.add(key=PCH_SENSE_SN_MEMCACHE_KEY, value=epoch_to_human(next_expiration_time), time=next_expiration_time)
            self.check_sn_sense()
        else:
            response_output = ResponseOutput()
            response_output.set_status(400)
            response_output.set_error("You can't query again until {}".format(current_cache))
            self.response.write(response_output.get_serialized_output())


