import json

import requests

from core.models.response import ResponseOutput
from core.handlers.base import ProtectedRequestHandler


PAPERTRAIL_ENDPOINT = "https://papertrailapp.com/api/v1/{}"


class PaperTrailWrapper(ProtectedRequestHandler):
    def query(self, query_params, raw_output):
        output = ResponseOutput()
        query_string = PAPERTRAIL_ENDPOINT.format(query_params)

        papertrail_response = requests.get(query_string, headers={"X-Papertrail-Token": self.papertrail_credentials})

        output.set_status(papertrail_response.status_code)
        output.set_error(papertrail_response.reason)

        if papertrail_response.ok:
            output.set_data(json.loads(papertrail_response.content))
        if raw_output is False:
            self.response.write(output.get_serialized_output())
        else:
            return output

    def get_systems(self):
        self.query("systems.json")

    def get_system(self, system):
        self.query("systems/{}.json".format(system))

    def get_events(self, search_dict={}, raw_output=False):
        search_string = "&".join(["=".join([k, v]) for k, v in search_dict.items() if v != ""])
        return self.query("events/search.json?" + search_string, raw_output)


class PaperTrailEventsAPI(PaperTrailWrapper):
    def get(self):
        self.get_events({
            "q": self.request.get("q"),
            "tail": self.request.get("tail"),
            "system_id": self.request.get("system_id"),
            "group_id": self.request.get("system_id"),
            "max_id": self.request.get("max_id"),
            "min_id": self.request.get("min_id"),
            "max_time": self.request.get("max_time"),
            "min_time": self.request.get("min_time"),
        })


class PaperTrailSystemsAPI(PaperTrailWrapper):
    def get(self):
        system = self.request.get("system")
        if system:
            self.get_system(system)
        else:
            self.get_systems()


