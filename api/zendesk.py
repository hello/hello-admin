import json

from google.appengine.api import namespace_manager
import requests

from core.models.response import ResponseOutput
from core.handlers.base import ProtectedRequestHandler
from core.utils.zendesk import get_zendesk_stats
from core.utils.common import display_error
from models.ext import ZendeskDailyStats


class ZendeskAPI(ProtectedRequestHandler):
    def get_tickets(self, page_limit=100000):
        """
        Grab tickets filed by a customer
        - input: user email (required)
        - auth params: domain, email_account, api_token (required by Zendesk)
        """
        output = ResponseOutput()
        user_email = self.request.get('email')

        zendesk_cred = self.zendesk_credentials
        if not zendesk_cred:
            self.error(500)

        tickets = []
        search_url = "{}/api/v2/search.json?query=type:ticket%20requester:{}&sort_by=created_at&sort_order=desc".format(zendesk_cred.domain, user_email)
        zen_auth = (zendesk_cred.email_account + '/token', zendesk_cred.api_token)

        try:
            if not user_email:
                raise RuntimeError("Missing input: user email")
            zen_response = requests.get(search_url, auth=zen_auth)

            ticket_count = 0
            if zen_response.ok:
                tickets += zen_response.json().get('results', [])
                ticket_count = zen_response.json().get('count', 0)

            # Keep querying on as long as paginating is possible
            page_count = 1
            while zen_response.json().get('next_page') is not None and page_count < page_limit:
                zen_response = requests.get(zen_response.json().get('next_page'), auth=zen_auth)
                if zen_response.ok:
                    tickets += zen_response.json().get('results', [])
                page_count += 1

            output.set_data({'count': ticket_count, 'tickets': tickets})
            output.set_status(200)

        except Exception as e:
            output.set_error(e.message)
            output.set_status(500)

        self.response.write(output.get_serialized_output())

    def get(self):
        self.get_tickets(1)

class ZendeskStatsAPI(ProtectedRequestHandler):
    def persist_namespace(self):
        namespace_manager.set_namespace("production")
    def get(self):
        output = {'data': {}, 'error': ''}
        start_date = self.request.get('start_date')  ## yyyy-mm-dd
        end_date = self.request.get('end_date')  ## yyyy-mm-dd
        date_type = self.request.get('date_type', default_value="created")

        zendesk_cred = self.zendesk_credentials
        if not zendesk_cred:
            self.error(500)

        tickets = []

        zen_api = "{}/api/v2/search.json?query=type:ticket%20".format(zendesk_cred.domain)

        if start_date and end_date:
            search_url = zen_api + "{}>{}+{}<{}".format(date_type, start_date, date_type, end_date)
        elif start_date:
            search_url = zen_api + "{}>{}".format(date_type, start_date)
        elif end_date:
            search_url = zen_api + "{}<{}".format(date_type, end_date)
        else:
            search_url = zen_api + "{}".format(date_type)

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

        except Exception as e:
            output['error'] = display_error(e)

        self.response.write(json.dumps(output))


class ZendeskHistoryAPI(ProtectedRequestHandler):
    def persist_namespace(self):
        namespace_manager.set_namespace("production")
    def get(self):
        output = {'data': [], 'error': ''}
        try:
            for daily_stats in ZendeskDailyStats.query_stats():
                output['data'].append({
                    'new_tickets': daily_stats.new_tickets,
                    'open_tickets': daily_stats.open_tickets,
                    'solved_tickets': daily_stats.solved_tickets,
                    'closed_tickets': daily_stats.closed_tickets,
                    'pending_tickets': daily_stats.pending_tickets,
                    'created_at': int(daily_stats.created_at.strftime("%s"))
                })
        except Exception as e:
            output['error'] = display_error(e)

        self.response.write(json.dumps(output))

class ZendeskNowAPI(ProtectedRequestHandler):
    def get(self):
        output = {'data': {'status': {}, 'recipient': {}}, 'error': ''}

        zendesk_cred = self.zendesk_credentials
        if not zendesk_cred:
            self.error(500)

        zen_auth = (zendesk_cred.email_account + '/token', zendesk_cred.api_token)
        try:
            for ticket_type in ['new', 'open', 'pending', 'solved', 'closed']:
                zen_url = "{}/api/v2/search.json?query=type:ticket%20status:{}".format(zendesk_cred.domain, ticket_type)
                zen_response = requests.get(zen_url, auth=zen_auth)
                if zen_response.ok:
                    output['data']['status'].update({ticket_type: zen_response.json()['count']})
            for ticket_recipient in ['support@helloinc.zendesk.com', 'support@hello.is', 'contact@hello.is', 'chat', 'web_form']:
                zen_url = "{}/api/v2/search.json?query=type:ticket%20via:{}".format(zendesk_cred.domain, ticket_recipient)
                zen_response = requests.get(zen_url, auth=zen_auth)
                if zen_response.ok:
                    output['data']['recipient'].update({ticket_recipient or 'unknown_recipient': zen_response.json()['count']})
        except Exception as e:
            output['error'] += display_error(e)

        self.response.write(json.dumps(output))
