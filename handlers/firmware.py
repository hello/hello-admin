import json
import settings
from handlers.helpers import FirmwareRequestHandler
from handlers.helpers import SuperFirmwareRequestHandler
from handlers.helpers import ProtectedRequestHandler


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
            access_token=settings.ADMIN_APP_INFO.access_token,
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
            access_token=settings.ADMIN_APP_INFO.access_token,
            app_info=settings.ADMIN_APP_INFO
        )


    def post(self):
        req = json.loads(self.request.body)

        device_id = req.get('device_id', "")

        self.hello_request(
            api_url="firmware/{}".format(device_id),
            type="DELETE",
            access_token=settings.ADMIN_APP_INFO.access_token,
            app_info=settings.ADMIN_APP_INFO
        )

class FirmwareInfoAPI(FirmwareRequestHandler):

    def get(self):
        self.hello_request(
            api_url="firmware/list/",
            type="GET",
            access_token=settings.ADMIN_APP_INFO.access_token,
            app_info=settings.ADMIN_APP_INFO
        )

class FirmwareHistoryAPI(FirmwareRequestHandler):

    def get(self):
        device_id = self.request.get('device_id', default_value="")

        self.hello_request(
            api_url="firmware/{}/history".format(device_id),
            type="GET",
            access_token=settings.ADMIN_APP_INFO.access_token,
            app_info=settings.ADMIN_APP_INFO
        )

class FirmwareUnhashAPI(ProtectedRequestHandler):

    def get(self):
        hashed_firmware = self.request.get('version', default_value="")

        self.hello_request(
            api_url="firmware/names/{}".format(hashed_firmware),
            type="GET",
            access_token=settings.ADMIN_APP_INFO.access_token,
            app_info=settings.ADMIN_APP_INFO
        )

class FirmwareGroupStatusAPI(SuperFirmwareRequestHandler):
    def get(self):
        self.hello_request(
            api_url="firmware/{}/status".format(self.request.get("group")),
            type="GET",
            access_token=settings.ADMIN_APP_INFO.access_token,
            app_info=settings.ADMIN_APP_INFO
        )


class FirmwareGroupPathAPI(SuperFirmwareRequestHandler):
    def get(self):
        self.hello_request(
            api_url="firmware/{}/upgrade_nodes".format(self.request.get("group")),
            type="GET",
            access_token=settings.ADMIN_APP_INFO.access_token,
            app_info=settings.ADMIN_APP_INFO
        )

    def put(self):
        self.hello_request(
            api_url="firmware/upgrades/add_node",
            type="PUT",
            body_data=self.request.body,
            access_token=settings.ADMIN_APP_INFO.access_token,
            app_info=settings.ADMIN_APP_INFO
        )
        request_context = self._extra_context({})
        body_data=json.loads(self.request.body)
        message_text = "%s added/updated Upgrade Path for Group '%s' from FW Version: %s to FW Version: %s @ %s%% rollout." % (
            request_context['user'],
            body_data['group_name'],
            body_data['from_fw_version'],
            body_data['to_fw_version'],
            body_data['rollout_percent'])
        self.send_to_slack_deploys_channel(message_text)

    def post(self):
        body = json.loads(self.request.body)
        group_name = body.get("group_name")
        from_fw_version = body.get("from_fw_version")
        self.hello_request(
            api_url="firmware/upgrades/delete_node/{}/{}".format(group_name, from_fw_version),
            type="DELETE",
            access_token=settings.ADMIN_APP_INFO.access_token,
            app_info=settings.ADMIN_APP_INFO
        )
        request_context = self._extra_context({})
        message_text = "%s deleted Upgrade Path for Group '%s' from FW Version: %s." % (
            request_context['user'],
            body.get("group_name"),
            body.get("from_fw_version"))
        self.send_to_slack_deploys_channel(message_text)

