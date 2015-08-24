from handlers.helpers import ProtectedRequestHandler, ResponseOutput

__author__ = 'zet'


class RecentAccountsAPI(ProtectedRequestHandler):
    def get(self):
        limit = int(self.request.get("limit", default_value=10))
        output = ResponseOutput()
        max_id = 100000000

        while max_id > 1 and len(output.data) < limit:
            raw_output = self.hello_request(
                type="GET",
                api_url="account/paginate",
                raw_output=True,
                url_params={"limit": limit, "max_id": max_id} if limit else {}
            )

            output.set_error(raw_output.error)
            output.set_status(raw_output.status)
            output.set_data(output.data + raw_output.data)
            max_id = int(raw_output.data[-1]["id"])
        self.response.write(output.get_serialized_output())


class AccountSearchAPI(ProtectedRequestHandler):
    @property
    def input(self):
        return self.request.get('input')

    @property
    def search(self):
        types_switch = {
            "account_id": self.get_by_account_id,
            "email": self.get_by_email,
            "email_partial": self.get_by_email_partial,
            "name": self.get_by_name_partial,
            "sense_id": self.get_by_device_id,
            "pill_id": self.get_by_device_id,
            "partner": self.get_by_partner
        }
        return types_switch[self.request.get('type', default_value='email')]

    def get_by_account_id(self):
        raw_response = self.hello_request(
            api_url="account",
            type="GET",
            url_params={'id': self.input},
            raw_output=True
        )
        if raw_response.data:
            raw_response.set_data([raw_response.data])
        self.response.write(raw_response.get_serialized_output())

    def get_by_email(self):
        raw_response = self.hello_request(
            api_url="account",
            type="GET",
            url_params={'email': self.input},
            raw_output=True
        )
        if raw_response.data:
            raw_response.set_data([raw_response.data])
        self.response.write(raw_response.get_serialized_output())

    def get_by_email_partial(self):
        self.hello_request(
            api_url="account/partial",
            type="GET",
            url_params={'email': self.input},
        )

    def get_by_name_partial(self):
        self.hello_request(
            api_url="account/partial",
            type="GET",
            url_params={'name': self.input},
        )

    def get_by_device_id(self):
        self.hello_request(
            api_url="devices/{}/accounts".format(self.input),
            type="GET",
        )

    def get_by_partner(self):
        self.hello_request(
            api_url="account/{}/partner".format(self.input),
            type="GET",
        )

    def get(self):
        self.search()