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
from models.ext import ZendeskDailyStats
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
    def get_searchify_index(index):
        searchify_entity = settings.SEARCHIFY
        if not searchify_entity:
            raise RuntimeError("Missing AppInfo. Bailing.")
        return ApiClient(searchify_entity.api_client).get_index(index)

    def mass_purge(self, index, level=None, keep=700000):
        output = ResponseOutput()
        query = "text:{}".format(level.upper()) if level else "all:1"

        try:
            index.add_function(4, "doc.var[0]")
            index.delete_by_search(query=query, start=keep, scoring_function=4)
            output.set_status(204)
        except Exception as e:
            output.set_error(e.message)
            output.set_status(500)

        self.response.write(json.dumps(output))


class SensePurge(SearchifyPurgeHandler):
    def get(self):
        self.mass_purge(index=self.get_searchify_index(settings.SENSE_LOGS_INDEX),
                        keep=self.request.get("keep", 900000))


class ApplicationPurge(SearchifyPurgeHandler):
    def get(self):
        self.mass_purge(index=self.get_searchify_index(settings.APPLICATION_LOGS_INDEX),
                        level=self.request.get("level", "INFO"),
                        keep=self.request.get("keep", 900000))


class WorkersPurge(SearchifyPurgeHandler):
    def get(self):
        self.mass_purge(index=self.get_searchify_index(settings.WORKERS_LOGS_INDEX),
                        level=self.request.get("level", "INFO"),
                        keep=self.request.get("keep", 900000))


class SearchifyPurgeQueue(SearchifyPurgeHandler):
    def get(self):
        taskqueue.add(
            url='/cron/sense_purge',
            params={
                'keep': settings.SENSE_LOGS_KEEP
            },
            method="GET",
            queue_name="sense_purge"
        )

        for level in ['DEBUG', 'INFO', 'WARN', 'ERROR']:
            taskqueue.add(
                url='/cron/application_purge',
                params={
                    'level': '{}'.format(level),
                    'keep': settings.APPLICATION_LOGS_KEEP[level]
                },
                method="GET",
                queue_name="application_purge"
            )
            taskqueue.add(
                url='/cron/workers_purge',
                params={
                    'level': '{}'.format(level),
                    'keep': settings.WORKERS_LOGS_KEEP[level]
                },
                method="GET",
                queue_name="workers_purge"
            )


class GeckoboardPush(BaseRequestHandler):
    def get(self):
        devices_status_breakdown = self.hello_request(
            type="GET",
            api_url="devices/status_breakdown",
            raw_output=True,
            override_app_info=settings.ADMIN_APP_INFO,
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
