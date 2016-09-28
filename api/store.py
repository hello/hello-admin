import base64
import logging as log
import json

import requests
from Crypto.Cipher import AES
from google.appengine.api import urlfetch

from core.models.response import ResponseOutput
from core.handlers.base import ShippingRequestHandler
from models.ext  import OrdersMap


ALPHABET="123456789abcdefghijkmnopqrstuvwxyz"
CIPHER = 'RBy9D2oWY?}7)PiNJEVaNKddkeup}8Pc' # never ever change this or we all die
BLOCK_SIZE = 16
PADDING = '{'

pad = lambda s: s + (BLOCK_SIZE - len(s) % BLOCK_SIZE) * PADDING

# one-liners to encrypt/encode and decrypt/decode a string
# encrypt with AES, encode with base64
EncodeAES = lambda c, s: base64.b64encode(c.encrypt(pad(s)))
DecodeAES = lambda c, e: c.decrypt(base64.b64decode(e)).rstrip(PADDING)

# create a cipher object using the random secret
cipher = AES.new(CIPHER)


def encrypt_order(order_id, cipher=cipher):
    return EncodeAES(cipher, str(order_id)).replace('/', '-')

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

        augmented = []
        for result in data.data:
            result['link'] = encrypt_order(result['order_id'])
            augmented.append(result)
        self.response.headers['Content-Type'] = 'application/json'
        self.response.out.write(json.dumps(augmented))
