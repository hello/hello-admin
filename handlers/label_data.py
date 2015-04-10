import json
import settings
from helpers import ProtectedRequestHandler
from handlers.utils import get_current_pacific_datetime

class LabelDataAPI(ProtectedRequestHandler):
    def get(self):
        email = self.request.get("email")
        night = self.request.get("night")
        self.hello_request(
            api_url="data/label/{}/{}".format(email, night),
            type="GET",
            app_info=settings.ADMIN_APP_INFO
        )
    def put(self):
        ''' single label '''
        body = json.loads(self.request.body)
        self.hello_request(
            api_url="data/label",
            type="POST",
            body_data=json.dumps(body),
            app_info=settings.ADMIN_APP_INFO
        )
    def post(self):
        ''' batch label '''
        body = json.loads(self.request.body)
        for b in body:
            b['note'] += "- created by {} at {}".format(self.current_user.email(), get_current_pacific_datetime())
        self.hello_request(
            api_url="data/batch_label",
            type="POST",
            body_data=json.dumps(body),
            app_info=settings.ADMIN_APP_INFO
        )