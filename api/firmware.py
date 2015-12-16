import logging as log
import json
import time

from google.appengine.api import memcache

from core.models.response import ResponseOutput
from core.handlers.base import FirmwareRequestHandler
from core.handlers.base import SuperFirmwareRequestHandler
from core.handlers.base import ProtectedRequestHandler


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
        range_start = self.request.get('range_start', default_value=int(time.time()*1000) - 7*86400000)
        range_end = self.request.get('range_end', default_value=int(time.time()*1000))

        self.hello_request(
            api_url="firmware/list_by_time",
            type="GET",
            url_params={'range_start': range_start, 'range_end': range_end},
        )


class FirmwareHistoryAPI(ProtectedRequestHandler):
    def get(self):
        device_id = self.request.get('device_id', default_value="")

        self.hello_request(
            api_url="firmware/{}/history".format(device_id),
            type="GET"
        )


class FirmwareUnhashAPI(ProtectedRequestHandler):
    def get(self):
        hashed_firmware = self.request.get('version', default_value="")
        cached_hashed_firmware = memcache.get(hashed_firmware)

        if cached_hashed_firmware is None:
            output = self.hello_request(
                api_url="firmware/names/{}".format(hashed_firmware),
                type="GET",
                raw_output=True
            )
            stringified_unhashed_firmware = json.dumps(output.data)
            log.info("caching firmware {} - {}".format(hashed_firmware, stringified_unhashed_firmware))
            memcache.add(
                key=hashed_firmware,
                value=stringified_unhashed_firmware,
                time=24*3600
            )
        else:
            output = ResponseOutput()
            output.set_data(json.loads(cached_hashed_firmware))
            output.set_status(200)

        self.response.write(output.get_serialized_output())

    def post(self):  # batch query
        self.hello_request(
            api_url="firmware/names",
            type="POST",
            body_data=self.request.body,
        )


class FirmwareGroupStatusAPI(FirmwareRequestHandler):
    def get(self):
        self.hello_request(
            api_url="firmware/{}/status".format(self.request.get("group")),
            type="GET",
        )


class FirmwareGroupPathAPI(SuperFirmwareRequestHandler):
    def get(self):
        self.hello_request(
            api_url="firmware/{}/upgrade_nodes".format(self.request.get("group")),
            type="GET"
        )

    def put(self):
        self.hello_request(
            api_url="firmware/upgrades/add_node",
            type="PUT",
            body_data=self.request.body
        )
        body_data=json.loads(self.request.body)
        message_text = "%s added/updated Upgrade Path for Group '%s' from FW Version: %s to FW Version: %s @ %s%% rollout." % (
            self.current_user_email,
            body_data['group_name'],
            body_data['from_fw_version'],
            body_data['to_fw_version'],
            body_data['rollout_percent'])
        self.slack_pusher.send_to_deploys_channel(message_text)

    def post(self):
        body = json.loads(self.request.body)
        group_name = body.get("group_name")
        from_fw_version = body.get("from_fw_version")
        self.hello_request(
            api_url="firmware/upgrades/delete_node/{}/{}".format(group_name, from_fw_version),
            type="DELETE"
        )
        message_text = "%s deleted Upgrade Path for Group '%s' from FW Version: %s." % (
            self.current_user_email,
            body.get("group_name"),
            body.get("from_fw_version"))
        self.slack_pusher.send_to_deploys_channel(message_text)


class FirmwareCertifiedComboAPI(ProtectedRequestHandler):
    def get(self):
        self.hello_request(
            api_url="firmware/certified_combinations",
            type="GET"
        )

    def put(self):
        self.hello_request(
            api_url="firmware/certified_combinations",
            type="PUT",
            body_data=self.request.body
        )