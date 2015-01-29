import json
from helpers import ProtectedRequestHandler
import logging as log

class LabelDataAPI(ProtectedRequestHandler):
    def post(self):
        body = json.loads(self.request.body)
        self.hello_request(
            api_url="datascience/batch_label",
            type="POST",
            body_data=json.dumps(body)
        )