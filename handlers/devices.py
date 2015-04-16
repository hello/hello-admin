import logging as log
import json
import settings

from handlers.helpers import ProtectedRequestHandler
from models.ext import RecentlyActiveDevicesStats


class DeviceAPI(ProtectedRequestHandler):
    """Retrieve devices list and their specs"""

    def get(self):
        email = self.request.get('email', default_value="")
        self.response.write(json.dumps({
            "senses": self.hello_request(
                api_url="devices/sense",
                type="GET",
                url_params={'email': email},
                app_info=settings.ADMIN_APP_INFO,
                raw_output=True
            ).data,
            "pills": self.hello_request(
                api_url="devices/pill",
                type="GET",
                url_params={'email': email},
                app_info=settings.ADMIN_APP_INFO,
                raw_output=True
            ).data
        }))

    def post(self):
        device_id = self.request.get('device_id', default_value="")
        device_type = self.request.get('device_type', default_value="")
        impersonatee_token = self.request.get('impersonatee_token', default_value="")
        log.debug("attempting to register {} {}".format(device_type, device_id))

        self.hello_request(
            api_url="devices/register/{}".format(device_type),
            type="POST",
            body_data=json.dumps({'{}_id'.format(device_type): device_id}),
            access_token=impersonatee_token,
            app_info=settings.ADMIN_APP_INFO
        )

    def put(self):
        device_id = self.request.get('device_id', default_value="")
        device_type = self.request.get('device_type', default_value="")
        impersonatee_token = self.request.get('impersonatee_token', default_value="")
        log.debug("attempting to unregister {} {}".format(device_type, device_id))

        if device_type == "sense":
            api_url = "devices/sense/{}/all".format(device_id)
        else:
            api_url = "devices/pill/{}".format(device_id)

        self.hello_request(
            api_url=api_url,
            type="DELETE",
            access_token=impersonatee_token,
        )


class DeviceOwnersAPI(ProtectedRequestHandler):
    """Retrieve owners of a device"""

    def get(self):
        device_id = self.request.get('device_id', default_value="")
        log.info("Getting accounts associated with device {}".format(device_id))
        self.hello_request(
            api_url="devices/{}/accounts".format(device_id),
            type="GET",
            filter_fields=['email'],
            app_info=settings.ADMIN_APP_INFO
        )

class DeviceInactiveAPI(ProtectedRequestHandler):
    """
    Retrieve inactie devices
    """
    def get(self):
        after = self.request.get('after', default_value="")
        before = self.request.get('before', default_value="")
        device_type = self.request.get('device_type', default_value="sense")
        self.hello_request(
            api_url="devices/inactive/{}".format(device_type),
            type="GET",
            url_params={
                'after': after,
                'before': before,
            },
            app_info=settings.ADMIN_APP_INFO
        )

class DeviceKeyStoreHint(ProtectedRequestHandler):
    """
    Retrieve hints for key store of a device
    """
    def get(self):
        device_id = self.request.get('device_id', default_value="")
        device_type = self.request.get('device_type', default_value="")
        self.hello_request(
            api_url="devices/key_store_hints/{}/{}".format(device_type, device_id),
            type="GET",
            app_info=settings.ADMIN_APP_INFO
        )

class ActiveDevicesHistoryAPI(ProtectedRequestHandler):
    """Retrieve recently active devices zcount from redis"""
    def get(self):
        output = {'data': [], 'error': ''}
        try:
            for daily_stats in RecentlyActiveDevicesStats.query_stats(limit=480):
                output['data'].append({
                    'senses_zcount': daily_stats.senses_zcount,
                    'pills_zcount': daily_stats.pills_zcount,
                    'created_at': int(daily_stats.created_at.strftime("%s"))
                })
        except Exception as e:
            log.error(e.message)

        self.response.write(json.dumps(output))

