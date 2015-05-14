import settings
from handlers.helpers import ProtectedRequestHandler

class OnboardingLogsByResultAPI(ProtectedRequestHandler):
    def get(self):
        self.hello_request(
            api_url="onboarding_log/result",
            url_params={
                "result": self.request.get("result"),
                "start_millis": self.request.get("start_millis"),
                "end_millis": self.request.get("end_millis")
            },
            app_info=settings.ADMIN_APP_INFO
        )

class OnboardingLogsBySenseIdAPI(ProtectedRequestHandler):
    def get(self):
        self.hello_request(
            api_url="onboarding_log/sense/{}/{}".format(self.request.get("sense_id"), self.request.get("count")),
            app_info=settings.ADMIN_APP_INFO
        )