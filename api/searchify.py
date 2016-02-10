import json
import re
import logging as log
import datetime

from google.appengine.api import urlfetch
from models.ext import LogsFacet

import settings
from core.handlers.base import ProtectedRequestHandler
from core.utils.common import display_error
from indextank import ApiClient


class SenseLogsAPI(ProtectedRequestHandler):
    @property
    def query(self):
        q = self.request.get("query", default_value="all:1")
        if q.strip() in ["text:", "device_id:", "date:"]:
            return "all:1"
        return q

    @property
    def categories(self):
        categories = self.request.get("categories", None)
        if categories:
            return json.loads(categories)
        return None
    @property
    def start_ts(self):
        start_ts = self.request.get("start")
        return int(start_ts)/1000 if start_ts else None

    @property
    def end_ts(self):
        end_ts = self.request.get("end")
        return int(end_ts)/1000 if end_ts else None

    @property
    def limit(self):
        return int(self.request.get("limit", default_value=10))

    @property
    def order(self):
        return int(self.request.get("order", default_value=0))

    @property
    def searchify_request(self):
        return {
            "query": self.query,
            "fetch_fields": self.request.get("fetch_fields", default_value=["text", "device_id", "top_fw_version", "middle_fw_version"]),
            "category_filters": self.categories,
            "docvar_filters": {0: [[self.start_ts, self.end_ts]]},
            "scoring_function": self.order,
            "length": self.limit,
            "fetch_variables": self.request.get("fetch_variables", default_value=True),
            "fetch_categories": self.request.get("fetch_categories", default_value=False),
        }

    def search_within_index(self, index_name):
        output = {'results': [], 'error': {}}
        index = ApiClient(self.searchify_credentials.api_client).get_index(index_name)
        log.info("searchify request {}".format(self.searchify_request))
        try:
            if "1" not in index.list_functions().keys():
                index.add_function(1, "-doc.var[0]")
            output.update(index.search(**self.searchify_request))
        except Exception as e:
            output['error'] = {index_name: display_error(e)}

        log.info("Searching in {}".format(index_name))
        return output

    def get(self):
        urlfetch.set_default_fetch_deadline(60)
        aggregate_output = {'results': [], 'error': {}}

        latest_date = datetime.datetime.utcnow()
        earliest_date = latest_date - datetime.timedelta(days=7)

        if self.end_ts:
            latest_date = min(latest_date, datetime.datetime.utcfromtimestamp(self.end_ts))

        index_date = latest_date

        if self.start_ts:
            earliest_date = max(earliest_date, datetime.datetime.utcfromtimestamp(self.start_ts))
            if not self.end_ts:
                index_date = earliest_date

        count = 0
        while self.limit > len(aggregate_output['results']):
            count += 1
            if count > 7:
                break
            log.info("Lacking {} results, will look into older index".format(self.limit - len(aggregate_output['results'])))
            index_name = settings.SENSE_LOGS_INDEX_PREFIX + index_date.strftime("%Y-%m-%d")
            if index_date.strftime("%Y-%m-%d") == "2015-05-26":
                log.warn("Querying backup index on searchify")
                index_name = settings.SENSE_LOGS_INDEX_BACKUP
            aggregate_output = self.concat_output(
                aggregate_output,
                self.search_within_index(index_name)
            )
            if self.order == 0:
                if index_date.strftime("%Y-%m-%d") == earliest_date.strftime("%Y-%m-%d"):
                    break
                index_date -= datetime.timedelta(days=1)
            elif self.order == 1:
                if index_date.strftime("%Y-%m-%d") == latest_date.strftime("%Y-%m-%d"):
                    break
                index_date += datetime.timedelta(days=1)

        self.response.write(json.dumps(aggregate_output))

    def concat_output(self, log1, log2):
        aggregate_error = {}
        aggregate_error.update(log1["error"])
        aggregate_error.update(log2["error"])

        aggregate_results = sorted(log1["results"] + log2["results"], key=lambda d: d.get("variable_0", 0))
        if len(aggregate_results) > self.limit:
            if self.order == 0:
                aggregate_results = aggregate_results[-1 - self.limit:-1]
            elif self.order == 1:
                aggregate_results = aggregate_results[:self.limit]
        return {
            "error": aggregate_error,
            "results": aggregate_results
        }



class SearchifyStatsAPI(ProtectedRequestHandler):
    """
    Retrieve current count of docs on searchify
    """
    def get(self):
        output = {'data': [], 'error': ''}
        try:
            searchify_cred = self.searchify_credentials
            searchify_client = ApiClient(searchify_cred.api_client)

            index_stats = [{
                "name": index.__dict__['_IndexClient__index_url'].split("indexes/")[-1],
                "size": index.get_size(),
                "created_at": int(index.get_creation_time().strftime("%s"))*1000
            } for index in searchify_client.list_indexes()]

            output['data'] = sorted(index_stats, key=lambda i: i['created_at'])
        except Exception as e:
            output['error'] = display_error(e)

        self.response.write(json.dumps(output))


class WifiSignalStrengthAPI(ProtectedRequestHandler):
    def get_wifi_from_index(self, index_name):
        urlfetch.set_default_fetch_deadline(30)
        output = {"data": {}, "error": ""}
        index = ApiClient(self.searchify_credentials.api_client).get_index(index_name)
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

        return output

    def get(self):
        urlfetch.set_default_fetch_deadline(30)
        now = datetime.datetime.utcnow()

        output = {"data": {}, "error": ""}
        count = 0

        while count < settings.SENSE_LOGS_KEEP_DAYS:
            index_name = settings.SENSE_LOGS_INDEX_PREFIX + (now - datetime.timedelta(days=count)).strftime("%Y-%m-%d")
            output = self.get_wifi_from_index(index_name)
            if output['data']:
                break
            count += 1
        self.response.write(json.dumps(output))


class LogsFacetAPI(ProtectedRequestHandler):
    @property
    def date(self):
        date_components = self.request.get("date", default_value=datetime.datetime.now().strftime("%m-%d-%Y")).split("-")
        return "-".join([date_components[2], date_components[0], date_components[1]])

    @property
    def pattern(self):
        return self.request.get("pattern")

    @property
    def start_ts(self):
        return self.request.get("start_ts", default_value=None) or None

    @property
    def end_ts(self):
        return self.request.get("end_ts", default_value=None) or None

    @property
    def middle_fw_version(self):
        middle_fw_version = self.request.get("middle_fw_version", default_value=None)
        if not middle_fw_version:
            return None
        return middle_fw_version

    def get_facets(self, index_name):
        output = {"data": [], "error": "Facets not found!"}
        index = ApiClient(self.searchify_credentials.api_client).get_index(index_name)
        try:
            output['data'] = index.search(
                query="text:{}".format(self.pattern),
                category_filters={"middle_fw_version": self.middle_fw_version.upper()},
                docvar_filters={0: [[self.start_ts, self.end_ts]]}
            ).get("facets", {})
            if output['data']:
                output['error'] = ""
        except Exception as e:
            output['error'] = display_error(e)
            log.error("")
        return output

    def get(self):
        urlfetch.set_default_fetch_deadline(30)
        facets = self.get_facets(settings.SENSE_LOGS_INDEX_PREFIX + self.date)
        self.response.write(json.dumps(facets))


class LogsFacetHistoryAPI(LogsFacetAPI):
    def get(self):
        output = {"data": [], "error": ""}
        try:
            output["data"] = LogsFacet.get_by_date_as_dicts(self.date)
        except Exception as e:
            output["error"] = e.message

        self.response.write(json.dumps(output))


class SearchifyQuery():
    def __init__(self):
        self.query = "all:1"  # by default search for all availalbe documents
        self.fetch_fields = ['text', 'timestamp']  # by default just fetch text and timestamp field
        self.category_filters = {}  # by default no filter
        self.scoring_function = 0  # by default looks for latest documents
        self.length = 100  # by default return at most 100 documents per search
        self.docvar_filters = {}
        self.fetch_variables = True
        self.fetch_categories = False

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
            raise TypeError("Docvar filters must be a dict")
        self.docvar_filters = docvar_filters

    def set_fetch_variables(self, fetch_variables):
        if not isinstance(fetch_variables, bool):
            raise TypeError("Fetch variables must be a bool")
        self.docvar_filters = fetch_variables

    def set_fetch_categories(self, fetch_categories):
        if not isinstance(fetch_categories, bool):
            raise TypeError("Fetch categories must be a bool")
        self.docvar_filters = fetch_categories

    def mapping(self):
        return {
            'query': self.query,
            'fetch_fields': self.fetch_fields,
            'category_filters': self.category_filters,
            'scoring_function': self.scoring_function,
            'length': self.length,
            'docvar_filters': self.docvar_filters,
            'fetch_variables': self.fetch_variables,
            'fetch_categories': self.fetch_categories
        }

