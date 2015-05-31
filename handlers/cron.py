import datetime
import time
import json
import logging as log
import requests
import settings
from handlers.analysis import get_zendesk_stats
from handlers.helpers import BaseRequestHandler
from handlers.helpers import ResponseOutput
from handlers.utils import display_error
from handlers.utils import get_current_pacific_datetime
from handlers.utils import epoch_to_human
from models.ext import ZendeskDailyStats
from models.ext import RecentlyActiveDevicesStats
from models.ext import RecentlyActiveDevicesStatsDaily
from models.ext import RecentlyActiveDevicesStats15Minutes
from models.ext import SearchifyStats
from models.ext import SearchifyPurgeStats
from indextank import ApiClient
from google.appengine.api import taskqueue
from google.appengine.ext import ndb

class ZendeskCronHandler(BaseRequestHandler):
    def get(self):
        output = {'data': []}
        zendesk_cred = settings.ZENDESK
        tickets = []

        zen_api = "{}/api/v2/search.json?query=type:ticket%20".format(zendesk_cred.domain)

        start_date = (get_current_pacific_datetime() - datetime.timedelta(days=2)).strftime('%Y-%m-%d')
        date_type = "created"

        search_url = zen_api + "{}>{}".format(date_type, start_date)
        zen_auth = (zendesk_cred.email_account + '/token', zendesk_cred.api_token)
        try:
            zen_response = requests.get(search_url, auth=zen_auth)
            if zen_response.ok:
                tickets += zen_response.json().get('results', [])
            else:
                raise RuntimeError("Fail to retrieve tickets")

            # Keep querying on as long as paginating is possible
            while zen_response.json().get('next_page') is not None:
                zen_response = requests.get(zen_response.json().get('next_page'), auth=zen_auth)
                if zen_response.ok:
                    tickets += zen_response.json().get('results', [])

            output['data'] = get_zendesk_stats(tickets)
            log.info(output)

            tickets_status = output['data']['total_breakdown']['status']
            zendesk_cron_stats = ZendeskDailyStats(
                new_tickets=tickets_status['new'],
                open_tickets=tickets_status['open'],
                pending_tickets=tickets_status['pending'],
                solved_tickets=tickets_status['solved'],
                closed_tickets=tickets_status['closed']
            )

            zendesk_cron_stats.put()

        except Exception as e:
            log.error('ERROR: {}'.format(display_error(e)))


class GeckoboardPush(BaseRequestHandler):
    @staticmethod
    def push_to_gecko(count, device_type, widget_id):
        post_data = {
            "api_key": settings.GECKOBOARD.api_key,
            "data": {
                "item": [
                    {
                        "value": count,
                        "text": device_type
                    },
                    ]
            }
        }

        widget_url = "https://push.geckoboard.com/v1/send/" + widget_id
        gecko_response = requests.post(widget_url, json.dumps(post_data))
        return {"success": gecko_response.ok}


class DevicesCountPush(GeckoboardPush):
    def get(self):
        devices_status_breakdown = self.hello_request(
            type="GET",
            api_url="devices/status_breakdown",
            raw_output=True,
            app_info=settings.ADMIN_APP_INFO,
            url_params={'start_ts': int(time.time()*1000) - 24*3600*1000, 'end_ts': int(time.time()*1000)}
        ).data

        if settings.GECKOBOARD is None:
            self.error("missing Geckoboard credentials!")
        senses_count = devices_status_breakdown.get('senses_count', -1)
        pills_count = devices_status_breakdown.get('pills_count', -1)

        self.response.write(json.dumps({
            "sense": self.push_to_gecko(senses_count, "senses", settings.GECKOBOARD.senses_widget_id),
            "pill": self.push_to_gecko(pills_count, "pills", settings.GECKOBOARD.pills_widget_id)
        }))


class AlarmsCountPush(GeckoboardPush):
    def get(self):
        # if settings.GECKOBOARD is None or settings.GECKOBOARD.alarms_widget_id:
        #     self.error("missing Geckoboard credentials!")

        alarm_pattern = "ALARM RINGING"
        alarms_count = -1

        now_date = datetime.datetime.now().strftime("%Y-%m-%d")
        index = ApiClient(settings.SEARCHIFY.api_client).get_index(settings.SENSE_LOGS_INDEX_PREFIX + now_date)

        try:
            alarms_count = index.search(query=alarm_pattern)['matches']

        except Exception as e:
            self.error(e.message)

        self.response.write(json.dumps({
            # "alarms": self.push_to_gecko(alarms_count, "alarms", settings.GECKOBOARD.alarms_widget_id),
            "alarms": self.push_to_gecko(alarms_count, "alarms", "125660-3c3cfc26-67e6-4fbf-8ccd-0039c641fda3"),
            }))


class WavesCountPush(GeckoboardPush):
    def get(self):
        # if settings.GECKOBOARD is None or settings.GECKOBOARD.waves_widget_id:
        #     self.error("missing Geckoboard credentials!")

        wave_pattern = "Gesture: WAVE"
        waves_count = -1

        index = ApiClient(settings.SEARCHIFY.api_client).get_index(settings.SENSE_LOGS_INDEX_MARCH)

        try:
            results = index.search(query=wave_pattern, docvar_filters={0:[[time.time() - 24*3600, None]]}, length=5000, fetch_fields=['text'])['results']
            waves_count =  sum([i['text'].count(wave_pattern) for i in results])

        except Exception as e:
            self.error(e.message)

        self.response.write(json.dumps({
            # "waves": self.push_to_gecko(waves_count, "waves", settings.GECKOBOARD.waves_widget_id),
            "waves": self.push_to_gecko(waves_count, "waves on old firmware", "125660-e8d0841b-6655-40f9-9b88-4cdef30590b6"),
            }))


class HoldsCountPush(GeckoboardPush):
    def get(self):
        # if settings.GECKOBOARD is None or settings.GECKOBOARD.holds_widget_id:
        #     self.error("missing Geckoboard credentials!")

        hold_pattern = "Gesture: HOLD"
        holds_count = -1

        index = ApiClient(settings.SEARCHIFY.api_client).get_index(settings.SENSE_LOGS_INDEX_MARCH)

        try:
            results = index.search(query=hold_pattern, docvar_filters={0:[[time.time() - 24*3600, None]]}, length=5000, fetch_fields=['text'])['results']
            holds_count =  sum([i['text'].count(hold_pattern) for i in results])

        except Exception as e:
            self.error(e.message)

        self.response.write(json.dumps({
            # "holds": self.push_to_gecko(holds_count, "holds", settings.GECKOBOARD.holds_widget_id),
            "holds": self.push_to_gecko(holds_count, "holds on old firmware", "125660-2442ccde-be68-4c8a-b3d5-0315bba368db"),
            }))


class StoreRecentlyActiveDevicesStatsMinute(BaseRequestHandler):
    def get(self):
        zstats = self.hello_request(
            type="GET",
            api_url="devices/status_breakdown",
            raw_output=True,
            app_info=settings.ADMIN_APP_INFO,
            url_params={'start_ts': int(time.time()*1000) - 60*1000, 'end_ts': int(time.time()*1000)}
        ).data

        recently_active_devices_stats = RecentlyActiveDevicesStats(
            senses_zcount=zstats["senses_count"],
            pills_zcount=zstats["pills_count"]
        )

        recently_active_devices_stats.put()


class StoreRecentlyActiveDevicesStats15Minutes(BaseRequestHandler):
    def get(self):
        zstats = self.hello_request(
            type="GET",
            api_url="devices/status_breakdown",
            raw_output=True,
            app_info=settings.ADMIN_APP_INFO,
            url_params={'start_ts': int(time.time()*1000) - 15*60*1000, 'end_ts': int(time.time()*1000)}
        ).data

        recently_active_devices_stats = RecentlyActiveDevicesStats15Minutes(
            senses_zcount=zstats["senses_count"],
            pills_zcount=zstats["pills_count"]
        )

        recently_active_devices_stats.put()


class StoreRecentlyActiveDevicesStatsDaily(BaseRequestHandler):
    def get(self):
        zstats = self.hello_request(
            type="GET",
            api_url="devices/status_breakdown",
            raw_output=True,
            app_info=settings.ADMIN_APP_INFO,
            url_params={'start_ts': int(time.time()*1000) - 24*3600*1000, 'end_ts': int(time.time()*1000)}
        ).data

        recently_active_devices_stats = RecentlyActiveDevicesStatsDaily(
            senses_zcount=zstats["senses_count"],
            pills_zcount=zstats["pills_count"]
        )

        recently_active_devices_stats.put()



class ActiveDevicesHistoryPurge(BaseRequestHandler):
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


class ActiveDevicesHistory15MinutesPurge(BaseRequestHandler):
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



