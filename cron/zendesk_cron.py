import datetime
import logging as log
import requests
from handlers.helpers import BaseCron
from handlers.utils import get_current_pacific_datetime, get_zendesk_stats, display_error
from models.ext import ZendeskDailyStats


class ZendeskCron(BaseCron):
    def get(self):
        output = {'data': []}
        zendesk_cred = self.zendesk_credentials
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