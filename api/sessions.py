from core.handlers.base import ProtectedRequestHandler


class SessionsAPI(ProtectedRequestHandler):
    def get(self):
        self.hello_request(
            api_info=self.suripu_admin,
            api_url="token",
            url_params={"email": self.request.get("email")},
            type="GET",
        )

    def put(self):
        self.hello_request(
            api_info=self.suripu_admin,
            api_url="token/update_expiration/{}".format(self.request.get("id")),
            type="PUT",
        )
