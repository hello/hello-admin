import base64
import requests
import logging as log
import json
from Crypto.Cipher import AES
from handlers.helpers import ResponseOutput
from handlers.helpers import ShippingRequestHandler
from models.ext  import OrdersMap
from google.appengine.api import urlfetch


ALPHABET="123456789abcdefghijkmnopqrstuvwxyz"
CIPHER = 'YPrHmFNfCWMY,rH7ZdG4XueeAhxc+FnC' # never ever change this or we all die
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
        output.set_viewer(self.current_user.email())
        try:
            output.set_data({'order_link': encrypt_order(order_id)})
            output.set_status(200)
            output.set_viewer(self.current_user.email())
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
            error_message = "Failed to get orders map because {}. We may need to refresh s3 link".format(e.message)
            log.error(error_message)
            output["error"] = error_message
            self.send_to_slack_admin_logs_channel(error_message)

        self.response.write(json.dumps(output))
