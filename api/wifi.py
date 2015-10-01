from core.handlers.base import ProtectedRequestHandler

#
class WifiAPI(ProtectedRequestHandler):
    def get(self):
        self.hello_request(
            api_url="/wifi/{}".format(self.request.get("sense_id"))
        )
