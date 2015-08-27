import datetime
import json
import time

from google.appengine.api import namespace_manager
from google.appengine.ext import ndb

from core.handlers.base import BaseCron
from models.ext import RecentlyActiveDevicesStats, RecentlyActiveDevicesStats15Minutes, RecentlyActiveDevicesStatsDaily
import settings


class StoreRecentlyActiveDevicesStatsMinute(BaseCron):
    def get(self):
        zstats = self.hello_request(
            type="GET",
            api_url="devices/status_breakdown",
            raw_output=True,
            url_params={'start_ts': int(time.time()*1000) - 60*1000, 'end_ts': int(time.time()*1000)}
        ).data

        recently_active_devices_stats = RecentlyActiveDevicesStats(
            senses_zcount=zstats["senses_count"],
            pills_zcount=zstats["pills_count"]
        )

        recently_active_devices_stats.put()


class StoreRecentlyActiveDevicesStats15Minutes(BaseCron):
    def get(self):
        zstats = self.hello_request(
            type="GET",
            api_url="devices/status_breakdown",
            raw_output=True,
            url_params={'start_ts': int(time.time()*1000) - 15*60*1000, 'end_ts': int(time.time()*1000)}
        ).data

        recently_active_devices_stats = RecentlyActiveDevicesStats15Minutes(
            senses_zcount=zstats["senses_count"],
            pills_zcount=zstats["pills_count"]
        )

        recently_active_devices_stats.put()


class StoreRecentlyActiveDevicesStatsDaily(BaseCron):
    def get(self):
        zstats = self.hello_request(
            type="GET",
            api_url="devices/status_breakdown",
            raw_output=True,
            url_params={'start_ts': int(time.time()*1000) - 24*3600*1000, 'end_ts': int(time.time()*1000)}
        ).data

        recently_active_devices_stats = RecentlyActiveDevicesStatsDaily(
            senses_zcount=zstats["senses_count"],
            pills_zcount=zstats["pills_count"]
        )

        recently_active_devices_stats.put()


class ActiveDevicesHistoryPurge(BaseCron):
    def get(self):
        end_ts = datetime.datetime.now() - datetime.timedelta(days=settings.ACTIVE_DEVICES_HISTORY_KEEP_DAYS)
        keys = RecentlyActiveDevicesStats.query_keys_by_created(end_ts)
        output = {}

        try:
            if keys:
                ndb.delete_multi(keys=keys[:50])
                output['success'] = True
            else:
                output['success'] = False
                output['error'] = "No more to purge"
        except Exception as e:
            output['success'] = False
            output['error'] = e.message

        current_total = RecentlyActiveDevicesStats.query().count()
        output['total'] = current_total

        self.response.write(json.dumps(output))


class ActiveDevicesHistory15MinutesPurge(BaseCron):
    def persist_namespace(self):
        namespace_manager.set_namespace("production")
    def get(self):
        end_ts = datetime.datetime.now() - datetime.timedelta(days=settings.ACTIVE_DEVICES_HISTORY_KEEP_DAYS)
        keys = RecentlyActiveDevicesStats15Minutes.query_keys_by_created(end_ts)
        output = {}

        try:
            if keys:
                ndb.delete_multi(keys=keys[:50])
                output['success'] = True
            else:
                output['success'] = False
                output['error'] = "No more to purge"
        except Exception as e:
            output['success'] = False
            output['error'] = e.message

        current_total = RecentlyActiveDevicesStats15Minutes.query().count()
        output['total'] = current_total

        self.response.write(json.dumps(output))