from handlers.helpers import ProtectedRequestHandler

__author__ = 'zet'


class TimelineAPI(ProtectedRequestHandler):
    def get(self):
        email = self.request.get('email')
        date = self.request.get('date')
        self.hello_request(
            api_url="timeline/admin/{}/{}".format(email, date),
            type="GET",
        )