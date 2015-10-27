from core.configuration.elasticsearch_configuration import ElasticSearchConfiguration
from core.handlers.base import ProtectedRequestHandler
from core.models.response import ResponseOutput
import requests


class SenseLogsElasticSearchAPI(ProtectedRequestHandler):
    def get(self):
        es_config = ElasticSearchConfiguration.query().get()
        lucene_phrase = self.request.get("lucene_phrase")
        size = self.request.get("size")
        sort = self.request.get("sort")

        es_params = [
            "q=" + lucene_phrase if lucene_phrase else "",
            "size=" + size if size else "",
            "sort=" + sort if sort else ""
        ]

        response = requests.get(
            url="{}:{}/_search?{}".format(
                es_config.host,
                es_config.http_port,
                "&".join([esp for esp in es_params if esp != ""])
            ),
            headers={"Authorization": es_config.token}
        )

        response_output = ResponseOutput(
            data=response.json(),
            status=response.status_code,
            error="" if response.ok else response.reason,
            viewer=self.current_user_email
        )

        self.response.write(response_output.get_serialized_output())

