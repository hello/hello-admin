import json
import logging as log
import time
from handlers.utils import display_error
from handlers.helpers import BaseRequestHandler

class PreSleepAPI(BaseRequestHandler):
    def get(self):
        """
        Grab temperature
        - request input:
            sensor (required: one of ["humidity", "particulates", "temperature"])
            token (required for each user)
            resolution (required : week or day)
        """
        output = {'data': [], 'error': ''}
        sensor = self.request.get('sensor', default_value='humidity')
        resolution = self.request.get('resolution', default_value='day')
        current_ts = int(time.time() * 1000)
        user_token = self.request.get('user_token', default_value="6.9acdd33efed7493486fe7cbac185288a")

        try:
            if user_token is None:
                raise RuntimeError("Missing user token!")

            session = self.authorize_session(user_token)

            req_url = "room/{}/{}".format(sensor, resolution)

            response = session.get(req_url, params={'from': current_ts})

            if response.status_code == 200:
                output['data'] = response.json()
            else:
                raise RuntimeError('{}: fail to retrieve presleep'.format(response.status_code))
        except Exception as e:
            output['error'] = display_error(e)
            log.error('ERROR: {}'.format(display_error(e)))

        self.response.write(json.dumps(output))