import json
import logging as log
from handlers.helpers import ProtectedRequestHandler
from handlers.utils import stripStringToList, display_error
from indextank import ApiClient
import settings

__author__ = 'zet'


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

            index.add_function(3, scoring_function)
            search_params = {
                'query': 'text:UART',
                'category_filters': {},
                'fetch_fields': ['text', 'timestamp'],
                'length': max_results,
                'scoring_function': 3
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


class SearchifyLogsAPI(ProtectedRequestHandler):
    """
    Retrieve application logs
    """

    def get_logs_by_index(self, index_name):
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

            index = ApiClient(searchify_cred.api_client).get_index(index_name)

            if start_time.isdigit() and end_time.isdigit():
                scoring_function = 'if((doc.var[0] - {})*(doc.var[0] - {}) < 0, doc.var[0], rel)'.format(start_time, end_time)
            elif start_time.isdigit():
                scoring_function = 'if((doc.var[0] - {}) > 0, doc.var[0], rel)'.format(start_time)
            elif end_time.isdigit():
                scoring_function = 'if((doc.var[0] - {}) < 0, doc.var[0], rel)'.format(end_time)
            else:
                scoring_function = 'doc.var[0]'

            index.add_function(3, scoring_function)
            search_params = {
                'query': 'text:data',
                'category_filters': {},
                'fetch_fields': ['text', 'timestamp'],
                'length': max_results,
                'scoring_function': 3
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


class ApplicationLogsAPI(SearchifyLogsAPI):
    """
    Retrieve worker logs
    """
    def get(self):
        self.get_logs_by_index("application-logs")


class WorkerLogsAPI(SearchifyLogsAPI):
    """
    Retrieve worker logs
    """
    def get(self):
        self.get_logs_by_index("workers-logs-2015-03")


class SearchifyStatsAPI(ProtectedRequestHandler):
    """
    Retrieve current count of docs on searchify
    """
    def get(self):
        output = {'data': [], 'error': ''}
        try:
            searchify_cred = settings.SEARCHIFY
            searchify_api = ApiClient(searchify_cred.api_client)
            sense_log_index = searchify_api.get_index("sense-logs")
            hello_sense_log_latest_ts = sense_log_index.search(query="text:hello", scoring_function=0)["results"][0]["docid"]
            output['data'] = {
                'latest sense log containing "hello"': hello_sense_log_latest_ts,
                "summary": [i._get_metadata() for i in searchify_api.list_indexes()]
            }
        except Exception as e:
            output['error'] = display_error(e)
        self.response.write(json.dumps(output))