import jinja2
import os
import json
import settings
import requests
import time
from utils import iso_to_utc_timestamp
from handlers.helpers import CustomerExperienceRequestHandler
from handlers.helpers import ProtectedRequestHandler
from handlers.helpers import ResponseOutput
from google.appengine.api import memcache

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
            app_info=settings.ADMIN_APP_INFO,
            raw_output=True
        )

    def query_by_email_or_name_partials(self):
        return self.hello_request(
            api_url="account/partial",
            type="GET",
            url_params={'email': self.omni_input} if '@' in self.omni_input else {'name': self.omni_input},
            app_info=settings.ADMIN_APP_INFO,
            raw_output=True
        )

    def query_by_device_id(self):
        return self.hello_request(
            api_url="devices/{}/accounts".format(self.omni_input),
            type="GET",
            app_info=settings.ADMIN_APP_INFO,
            raw_output=True
        )

    def get_devices_info_by_email(self, email):
        senses = self.hello_request(
                api_url="devices/sense",
                type="GET",
                url_params={'email': email},
                app_info=settings.ADMIN_APP_INFO,
                raw_output=True
            ).data
        pills = self.hello_request(
                api_url="devices/pill",
                type="GET",
                url_params={'email': email},
                app_info=settings.ADMIN_APP_INFO,
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
                    app_info=settings.ADMIN_APP_INFO,
                    url_params={'end_ts': time.time() * 1000, 'pill_id_partial': status['deviceId']}
                ).data
                if pill_status_data:
                    status['deviceId'] = pill_status_data[0]['lastSeen']
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
            zendesk_cred = settings.ZENDESK
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


class RecentUsersAPI(ProtectedRequestHandler):
    def get(self):
        self.hello_request(
            type="GET",
            app_info=settings.ADMIN_APP_INFO,
            api_url="account/recent"
        )

    def get_from_cache(self):
        """Update cached recently users"""
        MAX_RECENT_USERS_LENGTH = 60
        output = ResponseOutput()
        try:
            recent_users = json.loads(self.hello_request(
                api_url="account/recent",
                type="GET",
                raw_output=True
            ).get_serialized_output())['data']

            previously_cached_recent_users = json.loads(memcache.get("recent_users" + settings.ENVIRONMENT) or "[]")
            previously_cached_recent_ids = [u['id'] for u in previously_cached_recent_users]
            new_users = [u for u in recent_users if u['id'] not in previously_cached_recent_ids]

            combined_recent_users = (new_users + previously_cached_recent_users)[:MAX_RECENT_USERS_LENGTH]

            self.update_or_create_memcache(key="recent_users", value=json.dumps(combined_recent_users), environment=settings.ENVIRONMENT, time=31536000)
            output.set_status(200)
            output.set_data(combined_recent_users)

        except Exception as e:
            output.set_error(e.message)
            output.set_status(500)

        self.response.write(output.get_serialized_output())


class PasswordResetAPI(ProtectedRequestHandler):
    def post(self):
        """
        Send a password reset link to input email
        """
        body = json.loads(self.request.body)
        email = body.get("email")
        self.hello_request(
            api_url="password_reset",
            type="POST",
            body_data=json.dumps({"email": email})
        )


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
            app_info=settings.ADMIN_APP_INFO
        )