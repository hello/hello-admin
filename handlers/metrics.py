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
        start_time = self.request.get('start_time', default_value="")
        end_time = self.request.get('end_time', default_value="")

        searchify_entity = SearchifyCredentials.query().fetch(1)

        try:
            if not searchify_entity:
                raise RuntimeError("Missing AppInfo. Bailing.")
            searchify_cred = searchify_entity[0]
            debug_log_api = ApiClient(searchify_cred.api_client)

            index = debug_log_api.get_index('sense-logs')
            print start_time, end_time

            if start_time.isdigit() and end_time.isdigit():
                scoring_function = 'if((doc.var[0] - {})*(doc.var[0] - {}) < 0, doc.var[0], rel)'.format(start_time, end_time)
            elif start_time.isdigit():
                scoring_function = 'if((doc.var[0] - {}) > 0, doc.var[0], rel)'.format(start_time)
            elif end_time.isdigit():
                scoring_function = 'if((doc.var[0] - {}) < 0, doc.var[0], rel)'.format(end_time)
            else:
                scoring_function = 'doc.var[0]'

            index.add_function(300, scoring_function)
            search_params = {
                'query': 'text:UART',
                'category_filters': {},
                'fetch_fields': ['text', 'timestamp'],
                'length': max_results,
                'scoring_function': 300
            }
            print search_params
            if text_input:
                search_params['query'] = 'text:{}'.format(text_input)

            devices_list = []
            if devices_input:
                input_list = stripStringToList(devices_input)
                for d in input_list:
                    if '@' in d and '.' in d:
                        devices_list += self.hello_request(
                            api_url="devices/q",
                            type="GET",
                            url_params={'email': d},
                            test_mode=True
                        ).data
                    else:
                        devices_list.append(d)
                search_params['category_filters'] = {'device_id': devices_list}

            if not text_input and (not devices_input or not devices_list):
                raise RuntimeError('No results')

            if not text_input:
                for d in devices_list:
                    search_params['query'] = 'device_id:{}'.format(d)
                    output['data'] += index.search(**search_params)['results']
            else:
                output['data'] = index.search(**search_params)['results']

        except Exception as e:
            output['error'] = display_error(e)
            log.error('ERROR: {}'.format(display_error(e)))

        self.response.write(json.dumps(output))


class TroubleshootAPI(ProtectedRequestHandler):
    """
    Retrieve inactie device
    """
    def get(self):
        page = self.request.get('page', default_value=1)
        start = self.request.get('start', default_value=0)
        since = self.request.get('since', default_value=0)
        threshold = self.request.get('threshold', default_value=0)
        self.hello_request(
            api_url="devices/inactive",
            type="GET",
            url_params={
                'page': page,
                'start': start,
                'since': since,
                'threshold': threshold
            }
        )


class SearchifyStatsAPI(ProtectedRequestHandler):
    """
    Retrieve current count of docs on searchify
    """
    def get(self):
        output = {'data': [], 'error': ''}
        try:
            searchify_cred= SearchifyCredentials.query().get()
            searchify_api = ApiClient(searchify_cred.api_client)
            output['data'] = [i._get_metadata() for i in searchify_api.list_indexes()]
        except Exception as e:
            output['error'] = display_error(e)
        self.response.write(json.dumps(output))
