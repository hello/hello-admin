from handlers.helpers import ProtectedRequestHandler
from models.setup import AppInfo
import settings
import logging as log
__author__ = 'zet'


class TimelineAPI(ProtectedRequestHandler):
    def get(self):
        """Retrieve user timeline"""
        email = self.request.get('email')
        date = self.request.get('date')
        self.hello_request(
            api_url="timeline/admin/{}/{}".format(email, date),
            type="GET",
            api_info=self.suripu_app
        )

    def post(self):
        """Invalidate cache for user timeline"""
        email = self.request.get('email')
        date = self.request.get('date')
        self.hello_request(
            api_url="timeline/admin/invalidate/{}/{}".format(email, date),
            type="GET",
            api_info=self.suripu_app
        )

class TimelineAlgorithmAPI(ProtectedRequestHandler):
    def get(self):
        email = self.request.get('email')
        date = self.request.get('date')
        self.hello_request(
            api_url="timeline/admin/algo/{}/{}".format(email, date),
            type="GET",
            api_info=self.suripu_app
        )