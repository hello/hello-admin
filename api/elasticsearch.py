from core.configuration.elasticsearch_configuration import ElasticSearchConfiguration
from core.handlers.base import ProtectedRequestHandler
from core.models.response import ResponseOutput
import requests


class ElasticSearchHandler(ProtectedRequestHandler):
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
        lucene_phrase = self.request.get("lucene_phrase")
        size = self.request.get("size")
        sort = self.request.get("sort")

        es_params = [
            "q=" + lucene_phrase if lucene_phrase else "",
            "size=" + size if size else "",
            "sort=" + sort if sort else ""
        ]

        response = requests.get(
            url="{}/_search?{}".format(
                self.base_url,
                "&".join([esp for esp in es_params if esp != ""])
            ),
            headers={"Authorization": self.token}
        )

        response_output = ResponseOutput.fromPyRequestResponse(response, self.current_user_email)
        self.response.write(response_output.get_serialized_output())


class ElasticSearchStatusAPI(ElasticSearchHandler):
    def get(self):
        response = requests.get(
            url="{}/_all/_status".format(
                self.base_url
            ),
            headers={"Authorization": self.token}
        )
        response_output = ResponseOutput.fromPyRequestResponse(response, self.current_user_email)
        self.response.write(response_output.get_serialized_output())

