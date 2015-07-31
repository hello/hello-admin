import json
import re
import urllib
import webapp2
import hashlib
import binascii
import datetime
import logging as log
import settings

from helpers import ProtectedRequestHandler
from Crypto.PublicKey import RSA
from handlers.helpers import ResponseOutput
from models.ext import KeyStoreLocker
from google.appengine.api import files, images
from google.appengine.ext import blobstore, deferred
from google.appengine.ext.webapp import blobstore_handlers
from Crypto.Cipher import AES
from Crypto.Util import Counter

WEBSITE = 'https://hello-admin.appspot.com/'
MIN_FILE_SIZE = 1  # bytes
MAX_FILE_SIZE = 5000000  # bytes
IMAGE_TYPES = re.compile('image/(gif|p?jpeg|(x-)?png)')
ACCEPT_FILE_TYPES = IMAGE_TYPES
THUMBNAIL_MODIFICATOR = '=s80'  # max width / height
EXPIRATION_TIME = 300  # seconds
ALL_FILES_ACCEPTED = True


def extract_key(content):
  blob = "".join("{:02x}".format(ord(c)) for c in content)
  pad = blob[:160]
  key = blob[162:194]
  device_id = blob[196:212]
  sha1 = blob[214:-2]

  m = hashlib.sha1()
  m.update(content[81:-21])
  if sha1 != m.hexdigest():
      log.error("-> blob %s", blob)
      log.error("-> pad: %s, %d", pad, len(pad))
      log.error("-> key: %s, %d", key, len(key))
      log.error("-> device_id: %s, %d", device_id, len(device_id))
      log.error("->sha: %s, %d", sha1, len(sha1))
      raise RuntimeError("sha do not match!")
  return device_id.upper(), key.upper()

class SenseKeyProvision(ProtectedRequestHandler):
    def get(self):
        blob = self.request.get("blob", default_value="")
        stage = self.request.get("stage", default_value="")

        output = ResponseOutput()
        output.set_status(self.response.status_int)
        output.set_viewer(self.current_user.email())

        try:
            priv = KeyStoreLocker.get_by_id(stage)
            if not priv or "Fill in" in priv.private_key:
                raise RuntimeError('No secret sense key found for {} !'.format(stage.upper()))

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
        device_id = self.request.get("device_id", default_value="")
        public_key = self.request.get("public_key", default_value="")
        metadata = self.request.get("metadata", default_value="")

        self.hello_request(
            api_url="devices/provision/sense",
            type="POST",
            body_data=json.dumps({
                "metadata": metadata,
                "public_key": public_key,
                "device_id": device_id
            }),
        )

class PillKeyProvision(ProtectedRequestHandler):
    def post(self):
        device_id = self.request.get("device_id", default_value="")
        public_key = self.request.get("public_key", default_value="")
        remark = self.request.get("remark", default_value="")

        self.hello_request(
            api_url="devices/provision/pill",
            type="POST",
            body_data=json.dumps({
                "metadata": json.dumps({
                    "provisioned_by": self.current_user.email(),
                    "provisioned_at_utc": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    "remark": remark
                }),
                "public_key": public_key,
                "device_id": device_id
            }),
        )


def cleanup(blob_keys):
    blobstore.delete(blob_keys)


class PillKeyDecryptAPI(webapp2.RequestHandler):

    def initialize(self, request, response):
        super(PillKeyDecryptAPI, self).initialize(request, response)
        self.response.headers['Access-Control-Allow-Origin'] = '*'
        self.response.headers[
            'Access-Control-Allow-Methods'
        ] = 'OPTIONS, HEAD, GET, POST, PUT, DELETE'
        self.response.headers[
            'Access-Control-Allow-Headers'
        ] = 'Content-Type, Content-Range, Content-Disposition'

    def validate(self, file):
        if file['size'] < MIN_FILE_SIZE:
            file['error'] = 'File is too small'
        elif file['size'] > MAX_FILE_SIZE:
            file['error'] = 'File is too big'
        elif ALL_FILES_ACCEPTED is False and not ACCEPT_FILE_TYPES.match(file['type']):
            file['error'] = 'Filetype not allowed'
        else:
            return True
        return False

    def get_file_size(self, file):
        file.seek(0, 2)  # Seek to the end of the file
        size = file.tell()  # Get the position of EOF
        file.seek(0)  # Reset the file position to the beginning
        return size

    def write_blob(self, data, info):
        blob = files.blobstore.create(
            mime_type=info['type'],
            _blobinfo_uploaded_filename=info['name']
        )
        with files.open(blob, 'a') as f:
            f.write(data)
        files.finalize(blob)
        return files.blobstore.get_blob_key(blob)

    def decrypt(self, blobstore_key):
        factory_key = [0x0b, 0x53, 0x55, 0xfb, 0xe8, 0x69, 0x7d, 0x74, 0xf4, 0xe0, 0x45, 0x3c, 0x4a, 0xe7, 0x40, 0xc4]
        keystr = ''.join(format(x,'02x') for x in factory_key)
        binkey=binascii.a2b_hex(keystr)
        pills = []

        with blobstore.BlobReader(blobstore_key) as fr:
            fr.seek(8,0)
            nonce = bytearray(fr.read(8))
            noncestr = ''.join(format(x,'02x') for x in nonce)
            ctr = Counter.new(nbits=64, initial_value = 0,little_endian = True, prefix=binascii.a2b_hex(noncestr))
            c = AES.new(binkey, AES.MODE_CTR, counter = ctr)
            fr.seek(16,0)
            ciphertext = fr.read(308)
            output_binary = (c.decrypt(ciphertext))
            pill = display_info(output_binary)
            pills.append(pill)
        return pills[0]

    def handle_upload(self):
        results = []
        blob_keys = []
        for name, fieldStorage in self.request.POST.items():
            if type(fieldStorage) is unicode:
                continue
            result = {}
            result['name'] = re.sub(
                r'^.*\\',
                '',
                fieldStorage.filename
            )
            result['type'] = fieldStorage.type
            result['size'] = self.get_file_size(fieldStorage.file)
            if self.validate(result):
                blob_key = str(
                    self.write_blob(fieldStorage.value, result)
                )
                decrypted_info = self.decrypt(blob_key)
                result['pill_id'] = decrypted_info['pill_id']
                result['pill_key'] = decrypted_info['pill_key']
                blob_keys.append(blob_key)
                result['deleteType'] = 'DELETE'
                result['deleteUrl'] = self.request.path_url +\
                    '/?key=' + urllib.quote(blob_key, '')
                if (IMAGE_TYPES.match(result['type'])):
                    try:
                        result['url'] = images.get_serving_url(
                            blob_key,
                            secure_url=self.request.path_url.startswith(
                                'https'
                            )
                        )
                        result['thumbnailUrl'] = result['url'] +\
                            THUMBNAIL_MODIFICATOR
                    except:  # Could not get an image serving url
                        pass
                if not 'url' in result:
                    result['url'] = self.request.path_url +\
                        '/' + blob_key + '/' + urllib.quote(
                            result['name'].encode('utf-8'), '')
            results.append(result)
        deferred.defer(
            cleanup,
            blob_keys,
            _countdown=EXPIRATION_TIME
        )
        return results

    def options(self):
        pass

    def head(self):
        pass

    def get(self):
        self.redirect(WEBSITE)

    def post(self):
        if (self.request.get('_method') == 'DELETE'):
            return self.delete()
        result = {'files': self.handle_upload()}
        s = json.dumps(result, separators=(',', ':'))
        redirect = self.request.get('redirect')
        if redirect:
            return self.redirect(str(
                redirect.replace('%s', urllib.quote(s, ''), 1)
            ))
        if 'application/json' in self.request.headers.get('Accept'):
            self.response.headers['Content-Type'] = 'application/json'
        self.response.write(s)

    def delete(self):
        key = self.request.get('key') or ''
        blobstore.delete(key)
        s = json.dumps({key: True}, separators=(',', ':'))
        if 'application/json' in self.request.headers.get('Accept'):
            self.response.headers['Content-Type'] = 'application/json'
        self.response.write(s)


class PillProvisionAPI(blobstore_handlers.BlobstoreDownloadHandler):
    def get(self, key, filename):
        if not blobstore.get(key):
            self.error(333)
        else:
            # Prevent browsers from MIME-sniffing the content-type:
            self.response.headers['X-Content-Type-Options'] = 'nosniff'
            # Cache for the expiration time:
            self.response.headers['Cache-Control'] = 'public,max-age=%d' % EXPIRATION_TIME
            # Send the file forcing a download dialog:
            self.send_blob(key, save_as=filename, content_type='application/octet-stream')


def display_info(binary):
    pill_id = binascii.b2a_hex(binary[0:8]).upper()
    ble = binascii.b2a_hex(binary[8:16])
    aes_key = binascii.b2a_hex(binary[16:32]).upper()
    ficr = binascii.b2a_hex(binary[32:288])  # 256 bytes, 32 + 0x80 bytes offset, size = 16 bytes
    key= binascii.b2a_hex(binary[32+128:32+128+16])
    sha_1 = binascii.b2a_hex(binary[288:308])

    sha_stored = binary[288:308]
    sha_calculated = hashlib.sha1(binary[0:288]).digest()
    sha_match = sha_stored == sha_calculated
    if not sha_match:
        log.error("ID: {}".format(pill_id))
        log.error("BLE: {}".format(ble))
        log.error("AES: {}".format(aes_key))
        log.error("FICR: {}".format(ficr))
        log.error("HDWR KEY: {}".format(key))
        log.error("SHA1: {}".format(sha_1))
        log.error("SHA1-CALCULATED: {}".format(sha_calculated))
        log.error("Checksum Failed!")
        pill_id = None

    return {
       "pill_id": pill_id,
       "ble": ble,
       "pill_key": key,
       "sha_1": sha_1,
       "sha_match": sha_match
    }
