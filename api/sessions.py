from core.handlers.base import ProtectedRequestHandler, SuperEngineerRequestHandler


class SessionsAPI(ProtectedRequestHandler):
    def get(self):
        self.hello_request(
            api_info=self.suripu_admin,
            api_url="token",
            url_params={
                "email": self.request.get("email"),
                "limit": 10
            },
            type="GET",
        )


class SessionsUpdateAPI(SuperEngineerRequestHandler):
    def put(self):
        self.hello_request(
            api_info=self.suripu_admin,
            api_url="token/invalidate/{}".format(self.request.get("id")),
            type="PUT",
        )
