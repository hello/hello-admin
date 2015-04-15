import json
import settings
from handlers.helpers import FirmwareRequestHandler


class FirmwareAPI(FirmwareRequestHandler):
    '''Enables OTA firmware updates'''

    def get(self):
        firmware_version = self.request.get('firmware_version', default_value="")
        range_start = self.request.get('range_start', default_value="0")
        range_end = self.request.get('range_end', default_value="100")

        self.hello_request(
            api_url="firmware/devices/",
            type="GET",
            url_params={'firmware_version': firmware_version, 'range_start': range_start, 'range_end': range_end},
            app_info=settings.ADMIN_APP_INFO
        )


    def put(self):
        req = json.loads(self.request.body)

        device_id = req.get('device_id', "")
        firmware_version = req.get('firmware_version', "")
        update_data=req.get('update_data', "")

        self.hello_request(
            api_url="firmware/{}/{}".format(device_id, firmware_version),
            type="PUT",
            body_data=json.dumps(update_data),
            app_info=settings.ADMIN_APP_INFO
        )


    def post(self):
        req = json.loads(self.request.body)

        device_id = req.get('device_id', "")

        self.hello_request(
            api_url="firmware/{}".format(device_id),
            type="DELETE",
            app_info=settings.ADMIN_APP_INFO
        )

class FirmwareInfoAPI(FirmwareRequestHandler):

    def get(self):
        self.hello_request(
            api_url="firmware/list/",
            type="GET",
            app_info=settings.ADMIN_APP_INFO
        )

class FirmwareHistoryAPI(FirmwareRequestHandler):


    def get(self):
        device_id = self.request.get('device_id', default_value="")

        self.hello_request(
            api_url="firmware/{}/history".format(device_id),
            type="GET",
            app_info=settings.ADMIN_APP_INFO
        )