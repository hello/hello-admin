import logging as log
import json
import settings

from handlers.helpers import ProtectedRequestHandler
from models.ext import RecentlyActiveDevicesStats
from models.ext import RecentlyActiveDevicesStatsDaily


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
        email = self.request.get('email', default_value="")
        timezone = self.request.get('timezone', default_value="")

        post_data = {
            '{}_id'.format(device_type): device_id,
            'email': email
        }

        if device_type == "sense":
            post_data['timezone'] = timezone

        print post_data

        self.hello_request(
            api_url="devices/register/{}".format(device_type),
            type="POST",
            body_data=json.dumps(post_data),
            app_info=settings.ADMIN_APP_INFO
        )

    def put(self):
        device_id = self.request.get('device_id', default_value="")
        device_type = self.request.get('device_type', default_value="")
        email = self.request.get('email', default_value="")

        self.hello_request(
            api_url="devices/{}/{}/{}".format(device_type, email, device_id),
            type="DELETE",
            app_info=settings.ADMIN_APP_INFO
        )


class DeviceByEmailAPI(ProtectedRequestHandler):
    def get(self):
        self.hello_request(
            api_url="devices/{}".format(self.request.get("device_type")),
            type="GET",
            url_params={'email': self.request.get("email")},
            app_info=settings.ADMIN_APP_INFO,
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

class ActiveDevicesMinuteHistoryAPI(ProtectedRequestHandler):
    """Retrieve recently active devices (seen last minute) zcount from redis"""
    def get(self):
        output = {'data': [], 'error': ''}
        try:
            for daily_stats in RecentlyActiveDevicesStats.query_stats(limit=2880):
                output['data'].append({
                    'senses_zcount': daily_stats.senses_zcount,
                    'pills_zcount': daily_stats.pills_zcount,
                    'created_at': int(daily_stats.created_at.strftime("%s"))
                })
        except Exception as e:
            log.error(e.message)

        self.response.write(json.dumps(output))


class ActiveDevicesDailyHistoryAPI(ProtectedRequestHandler):
    """Retrieve recently active devices (seen last 24 hours) zcount from redis"""
    def get(self):
        output = {'data': [], 'error': ''}
        try:
            for daily_stats in RecentlyActiveDevicesStatsDaily.query_stats(limit=2880):
                output['data'].append({
                    'senses_zcount': daily_stats.senses_zcount,
                    'pills_zcount': daily_stats.pills_zcount,
                    'created_at': int(daily_stats.created_at.strftime("%s"))
                })
        except Exception as e:
            log.error(e.message)

        self.response.write(json.dumps(output))

