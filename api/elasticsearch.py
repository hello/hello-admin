from core.configuration.elasticsearch_configuration import ElasticSearchConfiguration
from core.handlers.base import ProtectedRequestHandler
from core.models.response import ResponseOutput
from requests.auth import HTTPBasicAuth
import requests


class SenseLogsElasticSearchAPI(ProtectedRequestHandler):
    def get(self):
        es_config = ElasticSearchConfiguration.query().get()

        response = requests.get(
            url="{}/_search?q={}".format(
                es_config.host,
                self.request.get("lucene_phrase")
            ),
            auth=HTTPBasicAuth(
                username=es_config.read_user,
                password=es_config.read_password
            )
        )

        response_output = ResponseOutput(
            data=response.json(),
            status=response.status_code,
            error="" if response.ok else response.reason,
            viewer=self.current_user_email
        )

        self.response.write(response_output.get_serialized_output())

