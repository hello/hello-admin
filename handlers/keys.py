import hashlib
import json
from helpers import ProtectedRequestHandler
from Crypto.PublicKey import RSA
from handlers.helpers import ResponseOutput
from models.ext import KeyStoreLocker

def extract_key(content):
  blob = "".join("{:02x}".format(ord(c)) for c in content)
  print "-> blob", blob
  pad = blob[:160]
  key = blob[162:194]
  device_id = blob[196:212]
  sha1 = blob[214:-2]
  print "-> pad", pad, len(pad)
  print "-> key", key, len(key)
  print "-> device_id", device_id, len(device_id)
  print "->sha", sha1, len(sha1)
  m = hashlib.sha1()
  m.update(content[81:-21])
  if sha1 != m.hexdigest():
      raise RuntimeError("sha do not match!")
  return device_id.upper(), key.upper()

class KeysAPI(ProtectedRequestHandler):
    def get(self):
        blob = self.request.get("blob", default_value="")
        stage = self.request.get("stage", default_value="")

        output = ResponseOutput()
        output.set_status(self.response.status_int)
        output.set_viewer(self.current_user.email())
        try:
            priv = KeyStoreLocker.get_by_id(stage)
            if not priv:
                raise RuntimeError('No secret key found for {} !'.format(stage))

            h = blob.decode('hex')
            KEY = RSA.importKey(priv.private_key)
            a = KEY.decrypt(h)
            device_id, public_key = extract_key(a)

            output.set_data({
                'device_id': device_id,
                'public_key': public_key,
            })

        except Exception as e:
            output.set_error(e.message)

        self.render_response(output)

    def post(self):
        device_type = self.request.get("device_type", default_value="")
        device_id = self.request.get("device_id", default_value="")
        public_key = self.request.get("public_key", default_value="")
        metadata = self.request.get("metadata", default_value="")

        print device_type, device_id, public_key, metadata
        print json.loads(metadata).keys()
        self.hello_request(
            api_url="provision/{}".format(device_type),
            type="POST",
            body_data=json.dumps({
                "metadata": metadata,
                "public_key": public_key,
                "device_id": device_id
            }),
        )

