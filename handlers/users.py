import os
import json
import time

import jinja2
import requests

from utils import iso_to_utc_timestamp
from handlers.helpers import CustomerExperienceRequestHandler
from handlers.helpers import ProtectedRequestHandler


JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True
)


class OmniSearchAPI(ProtectedRequestHandler):

    @property
    def omni_input(self):
        return self.request.get('omni_input', default_value="")

    def query_by_exact_email_or_id(self):
        return self.hello_request(
            api_url="account",
            type="GET",
            url_params={'id': int(self.omni_input)} if self.omni_input.isdigit() else {'email': self.omni_input},
            raw_output=True
        )

    def query_by_email_or_name_partials(self):
        return self.hello_request(
            api_url="account/partial",
            type="GET",
            url_params={'email': self.omni_input} if '@' in self.omni_input else {'name': self.omni_input},
            raw_output=True
        )

    def query_by_device_id(self):
        return self.hello_request(
            api_url="devices/{}/accounts".format(self.omni_input),
            type="GET",
            raw_output=True
        )

    def get_devices_info_by_email(self, email):
        senses = self.hello_request(
            api_url="devices/sense",
            type="GET",
            url_params={'email': email},
            raw_output=True
        ).data
        pills = self.hello_request(
            api_url="devices/pill",
            type="GET",
            url_params={'email': email},
            raw_output=True
        ).data

        senses_info = []
        pills_info = []
        for s in senses:
            pair = s.get('device_account_pair', {}) or {}
            status = s.get('device_status', {}) or {}
            if pair:
                state = "NORMAL"
                status['deviceId'] = pair.get("externalDeviceId", status.get('deviceId', ""))
            elif status and status.get('lastSeen', 0) > time.time()*1000 - 3*3600:
                state = "WAITING"
            else:
                state = "UNPAIRED"
            status['state'] = state
            status['type'] = "SENSE"

            senses_info.append(status)

        for s in pills:
            pair = s.get('device_account_pair', {}) or {}
            status = s.get('device_status', {}) or {}

            if pair:
                state = "NORMAL"
                status['deviceId'] = pair.get("externalDeviceId", status.get('deviceId', ''))
                # override last seen with data from pill status table
                pill_status_data = self.hello_request(
                    api_url="devices/pill_status",
                    type="GET",
                    raw_output=True,
                    url_params={'end_ts': int(time.time() * 1000), 'pill_id_partial': status['deviceId']}
                ).data
                if pill_status_data:
                    status['lastSeen'] = pill_status_data[0]['lastSeen']
                    status['batteryLevel'] = pill_status_data[0]['batteryLevel']
            elif status and status.get('lastSeen', 0) > time.time()*1000 - 3*3600:
                state = "WAITING"
            else:
                state = "UNPAIRED"

            status['state'] = state
            status['type'] = "PILL"
            senses_info.append(status)

        return senses_info + pills_info

    def get_zendesk_info_by_email(self, email):
        tickets = []
        try:
            zendesk_cred = self.zendesk_credentials
            search_url = "{}/api/v2/search.json?query=type:ticket%20requester:{}".format(zendesk_cred.domain, email)
            zen_auth = (zendesk_cred.email_account + '/token', zendesk_cred.api_token)
            zen_response = requests.get(search_url, auth=zen_auth)

            if zen_response.ok:
                tickets += zen_response.json().get('results', [])

            while zen_response.json().get('next_page') is not None:
                zen_response = requests.get(zen_response.json().get('next_page'), auth=zen_auth)
                if zen_response.ok:
                    tickets += zen_response.json().get('results', [])

            tickets = sorted(tickets, key=lambda k: iso_to_utc_timestamp(k.get('created_at')))
        except:
            pass
        return {
            'count': len(tickets),
            'last_subject': tickets[0]['subject'] if tickets else '',
            'last_updated': tickets[0]['updated_at'] if tickets else ''
        }

    def get(self):
        accounts = self.query_by_exact_email_or_id()
        if accounts.status == 404:
            if not self.omni_input.isdigit():
                accounts = self.query_by_email_or_name_partials()
                if len(accounts.data) == 0:
                    accounts = self.query_by_device_id()
        else:
            accounts.data = [accounts.data]
        if len(accounts.data) == 0 and not accounts.error:
            accounts.set_status(404)
            accounts.set_error("Account not found!!")

        accounts.set_data([{
                               # 'zendesk': self.get_zendesk_info_by_email(account['email']),
                               'profile': account,
                               'devices': self.get_devices_info_by_email(account['email'])
                           } for account in accounts.data])
        self.response.write(accounts.get_serialized_output())


class PasswordResetAPI(ProtectedRequestHandler):
    def post(self):
        """
        Send a password reset link to input email
        """
        body = json.loads(self.request.body)
        email = body.get("email")
        self.hello_request(
            api_info=self.suripu_app,
            api_url="password_reset",
            type="POST",
            body_data=json.dumps({"email": email})
        )
        self.send_to_slack_admin_logs_channel("Employee {} sent a link to reset password to customer {}".format(self.current_user_email, email))


class ForcePasswordUpdateAPI(CustomerExperienceRequestHandler):
    def post(self):
        """
        Force update password on behalf of user
        """
        body = json.loads(self.request.body)
        email = body.get("email")
        password = body.get("password")
        self.hello_request(
            api_url="account/update_password",
            type="POST",
            body_data=json.dumps({"email": email, "password": password}),
        )
        self.send_to_slack_admin_logs_channel("Employee {} hard-reseted password for customer {}".format(self.current_user_email, email))


class AccountCountsBreakdownByCreatedDateAPI(ProtectedRequestHandler):
    def get(self):
         self.hello_request(
            api_url="account/count_by_created",
            type="GET",
        )