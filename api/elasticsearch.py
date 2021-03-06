import json
from core.configuration.elasticsearch_configuration import ElasticSearchConfiguration
from core.handlers.base import ProtectedRequestHandler
from core.models.response import ResponseOutput
import requests
from google.appengine.api import urlfetch
import datetime
import re
import logging as log
from core.utils.common import display_error

class ElasticSearchHandler(ProtectedRequestHandler):
    SENSE_LOGS_INDEX_PATTERN = "sense-logs-20*"
    SENSE_LOGS_INDEX_FW_CRASH = "sense-logs-fw-crash"

    def __init__(self, request, response):
        super(ElasticSearchHandler, self).__init__(request, response)
        urlfetch.set_default_fetch_deadline(60)

    @property
    def es_config(self):
        return ElasticSearchConfiguration.query().get()
    @property
    def base_url(self):
        return "{}:{}".format(self.es_config.host, self.es_config.http_port)
    @property
    def token(self):
        return self.es_config.token

    def getTime(self, item):
        if len(item):
                return item[0]

class SenseLogsElasticSearchAPI(ElasticSearchHandler):
    def get(self):
        index = self.request.get("index", default_value=self.SENSE_LOGS_INDEX_PATTERN)
        lucene_phrase = self.request.get("lucene_phrase")
        size = self.request.get("size")
        sort = self.request.get("sort")

        es_params = [
            "q=" + lucene_phrase if lucene_phrase else "",
            "size=" + size if size else "",
            "sort=" + sort if sort else ""
        ]

        response = requests.get(
            url="{}/{}/_search?{}".format(
                self.base_url,
                index,
                "&".join([esp for esp in es_params if esp != ""])
            ),
            headers={"Authorization": self.token}
        )

        response_output = ResponseOutput.fromPyRequestResponse(response, self.current_user_email)
        self.response.write(response_output.get_serialized_output())


class ElasticSearchStatusAPI(ElasticSearchHandler):
    def get(self):
        response = requests.get(
            url="{}/{}/_status".format(
                self.base_url,
                self.SENSE_LOGS_INDEX_PATTERN
            ),
            headers={"Authorization": self.token}
        )
        response_output = ResponseOutput.fromPyRequestResponse(response, self.current_user_email)
        self.response.write(response_output.get_serialized_output())


class ElasticSearchAggregationAPI(ElasticSearchHandler):
    def get(self):
        index = self.request.get("index", default_value=self.SENSE_LOGS_INDEX_PATTERN)
        lucene_phrase = self.request.get("lucene_phrase")
        search_params = "?q={}".format(lucene_phrase) if lucene_phrase else ""
        top_size = self.request.get("size", default_value=10)  # show top ten and others by default

        fields = self.request.get("fields", default_value="").split(",")
        multi_facets_settings = {
            field.strip() : {
                "terms": {"field": field.strip(), "size": top_size}
            }
        for field in fields if field}

        response = requests.post(
            url="{}/{}/_search{}".format(
                self.base_url,
                index,
                search_params
            ),
            data=json.dumps({
                "aggs" : multi_facets_settings
            }),
            headers={"Authorization": self.token}
        )
        response_output = ResponseOutput.fromPyRequestResponse(response, self.current_user_email)
        self.response.write(response_output.get_serialized_output())

class DustStatsAPI(ElasticSearchHandler):
    def get(self):
        urlfetch.set_default_fetch_deadline(20)
        output = {"data": [], "error": ""}
        now_ts = int(datetime.datetime.now().strftime("%s")) * 1000

        input_ts = self.request.get("start_time", default_value=now_ts)
        index = self.request.get("index", default_value=self.SENSE_LOGS_INDEX_PATTERN)
        device_id = self.request.get("device_id", "")
        length = min(700, int(self.request.get("length", 100)))

        try:
            response = requests.post(
                    url="{}/{}/_search".format(
                            self.base_url,
                            index),
                    data=json.dumps({
                        "query": {
                            "filtered": {
                                "query": {
                                    "bool": {
                                        "must": [
                                            {"match": {"sense_id": device_id}},
                                            {"match": {"has_dust": "true"}}
                                        ]
                                    }
                                },
                                "filter": {
                                    "range": {"epoch_millis": {
                                        "gte": input_ts
                                    }}
                                }
                            }
                        },
                        "size": length,
                        "sort": [
                            {"epoch_millis": {"order": "asc"}}
                        ]
                    }),
                    headers={"Authorization": self.token})
            results = []
            for hit in json.loads(response.content)["hits"]["hits"]:
                results.append(hit["_source"])

            regex_pattern = "collecting time (\\d+)\\t.*?dust (\\d+) (\\d+) (\\d+) (\\d+)\\t"
            matches = [re.findall(regex_pattern, r['text']) for r in results]
            output['data'] = [{
                  'timestamp': int(item[0]) * 1000,
                  'average': int(item[1]),
                  'max': int(item[2]),
                  'min': int(item[3]),
                  'variance': int(item[4])
              } for sublist in sorted(matches, key=self.getTime) for item in sublist if all([i.isdigit() for i in item])]

        except Exception as e:
            output['error'] = display_error(e)
            log.error('ERROR: {}'.format(display_error(e)))

        self.response.write(json.dumps(output))

class DeviceStatsAPI(ElasticSearchHandler):
    def get(self):
        urlfetch.set_default_fetch_deadline(20)
        output = {"data": [], "error": ""}
        now_ts = int(datetime.datetime.now().strftime("%s")) * 1000

        stats_type = self.request.get("type", default_value="heap")
        input_ts = self.request.get("start_time", default_value=now_ts)
        index = self.request.get("index", default_value=self.SENSE_LOGS_INDEX_PATTERN)
        device_id = self.request.get("device_id", "")
        length = min(10000, int(self.request.get("length", 100)))

        try:
            response = requests.post(
                    url="{}/{}/_search".format(
                            self.base_url,
                            index),
                    data=json.dumps({
                        "query": {
                            "filtered": {
                                "query": {
                                    "bool": {
                                        "must": [
                                            {"match": {"sense_id": device_id}}
                                        ]
                                    }
                                },
                                "filter": {
                                    "range": {"epoch_millis": {
                                        "gte": input_ts
                                    }}
                                }
                            }
                        },
                        "size": length,
                        "sort": [
                            {"epoch_millis": {"order": "asc"}}
                        ]
                    }),
                    headers={"Authorization": self.token})
            results = []
            for hit in json.loads(response.content)["hits"]["hits"]:
                results.append(hit["_source"])

            if stats_type == "voc":
                regex_pattern = "TVOC (\\d+),(\\d+),(\\d+),(\\d+),(\\d+),(\\d+),(\\d+)\\n"
            else:
                regex_pattern = "collecting time (\\d+).*\\nheap (\\d+) \\+: (\\d+) -: (\\d+)\\n"

            matches = [re.findall(regex_pattern, r['text']) for r in results]
            if stats_type == "voc":
                output['data'] = [{
                                      'timestamp': int(item[0]) * 1000,
                                      'tvoc': int(item[1]),
                                      'eco2': int(item[2]),
                                      'current': int(item[3]),
                                      'voltage': int(item[4]),
                                      'temp': int(item[5]),
                                      'humid': int(item[6])
                                  } for sublist in sorted(matches, key=self.getTime) for item in sublist if all([i.isdigit() for i in item])]
            else:
                output['data'] = [{
                                      'timestamp': int(item[0]) * 1000,
                                      'free': int(item[1]),
                                      'max': int(item[2]),
                                      'min': int(item[3])
                                  } for sublist in sorted(matches, key=self.getTime) for item in sublist if all([i.isdigit() for i in item])]

        except Exception as e:
            output['error'] = display_error(e)
            log.error('ERROR: {}'.format(display_error(e)))

        self.response.write(json.dumps(output))
