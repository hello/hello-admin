import json
from helpers import ProtectedRequestHandler

class LabelDataAPI(ProtectedRequestHandler):
    def post(self):
        body = json.loads(self.request.body)

        post_data = {field: body.get(field) for field in ['email', 'night', 'ts_utc', 'tz_offset', 'label']}

        self.hello_request(
            api_url="datascience/label",
            type="POST",
            body_data=json.dumps(post_data)
        )