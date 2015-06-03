import json
import settings
from helpers import ProtectedRequestHandler


class DiagnosticAPI(ProtectedRequestHandler):
    def get(self):
        ''' Get uptime '''
        app_info = settings.ADMIN_APP_INFO
        self.hello_request(
            api_url="diagnostic/uptime/{}/{}".format(self.request.get('email'),self.request.get('sense_id')),
            type="GET",
            app_info=settings.ADMIN_APP_INFO
        )