import logging as log
import json
from google.appengine.api import namespace_manager
import settings

from handlers.helpers import ProtectedRequestHandler
from models.ext import RecentlyActiveDevicesStats
from models.ext import RecentlyActiveDevicesStatsDaily
from models.ext import RecentlyActiveDevicesStats15Minutes


class DeviceAPI(ProtectedRequestHandler):
    """Retrieve devices list and their specs"""

    def get(self):
        email = self.request.get('email', default_value="")
        self.response.write(json.dumps({
            "senses": self.hello_request(
                api_url="devices/sense",
                type="GET",
                url_params={'email': email},
                raw_output=True
            ).data,
            "pills": self.hello_request(
                api_url="devices/pill",
                type="GET",
                url_params={'email': email},
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

        self.hello_request(
            api_url="devices/register/{}".format(device_type),
            type="POST",
            body_data=json.dumps(post_data),
        )
        self.send_to_slack_admin_logs_channel("@long: {} helped {} pair {} {}".format(self.current_user_email, email, device_type, device_id))


    def put(self):
        device_id = self.request.get('device_id', default_value="")
        device_type = self.request.get('device_type', default_value="")
        email = self.request.get('email', default_value="")
        unlink_all= self.request.get("unlink_all", default_value="false")

        self.hello_request(
            api_url="devices/{}/{}/{}".format(device_type, email, device_id),
            type="DELETE",
            url_params={"unlink_all": unlink_all}
        )
        self.send_to_slack_admin_logs_channel("@long: {} helped {} unpair {} {}".format(self.current_user_email, email, device_type, device_id))

class DeviceByEmailAPI(ProtectedRequestHandler):
    def get(self):
        self.hello_request(
            api_url="devices/{}".format(self.request.get("device_type")),
            type="GET",
            url_params={'email': self.request.get("email")},
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
                'limit': 10000
            },
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
        )

class ActiveDevicesMinuteHistoryAPI(ProtectedRequestHandler):
    """Retrieve recently active devices (seen last minute) zcount from redis"""
    def persist_namespace(self):
        namespace_manager.set_namespace("production")

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

class ActiveDevices15MinutesHistoryAPI(ProtectedRequestHandler):
    """Retrieve recently active devices (seen last 15 minutes) zcount from redis"""
    def persist_namespace(self):
        namespace_manager.set_namespace("production")

    def get(self):
        output = {'data': [], 'error': ''}
        try:
            for daily_stats in RecentlyActiveDevicesStats15Minutes.query_stats(limit=2880):
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
    def persist_namespace(self):
        namespace_manager.set_namespace("production")

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


class SenseColorAPI(ProtectedRequestHandler):
    def get(self):
        self.hello_request(
            api_url="devices/color/{}".format(self.request.get("sense_id")),
            type="GET",
        )

    def put(self):
        self.hello_request(
            api_url="devices/color/{}/{}".format(self.request.get("sense_id"), self.request.get("color")),
            type="PUT",
        )

class ColorlessSensesAPI(ProtectedRequestHandler):
    def get(self):
        self.hello_request(
            api_url="devices/color/missing",
            type="GET",
        )


class SenseBlackListAPI(ProtectedRequestHandler):
    def get(self):
        self.hello_request(
            api_url="devices/sense_black_list",
            type="GET",
        )

    def put(self):
        self.hello_request(
            api_url="devices/sense_black_list",
            type="PUT",
            body_data=self.request.body
        )

    def post(self):
        current_sense_black_list = self.hello_request(
            api_url="devices/sense_black_list",
            type="GET",
            raw_output=True
        ).data

        new_sense_black_list = json.loads(self.request.body)
        aggregate_black_list = current_sense_black_list + new_sense_black_list

        self.hello_request(
            api_url="devices/sense_black_list",
            type="PUT",
            body_data=json.dumps(aggregate_black_list)
        )
