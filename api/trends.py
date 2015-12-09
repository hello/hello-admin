import json
from core.handlers.base import ProtectedRequestHandler
import settings


class TrendsHandler(ProtectedRequestHandler):
     def get_impersonatee_token(self):
        data = self.hello_request(
            api_url="token/implicit",
            type="POST",
            raw_output=True,
            api_info=self.suripu_admin,
            body_data=json.dumps({
                "email": self.request.get("email"),
                "client_id": settings.INSIGHTS_OAUTH_CLIENT_ID
            })
        ).data
        return data.get("access_token") if type(data) == dict else None


class TrendsAPI(TrendsHandler):
    def get(self):
        token = self.get_impersonatee_token()
        if not token:
            self.response.write(json.dumps({
                "data": [],
                "error": "Account not found"
            }))
        else:
            self.hello_request(
                api_url="insights/trends/all",
                type="GET",
                api_info=self.suripu_app,
                access_token=token
            )