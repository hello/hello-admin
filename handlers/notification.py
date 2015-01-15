import json
from handlers.helpers import ProtectedRequestHandler

class NotificationAPI(ProtectedRequestHandler):
    def post(self):
        body = json.loads(self.request.body)
        receiver = body.get('receiver')
        target = body.get('target')
        details = body.get('details')
        body_messages = body.get('body')

        print receiver, target, details, body_messages

        self.hello_request(
            api_url="notifications/send/{}".format(receiver),
            type="POST",
            body_data=json.dumps({'body': body_messages, 'target': target, 'details': details}),
        )

