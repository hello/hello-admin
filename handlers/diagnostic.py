import logging as log
import settings
from helpers import ProtectedRequestHandler


class SenseUptimeAPI(ProtectedRequestHandler):
    def get(self):
        ''' Get uptime '''
        email = self.request.get('email', default_value="")
        log.info("Retrieving sense uptime for account {}".format(email))
        self.hello_request(
            api_url="diagnostic/uptime/{}".format(email),
            type="GET",
            app_info=settings.ADMIN_APP_INFO
        )