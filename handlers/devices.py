from handlers.helpers import ProtectedRequestHandler
import logging as log

class DeviceAPI(ProtectedRequestHandler):
    '''Enables OTA firmware updates'''

    def get(self):
        email = self.request.get('email', default_value="")
        log.info("Getting devices IDs list for {}".format(email))

        self.hello_request(
            api_url="devices/q",
            type="GET",
            url_params={'email': email},
        )

    def post(self):
        email = self.request.get('email', default_value="")
        log.info("Getting devices specs for {}".format(email))

        self.hello_request(
            api_url="devices/specs",
            type="GET",
            url_params={'email': email},
        )