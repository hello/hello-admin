import base64
import json
import logging as log
from Crypto.Cipher import AES
from handlers.helpers import ResponseOutput
from handlers.helpers import ProtectedRequestHandler


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


class OrdersAPI(ProtectedRequestHandler):
    def get(self):
        order_id = self.request.get('order_id', default_value='')
        print order_id
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
