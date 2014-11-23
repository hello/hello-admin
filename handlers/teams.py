import json
from handlers.helpers import FirmwareRequestHandler


class TeamsAPI(FirmwareRequestHandler):
    def get(self):
        mode = self.request.get('mode', default_value="")
        self.hello_request(
            api_url="teams/{}".format(mode),
            type="GET"
        )

    def put(self):
        req = json.loads(self.request.body)

        group = req.get('group', "")
        ids = req.get('ids', "").strip().split(",")
        mode = req.get('mode', "")
        action = req.get('action', "")

        if mode == "users" and action != "delete-group":
            ids = map(int, ids)

        request_type_map = {
            "add": "POST",
            "replace": "PUT",
            "remove": "DELETE",
            "delete-group": "DELETE"
        }

        request_specs = {
            "api_url": "teams/{}/{}".format(mode, group) if action == "delete-group" else "teams/{}".format(mode),
            "type": request_type_map[action],
            "body_data": json.dumps({"name": group, "ids": ids})
        }
        self.hello_request(**request_specs)
