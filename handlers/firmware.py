import json
from handlers.helpers import FirmwareRequestHandler


class FirmwareAPI(FirmwareRequestHandler):
    '''Enables OTA firmware updates'''

    def get(self):
        firmware_version = self.request.get('firmware_version', default_value="")

        self.hello_request(
            api_url="firmware/devices/",
            type="GET",
            url_params={'firmware_version': firmware_version}
        )


    def put(self):
        req = json.loads(self.request.body)

        device_id = req.get('device_id', "")
        firmware_version = req.get('firmware_version', "")
        update_data=req.get('update_data', "")

        self.hello_request(
            api_url="firmware/{}/{}".format(device_id, firmware_version),
            type="PUT",
            body_data=json.dumps(update_data)
        )


    def post(self):
        req = json.loads(self.request.body)

        device_id = req.get('device_id', "")

        self.hello_request(
            api_url="firmware/{}".format(device_id),
            type="DELETE",
        )

class FirmwareInfoAPI(FirmwareRequestHandler):

    def get(self):
        self.hello_request(
            api_url="firmware/list/",
            type="GET"
        )

class FirmwareHistoryAPI(FirmwareRequestHandler):


    def get(self):
        device_id = self.request.get('device_id', default_value="")

        self.hello_request(
            api_url="firmware/{}/history".format(device_id),
            type="GET"
        )