import json
import logging as log
import time
import settings
from handlers.utils import display_error
from handlers.helpers import ProtectedRequestHandler
from indextank import ApiClient
from utils import stripStringToList
from collections import defaultdict
from handlers.helpers import ResponseOutput

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
        # timezone_offset = int(self.request.get('timezone_offset', default_value=8*3600*1000))
        # current_ts = int(time.time() * 1000) - timezone_offset
        current_ts = int(time.time() * 1000)
        impersonatee_token = self.request.get('impersonatee_token', default_value=None)

        self.hello_request(
            api_url="room/{}/{}".format(sensor, resolution),
            url_params={'from': current_ts},
            impersonatee_token=impersonatee_token,
            type="GET"
        )


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


class SenseLogsAPI(ProtectedRequestHandler):
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
        searchify_cred = settings.SEARCHIFY

        try:
            if searchify_cred is None:
                raise RuntimeError("Missing Searchify Credentials")
            debug_log_api = ApiClient(searchify_cred.api_client)

            index = debug_log_api.get_index('sense-logs')

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


class ApplicationLogsAPI(ProtectedRequestHandler):
    """
    Retrieve application logs
    """

    ## TODO: refactor this api and DebugLogAPI as they have many common parts.
    def get(self):
        output = {'data': [], 'error': ''}

        max_results = int(self.request.get('max_results', default_value=20))
        text_input = self.request.get('text', default_value="")
        levels_input = self.request.get('levels', default_value="")
        origins_input = self.request.get('origins', default_value="")
        versions_input = self.request.get('versions', default_value="")
        start_time = self.request.get('start_time', default_value="")
        end_time = self.request.get('end_time', default_value="")

        try:
            searchify_cred = settings.SEARCHIFY
            if not searchify_cred:
                raise RuntimeError("Missing Searchify Credentials. Bailing.")

            debug_log_api = ApiClient(searchify_cred.api_client)

            index = debug_log_api.get_index('application-logs')

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
                'query': 'text:data',
                'category_filters': {},
                'fetch_fields': ['text', 'timestamp'],
                'length': max_results,
                'scoring_function': 300
            }

            levels_list = []
            if levels_input:
                levels_list = stripStringToList(levels_input)
                search_params['category_filters'].update({'level': levels_list})
            if origins_input:
                origins_list = stripStringToList(origins_input)
                search_params['category_filters'].update({'origin': origins_list})
            if versions_input:
                versions_list = stripStringToList(versions_input)
                search_params['category_filters'].update({'version': versions_list})

            if text_input:
                search_params['query'] = 'text:{}'.format(text_input)
                output['data'] = index.search(**search_params)['results']
            else:
                for level in levels_list:
                    search_params['query'] = level
                    output['data'] += index.search(**search_params)['results']

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
            searchify_cred = settings.SEARCHIFY
            searchify_api = ApiClient(searchify_cred.api_client)
            output['data'] = [i._get_metadata() for i in searchify_api.list_indexes()]
        except Exception as e:
            output['error'] = display_error(e)
        self.response.write(json.dumps(output))


class TimelineAPI(ProtectedRequestHandler):
    def get(self):
        email = self.request.get('email')
        date = self.request.get('date')
        print email, date
        self.hello_request(
            api_url="timeline/admin/{}/{}".format(email, date),
            type="GET",
        )


class BatteryAPI(ProtectedRequestHandler):
    def get(self):
        email = self.request.get('email', '')
        pill_id = self.request.get('pill_id', '')
        battery_data = ResponseOutput()
        
        if email:
            battery_data = self.hello_request(
                api_url="devices/pill/{}/status".format(email),
                type="GET",
                test_mode=True
            )
        elif pill_id:
            battery_data = self.hello_request(
                api_url="devices/pill/id/{}/status".format(pill_id),
                type="GET",
                test_mode=True
            )

        battery_by_pill_id = defaultdict(list)
        for d in battery_data.data:
            battery_by_pill_id['pill{}'.format(d['deviceId'])].append(d)
        self.response.write(json.dumps({'data': dict(battery_by_pill_id).values()}))



