from handlers.helpers import ProtectedRequestHandler


class DeviceAPI(ProtectedRequestHandler):
    '''Enables OTA firmware updates'''

    def get(self):
        email = self.request.get('email', default_value="")
        print "Getting devices for {}".format(email)

        self.hello_request(
            api_url="devices/q",
            type="GET",
            url_params={'email': email},
        )
