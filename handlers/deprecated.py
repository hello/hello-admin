import json
import time
import logging as log
import settings

from handlers.helpers import FirmwareRequestHandler, ProtectedRequestHandler
from handlers.helpers import ProtectedRequestHandler
from handlers.helpers import make_oauth2_service
from models.setup import AccessToken
from models.setup import AppInfo

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


class CreateTokenAPI(ProtectedRequestHandler):
    def get(self):
        """
        Get all tokens created
        """
        app_info_model = AppInfo.get_by_id(settings.ENVIRONMENT)
        log.info("Querying datastore for most recent AppInfo")

        if app_info_model is None:
            self.error(500)
            self.response.write("Missing AppInfo. Bailing.")
            return

        hello = make_oauth2_service(app_info_model)
        headers = {
            'Content-type': 'application/json',
            'Accept': 'application/json'
        }

        session = hello.get_session(app_info_model.access_token)
        resp = session.get('applications', headers=headers)
        self.response.write(resp.content)

    def post(self):
        """
        Create a token for a user requested for a specified app
        """
        username = self.request.get("username", default_value="x@sayhello.com")
        password = self.request.get("password", default_value="x")
        client_id = self.request.get('client_id', default_value="unknown")

        log.info("username: %s, password:%s, client_id:%s" % (username, password, client_id))

        app_info_model = AppInfo.get_by_id(settings.ENVIRONMENT)

        if app_info_model is None:
            self.error(500)
            self.response.write("Missing AppInfo. Bailing.")
            return

        # override here because we want to generate a token for a given app,
        # not necessarily the admin one
        app_info_model.client_id = client_id
        hello = make_oauth2_service(app_info_model)

        data = {
            "grant_type": "password",
            "client_id": app_info_model.client_id,
            "client_secret": '',
            "username": username,
            "password": password
        }

        resp = hello.get_raw_access_token(data=data)
        log.info(resp.url)

        try:
            json_data = json.loads(resp.content)
        except ValueError, e:
            log.error("Failed to decode JSON. Bailing")
            log.error("For username: %s" % username)
            log.error("Json was: %s" % resp.content)
            log.error("Error was: %s" % e)
            self.error(500)
            return
        log.warn(resp.content)
        if not isinstance(json_data, dict):
            log.error("json_data is not a dict. bailing.")
            log.error(resp.content)
            self.error(500)
            return

        if 'access_token' not in json_data:
            log.error("The key access_token was not found in the response")
            log.error(resp.content)
            self.error(500)
            return

        access_token = json_data['access_token']

        token = AccessToken(
            username=username,
            token=access_token,
            app=client_id
        )
        token.put()

        self.response.write(json.dumps({'access_token': access_token}))


class PreSleepAPI(ProtectedRequestHandler):
    def get(self):
        """
        Grab temperature
        - request input:
            sensor (required: one of ["humidity", "particulates", "temperature"])
            token (required for each user)
            resolution (required : week or day)
        """

        sensor = self.request.get('sensor', default_value='humidity')
        resolution = self.request.get('resolution', default_value='day')
        # timezone_offset = int(self.request.get('timezone_offset', default_value=8*3600*1000))
        # current_ts = int(time.time() * 1000) - timezone_offset
        current_ts = int(time.time() * 1000)
        impersonatee_token = self.request.get('impersonatee_token', default_value=None)

        self.hello_request(
            api_url="room/{}/{}".format(sensor, resolution),
            url_params={'from': current_ts},
            impersonatee_token=impersonatee_token,
            type="GET"
        )


class InactiveDevicesAPI(ProtectedRequestHandler):
    """
    Retrieve inactie device
    """
    def get(self):
        page = self.request.get('page', default_value=1)
        start = self.request.get('start', default_value=0)
        since = self.request.get('since', default_value=0)
        threshold = self.request.get('threshold', default_value=0)
        self.hello_request(
            api_url="devices/inactive",
            type="GET",
            url_params={
                'page': page,
                'start': start,
                'since': since,
                'threshold': threshold
            }
        )