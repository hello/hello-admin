import json

from core.handlers.base import ProtectedRequestHandler
from core.utils.time import get_current_pacific_datetime


class LabelDataAPI(ProtectedRequestHandler):
    def get(self):
        email = self.request.get("email")
        night = self.request.get("night")
        self.hello_request(
            api_url="data/label/{}/{}".format(email, night),
            type="GET",
        )
    def put(self):
        ''' single label '''
        body = json.loads(self.request.body)
        self.hello_request(
            api_url="data/label",
            type="POST",
            body_data=json.dumps(body),
        )
    def post(self):
        ''' batch label '''
        body = json.loads(self.request.body)
        for b in body:
            b['note'] += "- created by {} at {}".format(self.current_user_email, get_current_pacific_datetime())
        self.hello_request(
            api_url="data/batch_label",
            type="POST",
            body_data=json.dumps(body),
        )