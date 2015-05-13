import json
import re
import settings
import logging as log
from handlers.helpers import ProtectedRequestHandler
from handlers.utils import stripStringToList, display_error
from handlers.utils import get_pacific_time_from_epoch_seconds
from indextank import ApiClient
from google.appengine.api import urlfetch


class SearchifyLogsHandler(ProtectedRequestHandler):
    """
    Retrieve debug logs
    """
    def normalize_epoch(self, ts, index_name):
        if "sense" in index_name:
            return ts
        return 1000*int(ts)

    def get_logs_by_index(self, index_name, filters={}):
        output = {'data': [], 'error': ''}
        urlfetch.set_default_fetch_deadline(30)

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
                    scoring_function = 'if((doc.var[0] - {}) > 0, doc.var[0], rel)'.format(self.normalize_epoch(start_time, index_name))
                elif not start_time.isdigit():
                    scoring_function = 'if((doc.var[0] - {}) < 0, doc.var[0], rel)'.format(self.normalize_epoch(end_time, index_name))
                else:
                    scoring_function = 'if((doc.var[0] - {})*(doc.var[0] - {}) < 0, doc.var[0], rel)'.format(self.normalize_epoch(start_time, index_name), self.normalize_epoch(end_time, index_name))

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
                    device_info = self.hello_request(
                        api_url="devices/sense",
                        type="GET",
                        url_params={'email': d},
                        app_info=settings.ADMIN_APP_INFO,
                        raw_output=True
                    ).data
                    if device_info:
                        devices_list.append(device_info[0]['device_account_pair']['externalDeviceId'])
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
            filters.update({"level": map(lambda x:x.upper(), stripStringToList(levels_input))})
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
        self.response.write(json.dumps(self.get_logs_filtered_by_levels_orgins_versions(settings.APPLICATION_LOGS_INDEX)))


class SenseLogsAPI(SearchifyLogsHandler):
    """
    Retrieve sense logs
    """
    def get(self):
        self.response.write(json.dumps(self.get_logs_filtered_by_devices(settings.SENSE_LOGS_INDEX)))


class WorkerLogsAPI(SearchifyLogsHandler):
    """
    Retrieve worker logs
    """
    def get(self):
        self.response.write(json.dumps(self.get_logs_filtered_by_levels_orgins_versions(settings.WORKERS_LOGS_INDEX)))


class SearchifyStatsAPI(ProtectedRequestHandler):
    """
    Retrieve current count of docs on searchify
    """
    def get(self):
        output = {'data': [], 'error': ''}
        try:
            searchify_cred = settings.SEARCHIFY
            searchify_client = ApiClient(searchify_cred.api_client)

            output['data'] = []
            for index in sorted(searchify_client.list_indexes()):
                try:
                    oldest_ts = get_pacific_time_from_epoch_seconds(int(index.search("all:1", scoring_function=1)
                        ['results'][0]['docid'].split('-')[-1])/1000)
                    newest_ts = get_pacific_time_from_epoch_seconds(int(index.search("all:1", scoring_function=0)
                        ['results'][0]['docid'].split('-')[-1])/1000)
                except Exception as e:
                    oldest_ts = 'n/a'
                    newest_ts = 'n/a'
                output['data'].append({
                    "summary": index.__dict__,
                    "oldest_ts": oldest_ts,
                    "newest_ts": newest_ts
                })
        except Exception as e:
            output['error'] = display_error(e)

        self.response.write(json.dumps(output))


class DustStatsAPI(ProtectedRequestHandler):
    def get(self):
        urlfetch.set_default_fetch_deadline(20)
        output = {"data": [], "error": ""}
        index = ApiClient(settings.SEARCHIFY.api_client).get_index(settings.SENSE_LOGS_INDEX)
        query = SearchifyQuery()

        try:
            query.set_query("text:dust")
            query.set_category_filters({"device_id": self.request.get("device_id", "")})
            query.set_length(min(700, int(self.request.get("length", 100))))

            start_ts = self.request.get("start_ts", None)
            if start_ts:
                start_ts = int(start_ts)/1000
            end_ts = self.request.get("end_ts", None)
            if end_ts:
                end_ts = int(end_ts)/1000
            query.set_docvar_filters({0: [[start_ts, end_ts]]})

            results = index.search(**query.mapping())['results']

            regex_pattern = "collecting time (\d+)\\t.*?dust (\d+) (\d+) (\d+) (\d+)\\t"

            matches = [re.findall(regex_pattern, r['text']) for r in results]

            output['data'] = [{
                'timestamp': int(item[0])*1000,
                'average': int(item[1]),
                'max': int(item[2]),
                'min': int(item[3]),
                'variance': int(item[4])
            } for sublist in matches for item in sublist if all([i.isdigit() for i in item])]

        except Exception as e:
            output['error'] = display_error(e)
            log.error('ERROR: {}'.format(display_error(e)))

        self.response.write(json.dumps(output))


class WifiSignalStrengthAPI(ProtectedRequestHandler):
    def get(self):
        output = {"data": [], "error": ""}
        index = ApiClient(settings.SEARCHIFY.api_client).get_index(settings.SENSE_LOGS_INDEX)
        query = SearchifyQuery()

        try:
            device_id = self.request.get("device_id", "")
            query.set_query("text:UNIQUE")
            query.set_category_filters({"device_id": device_id})
            query.set_length(min(700, int(self.request.get("length", 100))))
            query.set_fetch_fields(['text', 'device_id', 'timestamp'])

            results = index.search(**query.mapping())['results']

            regex_pattern = "(.*?) (-[0-9]+) ([0-2]) ([a-z0-9]+):([a-z0-9]+):([a-z0-9]+):([a-z0-9]+):([a-z0-9]+):([a-z0-9]+):"

            latest_log_with_unique_ssid = sorted([r for r in results
                                                  if r['device_id'] == device_id and "SSID RSSI UNIQUE" in r['text']],
                                                 key=lambda z: int(z.get('timestamp', 0)))

            if len(latest_log_with_unique_ssid) > 0:
                matches = re.findall(regex_pattern, latest_log_with_unique_ssid[-1]['text'].split("SSID RSSI UNIQUE")[-1])
                all_wifis_seen = [{
                    'network_name': item[0],
                    'signal_strength': item[1],
                    'network_security': item[2]
                } for item in matches]

                output['data'] = {
                    "scan_time": latest_log_with_unique_ssid[-1]['timestamp'],
                    "networks": sorted(all_wifis_seen, key=lambda w: int(w.get("signal_strength", 0)), reverse=True)
                }

        except Exception as e:
            output['error'] = display_error(e)
            log.error('ERROR: {}'.format(display_error(e)))

        self.response.write(json.dumps(output))


class SearchifyQuery():
    def __init__(self):
        self.query = "all:1"  # by default search for all availalbe documents
        self.fetch_fields = ['text', 'timestamp']  # by default just fetch text and timestamp field
        self.category_filters = {}  # by default no filter
        self.scoring_function = 0  # by default looks for latest documents
        self.length = 100  # by default return at most 100 documents per search
        self.docvar_filters = {}

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
            raise TypeError("Scoring function ID must be an integer")
        self.scoring_function = scoring_function

    def set_length(self, length):
        if not isinstance(length, int):
            raise TypeError("Results length must be an integer")
        self.length = length

    def set_docvar_filters(self, docvar_filters):
        if not isinstance(docvar_filters, dict):
            raise TypeError("Results length must be a dict")
        self.docvar_filters = docvar_filters

    def mapping(self):
        return {
            'query': self.query,
            'fetch_fields': self.fetch_fields,
            'category_filters': self.category_filters,
            'scoring_function': self.scoring_function,
            'length': self.length
        }



