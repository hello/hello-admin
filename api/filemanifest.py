from collections import defaultdict
import json

from core.handlers.base import ProtectedRequestHandler


class FileManifestAPI(ProtectedRequestHandler):
    def get(self, sense_id):

        self.hello_request(
            api_url="files/" + sense_id,
            type="GET"
        )
