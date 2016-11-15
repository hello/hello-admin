from core.handlers.base import ProtectedRequestHandler


class ExpansionsAPI(ProtectedRequestHandler):
    def get(self):
        self.hello_request(
            api_url="expansions/{}".format(self.request.get("sense_id")),
            type="GET",
        )