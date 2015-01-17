from handlers.helpers import ProtectedRequestHandler
import logging as log
import json
class DeviceAPI(ProtectedRequestHandler):
    """Retrieve devices list and their specs"""

    def get(self):
        email = self.request.get('email', default_value="")
        log.info("Getting devices specs for {}".format(email))

        self.hello_request(
            api_url="devices/specs",
            type="GET",
            url_params={'email': email},
        )

    def post(self):
        device_id = self.request.get('device_id', default_value="")
        device_type = self.request.get('device_type', default_value="")
        impersonatee_token = self.request.get('impersonatee_token', default_value="")
        log.debug("attempting to register {} {}".format(device_type, device_id))

        self.hello_request(
            api_url="devices/{}".format(device_type),
            type="POST",
            body_data=json.dumps({'{}_id'.format(device_type): device_id}),
            impersonatee_token=impersonatee_token
        )

    def put(self):
        device_id = self.request.get('device_id', default_value="")
        device_type = self.request.get('device_type', default_value="")
        impersonatee_token = self.request.get('impersonatee_token', default_value="")
        log.debug("attempting to unregister {} {}".format(device_type, device_id))

        if device_type == "sense":
            api_url = "devices/sense/{}/user".format(device_id)
        else:
            api_url = "devices/pill/{}".format(device_id)

        self.hello_request(
            api_url=api_url,
            type="DELETE",
            impersonatee_token=impersonatee_token,
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

class DeviceInactiveAPI(ProtectedRequestHandler):
    """
    Retrieve inactie devices
    """
    def get(self):
        after = self.request.get('after', default_value="")
        before = self.request.get('before', default_value="")
        device_type = self.request.get('device_type', default_value="sense")
        self.hello_request(
            api_url="devices/inactive/{}".format(device_type),
            type="GET",
            url_params={
                'after': after,
                'before': before,
            }
        )

class DeviceKeyStoreHint(ProtectedRequestHandler):
    """
    Retrieve hints for key store of a device
    """
    def get(self):
        device_id = self.request.get('device_id', default_value="")
        self.hello_request(
            api_url="devices/key_store_hints/{}".format(device_id),
            type="GET"
        )

