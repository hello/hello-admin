import base64
import logging as log
import json

import requests
from Crypto.Cipher import AES
from google.appengine.api import urlfetch

from core.models.response import ResponseOutput
from core.handlers.base import ShippingRequestHandler
from models.ext  import OrdersMap


class StoreAPI(ShippingRequestHandler):
    def get(self):
        q = self.request.get('q', '')

        data = self.hello_request(
            api_url="store/search",
            type="GET",
            raw_output=True,
            api_info=self.suripu_admin,
            url_params={'q': q}
        )

        self.response.headers['Content-Type'] = 'application/json'
        self.response.out.write(json.dumps(data.data))
