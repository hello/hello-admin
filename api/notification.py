import json

from core.handlers.base import ProtectedRequestHandler


class NotificationAPI(ProtectedRequestHandler):
    def post(self):
        body = json.loads(self.request.body)
        receiver = body.get('receiver')
        target = body.get('target')
        details = body.get('details')
        body_messages = body.get('body')

        self.hello_request(
            api_url="notifications/send/{}".format(receiver),
            type="POST",
            body_data=json.dumps({'body': body_messages, 'target': target, 'details': details}),
            api_info=self.suripu_app
        )

