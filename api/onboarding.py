import time
from handlers.helpers import ProtectedRequestHandler

class OnboardingLogsByResultAPI(ProtectedRequestHandler):
    def get(self):
        self.hello_request(
            api_url="onboarding_log/result",
            url_params={
                "result": self.request.get("result"),
                "start_millis": self.request.get("start_millis") or int(time.time()*1000) - 7*24*3600*1000,
                "end_millis": self.request.get("end_millis") or int(time.time()*1000)
            },
        )

class OnboardingLogsBySenseIdAPI(ProtectedRequestHandler):
    def get(self):
        self.hello_request(
            api_url="onboarding_log/sense/{}/{}".format(self.request.get("sense_id"), self.request.get("count") or 1000),
        )

class OnboardingLogsByEmailAPI(ProtectedRequestHandler):
    def get(self):
        self.hello_request(
            api_url="onboarding_log/account/{}/{}".format(self.request.get("email"), self.request.get("count") or 1000),
        )