import logging as log
import requests
from models.ext import ZendeskCredentials
from models.ext import ZendeskDailyStats
from handlers.helpers import BaseRequestHandler
from handlers.utils import display_error
from handlers.analysis import get_zendesk_stats


class ZendeskCronHandler(BaseRequestHandler):
    def get(self):
        output = {'data': []}
        info_query = ZendeskCredentials.query()
        results = info_query.fetch(1)

        if not results:
            self.error(500)

        zendesk_cred = results[0]
        tickets = []

        zen_api = "{}/api/v2/search.json?query=type:ticket%20".format(zendesk_cred.domain)

        end_date = "2014-11-17"
        start_date = "2014-11-16"
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
                print len(tickets)
                zen_response = requests.get(zen_response.json().get('next_page'), auth=zen_auth)
                if zen_response.ok:
                    tickets += zen_response.json().get('results', [])

            # tickets = sorted(tickets, key=lambda k: iso_to_utc_timestamp(k.get('created_at')))

            if not tickets:
                raise RuntimeError("There is no ticket for specified query")

            output['data'] = get_zendesk_stats(tickets)
            print
            log.info(output)
            print

            tickets_status = output['data']['total_breakdown']['status']
            zendesk_cron_stats = ZendeskDailyStats(
                ## id = "2014-11-12", Need to fig out
                new_tickets= tickets_status['new'],
                open_tickets= tickets_status['open'],
                solved_tickets= tickets_status['solved'],
                closed_tickets= tickets_status['closed'],
            )

            zendesk_cron_stats.put()

        except Exception as e:
            log.error('ERROR: {}'.format(display_error(e)))