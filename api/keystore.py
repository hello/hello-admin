import json
import re
import urllib
import datetime
import logging as log

import webapp2
from core.models.response import ResponseOutput
from core.handlers.base import ProtectedRequestHandler
from models.ext import KeyStoreLocker


class SenseKeyProvision(ProtectedRequestHandler):
    def post(self):
        blob = self.request.get("blob", default_value="")
        serial_number = self.request.get("serial_number", default_value="")

        if not blob or not serial_number:
            self.error(400)
            self.response.write("bad")
            log.info("no data")
            return

        self.hello_request(
            api_url="provision/" + serial_number,
            api_info=self.suripu_app,
            type="POST",
            body_data=blob,
            content_type="text/plain")

class SenseKeyStoreBatchAPI(ProtectedRequestHandler):
    def post(self):
        self.hello_request(
            api_url="key_store/sense",
            body_data=self.request.body,
            type="POST"
        )

class PillKeyStoreBatchAPI(ProtectedRequestHandler):
    def post(self):
        self.hello_request(
            api_url="key_store/pill",
            body_data=self.request.body,
            type="POST"
        )