import json
from handlers.helpers import ProtectedRequestHandler
import logging as log

class FeaturesAPI(ProtectedRequestHandler):
    def get(self):
        self.hello_request(
            api_url="features",
            type="GET"
        )

    def put(self):
        req = json.loads(self.request.body)

        feature = req.get('feature', '')
        ids = req.get('ids', '').strip()

        groups = req.get('groups') or []
        percentage = req.get('percentage', 0)

        body_data = {
                'name': feature,
                'ids': [j.strip() for j in ids.split(",")] if ids != "" else [],
                'groups': groups,
                'percentage': percentage
        }

        people_who_can_release = self.super_firmware()
        if feature == "release" and self.current_user.email() not in people_who_can_release:
            log.warn("{} not authorized to release".format(self.current_user.email()))
            self.response.write(json.dumps({'error': 'Unauthorized to release firmware'}))
        else:
            self.hello_request(
                api_url="features",
                type="PUT",
                body_data=json.dumps(body_data)
            )

            request_context = self._extra_context({})
            message_text = "%s updated feature: %s. ids :%s, groups: %s, percentage: %s" % (
                    request_context['user'],
                    body_data['name'],
                    ','.join(body_data['ids']),
                    ','.join(body_data['groups']),
                    body_data['percentage'])
            self.send_to_slack(message_text)