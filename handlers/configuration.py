import json
from handlers.helpers import ProtectedRequestHandler


class FeaturesAPI(ProtectedRequestHandler):
    def get(self):
        self.hello_request(
            api_url="features",
            type="GET"
        )

    def put(self):
        req = json.loads(self.request.body)

        feature = req.get('feature', '')
        ids = req.get('ids', '')
        groups = req.get('groups') or []
        percentage = req.get('percentage', 0)

        self.hello_request(
            api_url="features",
            type="PUT",
            body_data=json.dumps({
                'name': feature,
                'ids': ids.strip().split(',') if len(ids) > 0 else [],
                'groups': groups,
                'percentage': percentage
            })
        )
