import json
import logging as log
import re
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

        sensor = self.request.get('sensor', default_value='humidity')
        resolution = self.request.get('resolution', default_value='day')
        timezone_offset = int(self.request.get('timezone_offset', default_value=8*3600*1000))
        current_ts = int(time.time() * 1000) - timezone_offset
        impersonatee_token = self.request.get('impersonatee_token', default_value=None)

        self.hello_request(
            api_url="room/{}/{}".format(sensor, resolution),
            url_params={'from': current_ts},
            impersonatee_token=impersonatee_token,
            type="GET"
        )



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
                 input_list = stripStringToList(devices_input)
                 devices_list = []
                 for d in input_list:
                     if re.compile('^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$').match(d) is not None:
                         devices_list += self.hello_request(
                             api_url="devices/q",
                             type="GET",
                             url_params={'email': d},
                             test_mode=True
                         ).data
                     else:
                         devices_list.append(d)
                 search_params['category_filters'] = {'device_id': devices_list}

             output['data'] = index.search(**search_params)

         except Exception as e:
             output['error'] = display_error(e)
             log.error('ERROR: {}'.format(display_error(e)))

         self.response.write(json.dumps(output))
