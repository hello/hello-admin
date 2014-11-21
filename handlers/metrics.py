import json
import logging as log
import time
from handlers.utils import display_error
from handlers.helpers import BaseRequestHandler
from models.ext import SearchifyCredentials
from indextank import ApiClient


class PreSleepAPI(BaseRequestHandler):
    def get(self):
        """
        Grab temperature
        - request input:
            sensor (required: one of ["humidity", "particulates", "temperature"])
            token (required for each user)
            resolution (required : week or day)
        """
        output = {'data': [], 'error': ''}
        try:
            sensor = self.request.get('sensor', default_value='humidity')
            resolution = self.request.get('resolution', default_value='day')
            timezone_offset = int(self.request.get('timezone_offset', default_value=8*3600*1000))
            current_ts = int(time.time() * 1000) - timezone_offset
            log.warning(current_ts)
            user_token = self.request.get('user_token', default_value=None)

            if user_token is None:
                raise RuntimeError("Missing user token!")

            session = self.authorize_session(user_token)
            req_url = "room/{}/{}".format(sensor, resolution)
            response = session.get(req_url, params={'from': current_ts})

            if response.status_code == 200:
                output['data'] = response.json()
            else:
                raise RuntimeError('{}: fail to retrieve presleep'.format(response.status_code))
        except Exception as e:
            output['error'] = display_error(e)
            log.error('ERROR: {}'.format(display_error(e)))

        self.response.write(json.dumps(output))


class DebugLogAPI(BaseRequestHandler):
    """
    Retrieve debug logs
    """
    def get(self):
         output = {'data': [], 'error': ''}
         try:
             search_input = self.request.get('search_input', default_value=None)
             search_by = self.request.get('search_by', default_value=None)
             max_results = int(self.request.get('max_results', default_value=20))

             if None in [search_input, search_by]:
                 raise RuntimeError("Missing input")

             info_query = SearchifyCredentials.query()
             results = info_query.fetch(1)

             if not results:
                 raise RuntimeError("Missing AppInfo. Bailing.")

             searchify_cred = results[0]

             debug_log_api = ApiClient(searchify_cred.api_client)
             index = debug_log_api.get_index('sense-logs')
             output['data'] = index.search('{}:{}'.format(search_by, search_input), fetch_fields=['text'], length=max_results)

         except Exception as e:
             output['error'] = display_error(e)
             log.error('ERROR: {}'.format(display_error(e)))

         self.response.write(json.dumps(output))
