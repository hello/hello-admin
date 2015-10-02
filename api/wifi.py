from core.handlers.base import ProtectedRequestHandler

class WifiInfoAPI(ProtectedRequestHandler):
    def get(self):
        self.hello_request(
            api_url="wifi/{}".format(self.request.get("sense_id")),
            type="GET"
        )
