from handlers.helpers import FirmwareRequestHandler

class FirmwareAPIDeprecated(FirmwareRequestHandler):
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