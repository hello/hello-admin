import logging as log
import json
from handlers.utils import display_error
from handlers.helpers import BaseRequestHandler


class FeaturesAPI(BaseRequestHandler):
    def get(self):
        output = {'data': [], 'error': ''}
        session = self.authorize_session()
        req_url = "features"

        try:
            response = session.get(req_url, headers={'Content-Type' : 'application/json'})
            output['data'] = response.json()
            if response.status_code != 200:
                raise RuntimeError('fail to retrieve list of features')

        except Exception as e:
            output['error'] = display_error(e)
            log.error('ERROR: {}'.format(display_error(e)))

        self.response.write(json.dumps(output))

    def put(self):
        output = {'data': [], 'error': '', 'status_code': 0}
        session = self.authorize_session()
        req_url = "features"
        req = json.loads(self.request.body)

        feature = req.get('feature', '')
        ids = req.get('ids', '')
        groups = req.get('groups') or []
        percentage = req.get('percentage', -1)

        try:
            if not feature or not ids or percentage == -1:
                raise RuntimeError('Invalid PUT request!')
            response = session.put(req_url,
                                   headers={'Content-Type' : 'application/json'},
                                   data=json.dumps({
                                       'name': feature,
                                       'ids': ids.strip().split(',') if len(ids) > 0 else [],
                                       'groups': groups,
                                       'percentage': percentage
                                   }))
            output['status_code'] = response.status_code
            if response.status_code != 204:
                raise RuntimeError('fail to update features')

        except Exception as e:
            output['error'] = display_error(e)
            log.error('ERROR: {}'.format(display_error(e)))

        self.response.write(json.dumps(output))