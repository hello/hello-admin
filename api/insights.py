from core.handlers.base import ProtectedRequestHandler
import json
import settings
class InsightsHandler(ProtectedRequestHandler):
    def get_impersonatee_token(self):
        return self.hello_request(
            api_url="token/implicit",
            type="POST",
            raw_output=True,
            api_info=self.suripu_admin,
            body_data=json.dumps({
                "email": self.request.get("email"),
                "client_id": settings.INSIGHTS_OAUTH_CLIENT_ID
            })
        ).data.get("access_token")


class InsightsAPI(InsightsHandler):
    def get(self):
        token = self.get_impersonatee_token()
        self.hello_request(
            api_url="insights",
            type="GET",
            api_info=self.suripu_app,
            access_token=token
        )

class InsightsGenericAPI(InsightsHandler):
    def get(self):
        token = self.get_impersonatee_token()
        self.hello_request(
            api_url="insights/info/{}".format(self.request.get("category")),
            type="GET",
            api_info=self.suripu_app,
            access_token=token
        )
