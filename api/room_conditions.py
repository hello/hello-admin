import time

from core.handlers.base import ProtectedRequestHandler


class RoomConditionsAPI(ProtectedRequestHandler):
    def get(self):
        """
        Grab temperature, humidity, paraticualtes (air quality), light and sound data
        """
        email = self.request.get('email', default_value='')
        sensor = self.request.get('sensor', default_value='')
        resolution = self.request.get('resolution', default_value='')
        smooth = self.request.get('smooth', default_value="False")
        ts = int(self.request.get('ts', int(time.time() * 1000)))
        self.hello_request(
            api_url="data/{}/{}/{}".format(email, sensor, resolution),
            url_params={'from': ts, 'smooth': False},
            type="GET",
        )


class LastRoomConditionsAPI(ProtectedRequestHandler):
    def get(self):
        """
        Grab last temperature, humidity, light and sound data
        """
        self.hello_request(
            api_url="data/current_room_conditions/{}".format(self.request.get("sense_id")),
            type="GET",
        )

