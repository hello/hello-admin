import json
import logging as log
import jinja2
import os
from handlers.helpers import ProtectedRequestHandler
from utils import display_error

JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True
)


class UserAPI(ProtectedRequestHandler):
    def get(self):
        """
        Grab users
        :input: user email (optional)
        - auth params: oauth2
        """

        output = {'data': {}, 'error': ''}
        try:
            email = self.request.get('email')
            session = self.authorize_session()
            if email:
                response = session.get("account/q", params={'email': email})
            else:
                response = session.get("account/recent")

            if response.status_code == 200:
                log.info('SUCCESS - {}'.format(response.content))
                output['data'] = response.json()
            else:
                raise RuntimeError('{}: Failed to retrieve user "{}"'.format(
                    response.status_code,
                    email
                ))
        except Exception as e:
            output['error'] = display_error(e)
        self.response.write(json.dumps(output))

    def post(self):
        """
        Create users
        """
        name = self.request.get("name")
        email = self.request.get("email")
        password = self.request.get("password")
        gender = self.request.get("gender")
        height = self.request.get("height")
        weight = self.request.get("weight")
        tz = self.request.get("tz")

        data = {
            "name": name,
            "email": email,
            "password": password,
            "gender": gender,
            "height": height,
            "weight": weight,
            "tz": tz
        }

        if not all([name, email, password, gender, height, weight, tz]):
            self.error(400)
            self.response.write("All fields not specified")
            self.response.write(json.dumps(data))
            return

        headers = {
            'Content-type': 'application/json',
            'Accept': 'application/json'
        }

        session = self.authorize_session()

        log.info("Submitting data")
        log.info(data)
        resp = session.post('account', data=json.dumps(data), headers=headers)

        log.info(resp.url)
        log.info(resp.status_code)
        log.info(resp.content)

        template_values = {}
        if resp.status_code == 409:
            template_values['error'] = '[HTTP %s] Account already exists.\
             Response: %s ' % (resp.status_code, resp.content)
        elif resp.status_code == 200:
            template_values['message'] = "User %s created successfully" % email
        else:
            template_values['error'] = '[HTTP %s] Response: %s' \
                % (resp.status_code, resp.content)
        self.error(resp.status_code)
        self.response.write(json.dumps(template_values))