import logging as log
import json
from handlers.utils import display_error
from handlers.helpers import BaseRequestHandler

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
