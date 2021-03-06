import json
import logging as log

from core.handlers.base import FirmwareRequestHandler


class FWGroupAPI(FirmwareRequestHandler):
    def get(self):
        mode = self.request.get('mode', default_value="")
        self.hello_request(
            api_url="teams/{}".format(mode),
            type="GET",
        )

    def put(self):
        req = json.loads(self.request.body)

        group = req.get('group', "")
        raw_ids = req.get('ids', "").strip()
        ids = [j.strip() for j in raw_ids.split(",")] if raw_ids != "" else []

        mode = req.get('mode', "")
        action = req.get('action', "")
        try:
            if mode == "users" and action != "delete-group":
                ids = map(int, ids)
        except ValueError:
            log.error('User ID must be an integer.')
            return

        request_type_map = {
            "add": "POST",
            "replace": "PUT",
            "remove": "DELETE",
            "delete-group": "DELETE"
        }

        body_data = {"name": group, "ids": ids}
        request_specs = {
            "api_url": "teams/{}/{}".format(mode, group) if action == "delete-group" else "teams/{}".format(mode),
            "type": request_type_map[action],
            "body_data": json.dumps(body_data),
            "raw_output": True
        }

        teams_response = self.hello_request(**request_specs)
        if action == "remove":
            for i in ids:
                request_specs['api_url'] = "teams/{}/{}/{}".format(mode, group, i)
                teams_response = self.hello_request(**request_specs)

        if teams_response.status not in [200, 204]:
            log.error("Failed to update teams")

        self.response.write(teams_response.get_serialized_output())

        request_context = self._extra_context({})
        message_text = "{} updated firmware groups with request: {}, response status is {}".format(
            request_context['user'],
            self.request.body,
            teams_response.status
        )

        self.slack_pusher.send_to_deploys_channel(message_text)