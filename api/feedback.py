from core.handlers.base import ProtectedRequestHandler


class FeedbackAPI(ProtectedRequestHandler):
    def get(self):
        self.hello_request(
            api_url="feedback/{}/{}".format(self.request.get("email"), self.request.get("night")),
            type="GET"
        )

    def put(self):
        self.hello_request(
            api_url="feedback/{}/{}".format(self.request.get("email"), self.request.get("night")),
            type="PUT"
        )