import time

from handlers.helpers import ProtectedRequestHandler


class RoomConditionsAPI(ProtectedRequestHandler):
    def get(self):
        """
        Grab temperature, humidity, paraticualtes (air quality), light and sound data
        """
        email = self.request.get('email', default_value='')
        sensor = self.request.get('sensor', default_value='')
        resolution = self.request.get('resolution', default_value='')
        ts = int(self.request.get('ts', int(time.time() * 1000)))
        self.hello_request(
            api_url="datascience/admin/{}/{}/{}".format(email, sensor, resolution),
            url_params={'from': ts},
            type="GET"
        )



