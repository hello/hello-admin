import settings
from handlers.helpers import ProtectedRequestHandler

class MotionAPI(ProtectedRequestHandler):
    def get(self):
        email = self.request.get('email')
        date = self.request.get('date')

        self.hello_request(
            api_url="data/pill/{}/{}".format(email, date),
            type="GET",
        )

