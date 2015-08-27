# import json, datetime, sys, yaml
# sys.path.append('/Applications/GoogleAppEngineLauncher.app/Contents/Resources/GoogleAppEngine-default.bundle/Contents/Resources/google_appengine')
#
# from models.setup import AppInfo
# from rauth import OAuth2Service
#
# app_info_model = AppInfo(access_token=u'3.25666ca38dc94d31a4f91c1c2adcd37c', client_id=u'gae_admin', created=datetime.datetime(2014, 11, 18, 0, 39, 17, 997551), endpoint=u'https://dev-api.hello.is/v1/')
# hello_service = OAuth2Service(
#     client_id=app_info_model.client_id,
#     client_secret='',
#     name='hello',
#     authorize_url=app_info_model.endpoint + 'oauth2/authorize',
#     access_token_url=app_info_model.endpoint + 'oauth2/token',
#     base_url=app_info_model.endpoint
# )
# session = hello_service.get_session(app_info_model.access_token)
# headers = {'Content-Type': 'application/json'}
# response = session.delete("teams/devices", data=json.dumps({"name": "longtest", "ids":["d5"]}), headers=headers)
# print "status_code: {}".format(response.status_code)


import urllib
import sys
sys.path.append('/Applications/GoogleAppEngineLauncher.app/Contents/Resources/GoogleAppEngine-default.bundle/Contents/Resources/google_appengine')
from google.appengine.api import apiproxy_stub_map
from google.appengine.api import urlfetch_stub
apiproxy_stub_map.apiproxy = apiproxy_stub_map.APIProxyStubMap()
apiproxy_stub_map.apiproxy.RegisterStub('urlfetch', urlfetch_stub.URLFetchServiceStub())

from google.appengine.api import urlfetch
form_fields = {
    "name": "longtest",
    "ids": ["d15"],
}
form_data = urllib.urlencode(form_fields)
result = urlfetch.fetch(
    url='https://unstable-api.hello.is/v1/teams/devices',
    payload=form_data,
    method=urlfetch.DELETE,
    headers={
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 3.d1e1f0ace79b4e648da4dce023858959'
    },
)
print result.status_code
print result.__dict__
