import json
from core.configuration.elasticsearch_configuration import ElasticSearchConfiguration
from core.handlers.base import ProtectedRequestHandler
from core.models.response import ResponseOutput
import requests
from google.appengine.api import urlfetch

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