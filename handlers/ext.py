import json
import logging as log
import requests
from models.ext import ZendeskCredentials
from handlers.helpers import BaseRequestHandler
from handlers.utils import display_error
from utils import iso_to_utc_timestamp
from handlers.analysis import get_zendesk_stats

class ZendeskAPI(BaseRequestHandler):
    def get(self):
        """
        Grab tickets filed by a customer
        - input: user email (required)
        - auth params: domain, email_account, api_token (required by Zendesk)
        """
        output = {'data': [], 'error': ''}
        user_email = self.request.get('email')

        try:
            if not user_email:
                raise RuntimeError("Missing input: user email");

            info_query = ZendeskCredentials.query()
            results = info_query.fetch(1)

            if not results:
                self.error(500)
                raise RuntimeError("Missing AppInfo. Bailing.")

            zendesk_cred = results[0]
            tickets = []

            search_url = "{}/api/v2/search.json?query=type:ticket%20requester:{}".format(zendesk_cred.domain, user_email)

            zen_auth = (zendesk_cred.email_account + '/token', zendesk_cred.api_token)
            zen_response = requests.get(search_url, auth=zen_auth)

            if zen_response.ok:
                tickets += zen_response.json().get('results', [])

            # Keep querying on as long as paginating is possible
            while zen_response.json().get('next_page') is not None:
                zen_response = requests.get(zen_response.json().get('next_page'), auth=zen_auth)
                if zen_response.ok:
                    tickets += zen_response.json().get('results', [])

            tickets = sorted(tickets, key=lambda k: iso_to_utc_timestamp(k.get('created_at')))

            if not tickets:
                raise RuntimeError("fail to retrieve {}'s tickets")
            output['data'] = tickets

        except Exception as e:
            output['error'] = display_error(e)
            log.error('ERROR: {}'.format(display_error(e)))

        self.response.write(json.dumps(output))


class ZendeskStatsAPI(BaseRequestHandler):
    def get(self):
        """
        Grab tickets filed by a customer
        - input: user email (required)
        - auth params: domain, email_account, api_token (required by Zendesk)
        """
        output = {'data': {}, 'error': ''}
        start_date = self.request.get('start_date')  ## yyyy-mm-dd
        end_date = self.request.get('end_date')  ## yyyy-mm-dd
        date_type = self.request.get('date_type', default_value="created")

        try:
            info_query = ZendeskCredentials.query()
            results = info_query.fetch(1)

            if not results:
                self.error(500)
                raise RuntimeError("Missing AppInfo. Bailing.")

            zendesk_cred = results[0]
            tickets = []

            zen_api = "{}/api/v2/search.json?query=type:ticket%20".format(zendesk_cred.domain)

            if start_date and end_date:
                search_url = zen_api + "{}>{}+{}<{}".format(date_type, start_date, date_type, end_date)
            elif start_date:
                search_url = zen_api + "{}>{}".format(date_type, start_date)
            elif end_date:
                search_url =  zen_api + "{}<{}".format(date_type, end_date)
            else:
                search_url =  zen_api + "{}".format(date_type)

            zen_auth = (zendesk_cred.email_account + '/token', zendesk_cred.api_token)
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

        except Exception as e:
            output['error'] = display_error(e)
            log.error('ERROR: {}'.format(display_error(e)))

        self.response.write(json.dumps(output))
