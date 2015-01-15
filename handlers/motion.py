from handlers.helpers import ProtectedRequestHandler

class MotionAPI(ProtectedRequestHandler):
    def get(self):
        email = self.request.get('email')
        date = self.request.get('date')

        print email, date

        self.hello_request(
            api_url="datascience/admin/pill/{}/{}".format(email, date),
            type="GET",
        )

