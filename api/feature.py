import json
import logging as log

from core.handlers.base import FirmwareRequestHandler


class FeaturesAPI(FirmwareRequestHandler):
    def get(self):
        raw_output = self.hello_request(
            api_url="features",
            type="GET",
            raw_output=True
        )
        feature = self.request.get("feature")
        if feature:
            for item in raw_output.data:
                if item.get("name", "") == feature:
                    raw_output.set_data(item)

        self.response.write(raw_output.get_serialized_output())


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
        if feature == "release" and self.current_user_email not in people_who_can_release:
            log.warn("{} not authorized to release".format(self.current_user_email))
            self.response.write(json.dumps({'error': 'Unauthorized to release firmware'}))
        else:
            self.hello_request(
                api_url="features",
                type="PUT",
                body_data=json.dumps(body_data),
            )

            request_context = self._extra_context({})
            message_text = "%s updated feature: %s. ids :%s, groups: %s, percentage: %s" % (
                    request_context['user'],
                    body_data['name'],
                    ','.join(body_data['ids']),
                    ','.join(body_data['groups']),
                    body_data['percentage'])
            self.slack_pusher.send_to_deploys_channel(message_text)