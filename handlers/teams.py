import json
import logging as log
from handlers.helpers import ProtectedRequestHandler


class TeamsAPI(ProtectedRequestHandler):
    def get(self):
        mode = self.request.get('mode', default_value="")
        self.hello_request(
            api_url="teams/{}".format(mode),
            type="GET"
        )

    def put(self):
        req = json.loads(self.request.body)

        group = req.get('group', "")
        raw_ids = req.get('ids', "").split(",")
        ids = [j.strip() for j in raw_ids] if len(raw_ids) > 0 else []

        print "IDs", ids

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

        request_specs = {
            "api_url": "teams/{}/{}".format(mode, group) if action == "delete-group" else "teams/{}".format(mode),
            "type": request_type_map[action],
            "body_data": json.dumps({"name": group, "ids": ids})
        }

        if action == "remove":
            for i in ids:
                request_specs['api_url'] = "teams/{}/{}/{}".format(mode, group, i)
                self.hello_request(**request_specs)
        else:
            self.hello_request(**request_specs)
