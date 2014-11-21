import json
import logging as log
import time
from handlers.utils import display_error
from handlers.helpers import BaseRequestHandler

class FirmwareAPIDecaprecated(BaseRequestHandler):
    '''Enables OTA firmware updates'''
    def post(self):
        session = self.authorize_session()
        device_id = self.request.get('device_id', default_value='')

        truncate = bool(self.request.get('truncate', default_value=False))
        
        # This is shortcut to not have to create two forms
        # It should probably be refactored once we have confirmed
        # that the current implementation works
        if truncate and device_id:
            req_url = "firmware/{}".format(device_id)
            response = session.delete(req_url, headers={'Content-Type' : 'application/json'})

            if response.status_code != 204:
                log.error(response.content)
                self.response.write(json.dumps(dict(error=response.content)))
            self.redirect('/firmware')
            return


        
        firmware_version = self.request.get('firmware_version', default_value='')
        s3_name = self.request.get('s3_name', default_value='')
        copy_to_serial_flash = self.request.get('copy_to_serial_flash', default_value=False)
        reset_application_processor = self.request.get('reset_application_processor', default_value=False)
        reset_network_processor = self.request.get('reset_network_processor', default_value=False)
        serial_flash_filename = self.request.get('serial_flash_filename', default_value='')
        serial_flash_path = self.request.get('serial_flash_path', default_value='')
        sd_card_filename = self.request.get('sd_card_filename', default_value='')
        sd_card_path = self.request.get('sd_card_path', default_value='')

        firmware_file = {
            's3_key' : s3_name,
            'copy_to_serial_flash' : bool(copy_to_serial_flash),
            'reset_network_processor' : bool(reset_application_processor),
            'reset_application_processor' : bool(reset_application_processor),
            'serial_flash_filename' : serial_flash_filename,
            'serial_flash_path' : serial_flash_path,
            'sd_card_filename' : sd_card_filename,
            'sd_card_path' : sd_card_path
        }

        req_url = "firmware/{}/{}".format(device_id, int(firmware_version))
        log.info(req_url)
        response = session.post(req_url, headers={'Content-Type' : 'application/json'}, data=json.dumps(firmware_file))

        if response.status_code != 204:
            log.error(response.content)
            self.response.write(json.dumps(dict(error=response.content)))
            return
        self.redirect('/firmware')


class FirmwareAPI(BaseRequestHandler):
    '''Enables OTA firmware updates'''

    def get(self):
        output = {'data': [], 'error': ''}
        try:
            if source:
                req_url = "firmware/source/{}".format(source)
            elif device_id:
                req_url = "firmware/{}/0".format(device_id)
            else:
                raise RuntimeError("Invalid GET request")

            response = session.get(req_url, headers={'Content-Type' : 'application/json'})
            if response.status_code == 200:
                output['data'] = response.json()
            else:
                raise RuntimeError('{}: fail to retrieve firmware for {}'.format(response.status_code, source or device_id))

        except Exception as e:
            output['error'] = display_error(e)
            log.error('ERROR: {}'.format(display_error(e)))

        self.response.write(json.dumps(output))

    def put(self):
        output = {'data': [], 'error': '', 'status': 0}
        session = self.authorize_session()
        req = json.loads(self.request.body)
        device_id = req.get('device_id', None)
        firmware_version = req.get('firmware_version', None)

        try:
            if None in (device_id, firmware_version):
                raise RuntimeError('invalid put request')

            req_url = "firmware/{}/{}".format(device_id, firmware_version)
            response = session.put(req_url,
                                   headers={'Content-Type' : 'application/json'},
                                   data=json.dumps(req.get('update_data')))
            if response.status_code not in [200, 204]:
                raise RuntimeError('{}: fail to update firmware {} for device {}'.format(response.status_code, firmware_version, device_id))
            output['status'] = response.status_code
        except Exception as e:
            output['error'] = display_error(e)
            log.error('ERROR: {}'.format(display_error(e)))

        self.response.write(json.dumps(output))

    def post(self):
        output = {'data': [], 'error': '', 'status': 0}
        session = self.authorize_session()
        req = json.loads(self.request.body)
        device_id = req.get('device_id', None)

        try:
            if not device_id:
                raise RuntimeError('Invalid delete request!')

            req_url = "firmware/{}".format(device_id)
            response = session.delete(req_url,
                                      headers={'Content-Type' : 'application/json'},
                                      data=json.dumps(req))

            if response.status_code != 204:
                log.error(response.content)
                raise RuntimeError('{}: fail to delete firmware device {}'.format(response.status_code, device_id))
            output['status'] = response.status_code
        except Exception as e:
            output['error'] = display_error(e)
            log.error('ERROR: {}'.format(display_error(e)))

        self.response.write(json.dumps(output))
