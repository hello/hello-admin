from google.appengine.ext import ndb

__author__ = 'zet'

SURIPU_APP_ID = "suripu-app"
SURIPU_APP_V2_ID = "suripu-app-v2"
SURIPU_ADMIN_ID = "suripu-admin"

DEFAULT_SURIPU_APP_DOMAIN = "http://localhost:9999/v1/"
DEFAULT_SURIPU_APP_V2_DOMAIN = "http://localhost:9999/v2/"
DEFAULT_SURIPU_ADMIN_DOMAIN = "http://localhost:3333/v1/"

DEFAULT_CLIENT_ID = "gae_admin"
DEFAULT_TOKEN = ""

LOCAL_AVAILABLE_NAMESPACES = ["dev", "staging", "canary", "production"]
AVAILABLE_NAMESPACES = ["staging", "canary", "production"]

class ApiInfo(ndb.Model):
    domain = ndb.StringProperty(required=True)
    client_id = ndb.StringProperty(required=True, default=DEFAULT_CLIENT_ID)
    token = ndb.StringProperty(required=True, default=DEFAULT_TOKEN)
    namespace = ndb.StringProperty(required=True)
    last_updated = ndb.DateTimeProperty(auto_now_add=True)

    @classmethod
    def create_defaults(cls, namespace):
        ApiInfo(id=SURIPU_APP_ID, domain=DEFAULT_SURIPU_APP_DOMAIN, namespace=namespace).put()
        ApiInfo(id=SURIPU_APP_V2_ID, domain=DEFAULT_SURIPU_APP_V2_DOMAIN, namespace=namespace).put()
        ApiInfo(id=SURIPU_ADMIN_ID, domain=DEFAULT_SURIPU_ADMIN_DOMAIN, namespace=namespace).put()