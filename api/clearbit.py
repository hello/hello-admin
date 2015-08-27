import logging as log

import requests

from core.models.response import ResponseOutput
from core.handlers.base import ProtectedRequestHandler
from models.ext import Clearbit


class ClearbitAPI(ProtectedRequestHandler):
    def get(self):
        output = ResponseOutput()
        clearbit_token = ""
        try:
            clearbit_token = Clearbit.query().get().token
        except Exception as e:
            log.error("Failed to get clearbit token because {}", e.message)

        if not clearbit_token:
            output.set_error = "No clearbit token"
            output.set_status(401)
            self.response.write(output.get_serialized_output())
            return
        clearbit_response = requests.get(
            url="https://person.clearbit.com/v1/people/email/{}".format(self.request.get("email")),
            headers={"Authorization": "Bearer {}".format(clearbit_token)}
        )
        if clearbit_response.ok:
            output.set_data(clearbit_response.json())
        output.set_status(clearbit_response.status_code)
        output.set_error(clearbit_response.reason)
        self.response.write(output.get_serialized_output())