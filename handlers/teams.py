import logging as log
import json
from handlers.utils import display_error
from handlers.helpers import BaseRequestHandler, make_oauth2_service

from rauth import OAuth2Service
from models.setup import AppInfo
import datetime

class TeamsAPI(BaseRequestHandler):
    def get(self):
        output = {'data': [], 'error': ''}
        try:
            session = self.authorize_session()
            team = self.request.get('team', default_value="")
            show_teams_only = self.request.get('show_teams_only', default_value="")

            if not team and not show_teams_only:
                raise RuntimeError("Invalid GET request")

            if show_teams_only == "true":
                req_url = "teams/devices"
            else:
                req_url = "teams/devices/{}".format(team)
            log.info(req_url)
            response = session.get(req_url, headers={'Content-Type' : 'application/json'})
            if response.status_code == 200:
                output['data'] = [r['name'] for r in response.json()] if show_teams_only == "true" else response.json()
            else:
                raise RuntimeError('{}: fail to retrieve list of devices for team {}'.format(response.status_code, team))

        except Exception as e:
            output['error'] = display_error(e)
            log.error('ERROR: {}'.format(display_error(e)))

        self.response.write(json.dumps(output))

    def put(self):
        output = {'data': [], 'error': '', 'status': 0}
        try:
            session = self.authorize_session()
            req = json.loads(self.request.body)
            devices = req.get('devices', [])
            team = req.get('team', '')

            if not team or not devices:
                raise RuntimeError('Invalid PUT request!')

            devices = [d.strip() for d in devices.split(',')]

            req_url = "teams/devices"
            put_response = session.post(req_url,
                                        headers={'Content-Type' : 'application/json'},
                                        data=json.dumps({"name": team, "ids": devices}))

            if put_response.status_code != 204:
                log.error(put_response.content)
                raise RuntimeError('{}: fail to add device {} to {}'.format(put_response.status_code, devices, team))
            output['status'] = put_response.status_code
        except Exception as e:
            output['error'] = display_error(e)
            log.error('ERROR: {}'.format(display_error(e)))

        self.response.write(json.dumps(output))


    def post(self):
        output = {'data': [], 'error': '', 'status': 0}
        try:
            session = self.authorize_session()
            req = json.loads(self.request.body)
            device = req.get('devices', [])
            team = req.get('team', '')

            if not team or not device:
                raise RuntimeError('Invalid POST request!')

            device = device.split(',')

            for d in device:
                req_url = "teams/devices/{}/{}".format(team, d.strip())
                response = session.delete(req_url,
                                          headers={'Content-Type' : 'application/json'})
                if response.status_code != 204:
                    log.error(response.content)
                    raise RuntimeError('{}: fail to delete firmware device {}'.format(response.status_code, device))
            output['status'] = response.status_code
        except Exception as e:
            output['error'] = display_error(e)
            log.error('ERROR: {}'.format(display_error(e)))

        self.response.write(json.dumps(output))


class Teams2API(BaseRequestHandler):
    def get(self):
        output = {'data': [], 'error': ''}
        try:
            session = self.authorize_session()
            mode = self.request.get('mode', default_value="")

            if not mode:
                raise RuntimeError("Invalid GET request")

            req_url = "teams/{}".format(mode)
            log.info(req_url)

            response = session.get(req_url, headers={'Content-Type' : 'application/json'})
            if response.status_code == 200:
                output['data'] = response.json()
            else:
                raise RuntimeError('{}: fail to retrieve current teams list for {}'.format(response.status_code, mode))

        except Exception as e:
            output['error'] = display_error(e)
            log.error('ERROR: {}'.format(display_error(e)))

        self.response.write(json.dumps(output))

    def put(self):
        output = {'data': [], 'error': ''}
        try:
            session = self.authorize_session()
            req = json.loads(self.request.body)
            group = req.get('group', "")
            ids = req.get('ids', "")
            mode = req.get('mode', "")
            action = req.get('action', "")

            if not mode or not group or not mode or not action:
                raise RuntimeError("Invalid PUT request")
            ids = ids.strip().split(",")
            if mode == "users" and action != "delete-group":
                ids = map(int, ids)

            req_url = "teams/{}".format(mode)
            headers = {'Content-Type': 'application/json'}
            data = json.dumps({"name": group, "ids": ids})

            response = None
            if action == 'add':
                response = session.post(req_url, headers=headers,data=data)
            elif action == 'replace':
                response = session.put(req_url, headers=headers,data=data)
            elif action == 'remove':
                response = session.delete(req_url, headers=headers, data=data)
            elif action == 'delete-group':
                req_url = "teams/{}/{}".format(mode, group)
                response = session.delete(req_url, headers=headers)

            print data, response

            if not response or response.status_code != 204:
                raise RuntimeError('{}: Fail to {}'.format(response.status_code, action))

        except Exception as e:
            output['error'] = display_error(e)
            log.error('ERROR: {}'.format(display_error(e)))

        self.response.write(json.dumps(output))

    def post(self):
        app_info_model = AppInfo(access_token=u'3.25666ca38dc94d31a4f91c1c2adcd37c', client_id=u'gae_admin', created=datetime.datetime(2014, 11, 18, 0, 39, 17, 997551), endpoint=u'https://dev-api.hello.is/v1/')
        hello_service = OAuth2Service(
            client_id=app_info_model.client_id,
            client_secret='',
            name='hello',
            authorize_url=app_info_model.endpoint + 'oauth2/authorize',
            access_token_url=app_info_model.endpoint + 'oauth2/token',
            base_url=app_info_model.endpoint
        )
        session = hello_service.get_session(app_info_model.access_token)
        headers = {'Content-Type': 'application/json'}
        response = session.delete("teams/devices", data='{"name": "longtest", "ids": ["d22"]}', headers=headers)
        # response = session.delete("teams/devices", data=json.dumps({"name": "longtest", "ids":["d15"]}), headers=headers)
        print response
        self.response.write(json.dumps({'data': [], 'error': ''}))