import json
import logging as log
import requests
from models.ext import ZendeskCredentials
from handlers.helpers import BaseRequestHandler
from handlers.utils import display_error


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
            info_query = ZendeskCredentials.query()
            results = info_query.fetch(1)

            if not results:
                self.error(500)
                self.response.write("Missing AppInfo. Bailing.")
                return

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

            if not tickets:
                raise RuntimeError("fail to retrieve {}'s tickets")
            output['data'] = tickets

        except Exception as e:
            output['error'] = display_error(e)
            log.error('ERROR: {}'.format(display_error(e)))

        self.response.write(json.dumps(output))

