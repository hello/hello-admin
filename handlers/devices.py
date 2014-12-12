from handlers.helpers import ProtectedRequestHandler
import logging as log

class DeviceAPI(ProtectedRequestHandler):
    """Retrieve devices list and their specs"""

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

class DeviceOwnersAPI(ProtectedRequestHandler):
    """Retrieve owners of a device"""

    def get(self):
        device_id = self.request.get('device_id', default_value="")
        log.info("Getting accounts associated with device {}".format(device_id))

        self.hello_request(
            api_url="devices/{}/accounts".format(device_id),
            type="GET",
            filter_fields=['email']
        )