import json
import logging as log
import time
from handlers.utils import display_error
from handlers.helpers import ProtectedRequestHandler
from models.ext import SearchifyCredentials
from indextank import ApiClient
from utils import stripStringToList

class PreSleepAPI(ProtectedRequestHandler):
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
        timezone_offset = int(self.request.get('timezone_offset', default_value=8*3600*1000))
        current_ts = int(time.time() * 1000) - timezone_offset
        user_token = self.request.get('user_token', default_value=None)

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


class DebugLogAPI(ProtectedRequestHandler):
    """
    Retrieve debug logs
    """
    def get(self):
         output = {'data': [], 'error': ''}

         max_results = int(self.request.get('max_results', default_value=20))
         text_input = self.request.get('text', default_value="")
         devices_input = self.request.get('devices', default_value="")

         searchify_entity= SearchifyCredentials.query().fetch(1)

         try:
             if not searchify_entity:
                 raise RuntimeError("Missing AppInfo. Bailing.")
             searchify_cred = searchify_entity[0]
             debug_log_api = ApiClient(searchify_cred.api_client)

             index = debug_log_api.get_index('sense-logs')

             if not text_input and not devices_input:
                 raise RuntimeError('Invalid input')

             search_params = {
                 'query': 'text:UART',
                 'category_filters': {},
                 'fetch_fields': ['text'],
                 'length': max_results
             }
             if text_input:
                 search_params['query'] = 'text:{}'.format(text_input)
             if devices_input:
                 search_params['category_filters'] = {'device_id': stripStringToList(devices_input)}

             output['data'] = index.search(**search_params)

         except Exception as e:
             output['error'] = display_error(e)
             log.error('ERROR: {}'.format(display_error(e)))

         self.response.write(json.dumps(output))
