import logging as log
import settings
from helpers import ProtectedRequestHandler


class SenseUptimeAPI(ProtectedRequestHandler):
    def get(self):
        ''' Get uptime '''
        email = self.request.get('email', default_value="")
        padded = bool(self.request.get('padded', default_value=False))
        log.info("Retrieving sense uptime for account {} with padded = {}".format(email, padded))
        self.hello_request(
            api_url="diagnostic/uptime/{}".format(email),
            type="GET",
            url_params={"padded": padded},
        )