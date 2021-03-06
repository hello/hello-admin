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


class OrdersAPI(ShippingRequestHandler):
    def get(self):
        order_id = self.request.get('order_id', default_value='')
        output = ResponseOutput()
        output.set_viewer(self.current_user_email)
        try:
            output.set_data({'order_link': encrypt_order(order_id)})
            output.set_status(200)
        except Exception as e:
            output.set_status(500)
            output.set_error(e.message)
        self.response.write(output.get_serialized_output())


class OrdersMapAPI(ShippingRequestHandler):
    def get(self):
        urlfetch.set_default_fetch_deadline(30)
        output = {"data": [], "error": ""}
        try:
            response = requests.get(OrdersMap.query().get().url)
            data = response.json()
            output["data"] = data
        except Exception as e:
            error_message = "@long Failed to get orders map because {}. We may need to refresh s3 link".format(e.message)
            log.error(error_message)
            output["error"] = error_message
            self.slack_pusher.send_to_admin_logs_channel(error_message)

        self.response.write(json.dumps(output))
