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
from indextank import ApiClient

from google.appengine.api import taskqueue
class ZendeskCronHandler(BaseRequestHandler):
    def get(self):
        output = {'data': []}
        zendesk_cred = settings.ZENDESK
        tickets = []

        zen_api = "{}/api/v2/search.json?query=type:ticket%20".format(zendesk_cred.domain)

        end_date = (get_current_pacific_datetime()).strftime('%Y-%m-%d')
        start_date = (get_current_pacific_datetime() - datetime.timedelta(days=1)).strftime('%Y-%m-%d')
        date_type = "created"

        search_url = zen_api + "{}>{}+{}<{}".format(date_type, start_date, date_type, end_date)

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

            # tickets = sorted(tickets, key=lambda k: iso_to_utc_timestamp(k.get('created_at')))

            if not tickets:
                raise RuntimeError("There is no ticket for specified query")

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


class SearchifyPurgeHandler(BaseRequestHandler):

    @staticmethod
    def normalize_epoch(ts, index_name):
        if "sense" in index_name:
            return ts
        return 1000*int(ts)

    @staticmethod
    def get_searchify_index(index_name):
        searchify_entity = settings.SEARCHIFY
        if not searchify_entity:
            raise RuntimeError("Missing AppInfo. Bailing.")
        return ApiClient(searchify_entity.api_client).get_index(index_name)

    def mass_purge_by_keep_size(self, index, level=None, keep_size=700000):
        output = ResponseOutput()
        query = "text:{}".format(level.upper()) if level else "all:1"
        current_size = index.search(query=query)['matches']

        if current_size > int(keep_size):
            try:
                index.add_function(4, "doc.var[0]")
                index.delete_by_search(query=query, start=int(keep_size), scoring_function=4)
                output.set_status(204)
            except Exception as e:
                output.set_error(e.message)
                output.set_status(500)
        else:
            output.set_error("No need to purge since current size is {} while keep size is {}".format(current_size, keep_size))
            output.set_status(400)

        self.response.write(output.get_serialized_output())

    def mass_purge_by_keep_days(self, index_name, keep_days=30, level=''):
        output = ResponseOutput()
        query = "text:{}".format(level.upper()) if level else "all:1"
        index = self.get_searchify_index(index_name)
        now = time.time()
        try:
            delete_query_params = {}
            start_ts = None
            end_ts = 0
            keep_days = int(keep_days)
            purge_size = settings.SEARCHIFY_PURGE_CAP_SIZE

            while purge_size >= settings.SEARCHIFY_PURGE_CAP_SIZE:  # increase keep_days to lower delete size
                end_ts = self.normalize_epoch(now - keep_days * 24 * 3600, index_name)
                delete_query_params = {'query': query, 'docvar_filters': {0: [[start_ts, end_ts]]}}
                purge_size = index.search(**delete_query_params)['matches']
                keep_days += 0.25

            if purge_size > 0 and end_ts > 0 and delete_query_params != {}:
                log.info("About to purge {} documents from index {} over {} days, "
                         "i.e. before {}".format(purge_size, index_name, keep_days, epoch_to_human(end_ts)))

                index.delete_by_search(**delete_query_params)

                message_text = "`{}-{}`: purged `{}` documents over {} days, " \
                               "i.e. before {}".format(index_name, level, purge_size, keep_days-0.25, epoch_to_human(end_ts))

            else:
                message_text = "`{}-{}`: No need to purge - no document older " \
                               "than {} days".format(index_name, level, keep_days-0.25)
                log.info(message_text)

            self.send_to_slack_searchify_channel(message_text)



            output.set_data({
                "purge_size": purge_size,
                "index_name": index_name,
                "level": level,
                "keep_days": int(keep_days),
                "end_ts": epoch_to_human(end_ts)
            })
            output.set_status(204)
        except Exception as e:
            output.set_error(e.message)
            output.set_status(500)
        self.response.write(output.get_serialized_output())

class SensePurge(SearchifyPurgeHandler):
    def get(self):
        self.mass_purge_by_keep_days(index_name=settings.SENSE_LOGS_INDEX,
                                     keep_days=self.request.get("keep_days", 30))


class ApplicationPurge(SearchifyPurgeHandler):
    def get(self):
        self.mass_purge_by_keep_days(index_name=settings.APPLICATION_LOGS_INDEX,
                                     keep_days=self.request.get("keep_days", 30),
                                     level=self.request.get("level", "INFO"))

class WorkersPurge(SearchifyPurgeHandler):
    def get(self):
        self.mass_purge_by_keep_days(index_name=settings.WORKERS_LOGS_INDEX,
                                     keep_days=self.request.get("keep_days", 30),
                                     level=self.request.get("level", "INFO"))


class SearchifyPurgeQueue(SearchifyPurgeHandler):
    def get(self):
        taskqueue.add(
            url='/cron/sense_purge',
            params={
                'keep_days': settings.SEARCHIFY_LOGS_KEEP_DAYS[settings.SENSE_LOGS_INDEX]
            },
            method="GET",
            queue_name="sense-purge"
        )

        for level in ['DEBUG', 'INFO', 'WARN', 'ERROR']:
            taskqueue.add(
                url='/cron/application_purge',
                params={
                    'level': '{}'.format(level),
                    'keep_days': settings.SEARCHIFY_LOGS_KEEP_DAYS[settings.APPLICATION_LOGS_INDEX][level.upper()]
                },
                method="GET",
                queue_name="application-purge"
            )
            taskqueue.add(
                url='/cron/workers_purge',
                params={
                    'level': '{}'.format(level),
                    'keep_days': settings.SEARCHIFY_LOGS_KEEP_DAYS[settings.WORKERS_LOGS_INDEX][level.upper()]
                },
                method="GET",
                queue_name="workers-purge"
            )


class GeckoboardPush(BaseRequestHandler):
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


class StoreRecentlyActiveDevicesStats(BaseRequestHandler):
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




