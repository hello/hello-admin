from core.handlers.base import ProtectedRequestHandler

class MotionAPI(ProtectedRequestHandler):
    def get(self):
        email = self.request.get('email')
        date = self.request.get('date')

        self.hello_request(
            api_url="data/pill/{}/{}".format(email, date),
            type="GET",
        )


class LastMotionAPI(ProtectedRequestHandler):
    def get(self):
        email = self.request.get('email')
        date = self.request.get('date')

        motion_raw_response = self.hello_request(
            api_url="data/pill/{}/{}".format(email, date),
            type="GET",
            raw_output=True
        )

        if not motion_raw_response.data:
            motion_raw_response.set_error("No motion last 24 hrs")
            motion_raw_response.set_status(404)
        else:
            last_motion = sorted(motion_raw_response.data, key=lambda k : k["timestamp"], reverse=True)[0]
            motion_raw_response.set_data(last_motion)

        self.response.write(motion_raw_response.get_serialized_output())


