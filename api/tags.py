import json
import logging as log

from core.handlers.base import FirmwareRequestHandler


class TagsAPI(FirmwareRequestHandler):
    def get(self):
        mode = self.request.get('mode', default_value="")
        self.hello_request(
            api_url="tags/{}".format(mode),
            type="GET",
        )

    def put(self):
        req = json.loads(self.request.body)

        tag = req.get('tag', "")
        raw_ids = req.get('ids', "").strip()
        ids = [j.strip() for j in raw_ids.split(",")] if raw_ids != "" else []

        mode = req.get('mode', "")
        action = req.get('action', "")
        try:
            if mode == "users" and action != "delete-tag":
                ids = map(int, ids)
        except ValueError:
            log.error('User ID must be an integer.')
            return

        request_type_map = {
            "add": "POST",
            "replace": "PUT",
            "remove": "DELETE",
            "delete-tag": "DELETE"
        }

        body_data = {"name": tag, "ids": ids}
        request_specs = {
            "api_url": "tags/{}/{}".format(mode, tag) if action == "delete-tag" else "tags/{}".format(mode),
            "type": request_type_map[action],
            "body_data": json.dumps(body_data),
            "raw_output": True
        }

        tags_response = self.hello_request(**request_specs)
        if action == "remove":
            for i in ids:
                request_specs['api_url'] = "tags/{}/{}/{}".format(mode, tag, i)
                tags_response = self.hello_request(**request_specs)

        if tags_response.status not in [200, 204]:
            log.error("Failed to update tags")

        self.response.write(tags_response.get_serialized_output())

        request_context = self._extra_context({})
        message_text = "{} updated tags with request: {}, response status is {}".format(
            request_context['user'],
            self.request.body,
                tags_response.status
        )

        self.slack_pusher.send_to_deploys_channel(message_text)

class DeviceTagsAPI(FirmwareRequestHandler):
    def get(self):
        device_id = self.request.get('device_id', default_value="")
        self.hello_request(
                api_url="tags/device_tags/{}".format(device_id),
                type="GET",
        )
