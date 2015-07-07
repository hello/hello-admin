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
        is_canary = self.request.get("canary")
        app_info = AppInfo.get_by_id(settings.CANARY_APP_INFO_ID) if is_canary == 'true' else AppInfo.get_by_id(settings.ENVIRONMENT)
        log.info("is_canary {} {}".format(is_canary, type(is_canary)))
        log.info("canary? {}".format(app_info.endpoint))
        self.hello_request(
            api_url="timeline/admin/{}/{}".format(email, date),
            type="GET",
            app_info=app_info
        )

    def post(self):
        """Invalidate cache for user timeline"""
        email = self.request.get('email')
        date = self.request.get('date')
        is_canary = self.request.get("canary")
        app_info = AppInfo.get_by_id(settings.CANARY_APP_INFO_ID) if is_canary == 'true' else AppInfo.get_by_id(settings.ENVIRONMENT)
        self.hello_request(
            api_url="timeline/admin/invalidate/{}/{}".format(email, date),
            type="GET",
            app_info=app_info
        )

class TimelineAlgorithmAPI(ProtectedRequestHandler):
    def get(self):
        email = self.request.get('email')
        date = self.request.get('date')
        is_canary = self.request.get("canary")
        app_info = AppInfo.get_by_id(settings.CANARY_APP_INFO_ID) if is_canary == 'true' else AppInfo.get_by_id(settings.ENVIRONMENT)
        self.hello_request(
            api_url="timeline/admin/algo/{}/{}".format(email, date),
            type="GET",
            app_info=app_info
        )