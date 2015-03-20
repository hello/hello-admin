import json
import logging as log
from handlers.helpers import ProtectedRequestHandler
from handlers.utils import stripStringToList, display_error
from indextank import ApiClient
import settings

__author__ = 'zet'


class SearchifyLogsHandler(ProtectedRequestHandler):
    """
    Retrieve debug logs
    """
    def get_logs_by_index(self, index_name, filters={}):
        output = {'data': [], 'error': ''}

        max_results = int(self.request.get('max_results', default_value=100))
        text_input = self.request.get('text', default_value="")
        start_time = self.request.get('start_time', default_value="")
        end_time = self.request.get('end_time', default_value="")
        searchify_cred = settings.SEARCHIFY

        try:
            if searchify_cred is None:
                raise RuntimeError("Missing Searchify Credentials")

            index = ApiClient(searchify_cred.api_client).get_index(index_name)
            searchify_query = SearchifyQuery()

            if text_input:
                searchify_query.set_query("text:{}".format(text_input))

            if start_time.isdigit() or end_time.isdigit():  # Use custom scoring function if there is time input
                if not end_time.isdigit():
                    scoring_function = 'if((doc.var[0] - {}) > 0, doc.var[0], rel)'.format(start_time)
                elif not start_time.isdigit():
                    scoring_function = 'if((doc.var[0] - {}) < 0, doc.var[0], rel)'.format(end_time)
                else:
                    scoring_function = 'if((doc.var[0] - {})*(doc.var[0] - {}) < 0, doc.var[0], rel)'.format(start_time, end_time)

                index.add_function(3, scoring_function)
                searchify_query.set_scoring_function(3)
            elif '2015' not in index_name:
                searchify_query.set_query("all:0") # Do not look for latest documents in the old index

            if filters:
                searchify_query.set_category_filters(filters)

            searchify_query.set_length(max_results)
            output['data'] = index.search(**searchify_query.mapping())['results']

        except Exception as e:
            output['error'] = display_error(e)
            log.error('ERROR: {}'.format(display_error(e)))

        return output

    def get_logs_filtered_by_devices(self, index_name):
        devices_input = self.request.get('devices', default_value="")
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
        if devices_list:  # Only filter if list of devices is not empty
            return self.get_logs_by_index(index_name, {'device_id': devices_list})

        return self.get_logs_by_index(index_name)

    def get_logs_filtered_by_levels_orgins_versions(self, index_name):
        levels_input = self.request.get('levels', default_value="")
        origins_input = self.request.get('origins', default_value="")
        versions_input = self.request.get('versions', default_value="")

        filters = {}

        if levels_input:
            filters.update({"level": stripStringToList(levels_input)})
        if origins_input:
            filters.update({"origin": stripStringToList(origins_input)})
        if versions_input:
            filters.update({"version": stripStringToList(versions_input)})

        return self.get_logs_by_index(index_name, filters)


class ApplicationLogsAPI(SearchifyLogsHandler):
    """
    Retrieve application logs
    """
    def get(self):
        new_application_logs_output = self.get_logs_filtered_by_levels_orgins_versions("application-logs-2015-03")
        old_application_logs_output = self.get_logs_filtered_by_levels_orgins_versions("application-logs")

        aggregate_output = {
            'data': new_application_logs_output['data'] + old_application_logs_output['data'],
            'error': new_application_logs_output['error'] + old_application_logs_output['error'],
            }
        self.response.write(json.dumps(aggregate_output))


class SenseLogsAPI(SearchifyLogsHandler):
    """
    Retrieve sense logs
    """
    def get(self):

        new_sense_logs_output = self.get_logs_filtered_by_devices("sense-logs-2015-03")
        old_sense_logs_output = self.get_logs_filtered_by_devices("sense-logs")

        aggregate_output = {
            'data': new_sense_logs_output['data'] + old_sense_logs_output['data'],
            'error': new_sense_logs_output['error'] + old_sense_logs_output['error'],
            }
        self.response.write(json.dumps(aggregate_output))


class WorkerLogsAPI(SearchifyLogsHandler):
    """
    Retrieve worker logs
    """
    def get(self):
        self.response.write(json.dumps(self.get_logs_filtered_by_levels_orgins_versions("workers-logs-2015-03")))


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

class SearchifyQuery():
    def __init__(self):
        self.query = "all:1"  # by default search for all availalbe documents
        self.fetch_fields = ['text', 'timestamp']  # by default just fetch text and timestamp field
        self.category_filters = {}  # by default no filter
        self.scoring_function = 0  # by default looks for latest documents
        self.length = 100  # by default return at most 100 documents per search

    def set_query(self, query):
        if not isinstance(query, str):
            raise TypeError("Query should be a string")
        self.query = query

    def set_fetch_fields(self, fetch_fields):
        if not isinstance(fetch_fields, list):
            raise TypeError("Fetch fields must be a list")
        self.fetch_fields = fetch_fields

    def set_category_filters(self, category_filters):
        if not isinstance(category_filters, dict):
            raise TypeError("Category filter must be a dict")
        self.category_filters = category_filters

    def set_scoring_function(self, scoring_function):
        if not isinstance(scoring_function, int):
            raise TypeError("Scoring function ID must an integer")
        self.scoring_function = scoring_function

    def set_length(self, length):
        if not isinstance(length, int):
            raise TypeError("Results length must an integer")
        self.length = length

    def mapping(self):
        return {
            'query': self.query,
            'fetch_fields': self.fetch_fields,
            'category_filters': self.category_filters,
            'scoring_function': self.scoring_function,
            'length': self.length
        }
