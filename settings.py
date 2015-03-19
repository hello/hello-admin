import os
from models.setup import AppInfo
from models.setup import AdminUser
from models.setup import UserGroup
from models.ext import SearchifyCredentials
from models.ext import ZendeskCredentials
from google.appengine.api import memcache

DEBUG = False
ENVIRONMENT = "prod"

DEFAULT_LOCAL_DEV_CLIENT_ID = "gae_admin"
DEFAULT_LOCAL_API_URL = "http://localhost:9999/v1/"

SERVER = os.environ.get("SERVER_NAME", "")

if SERVER.startswith("dev"):
    ENVIRONMENT = "dev"

if SERVER == "localhost" :
    DEBUG = True
    ENVIRONMENT = "local-dev"

## Grab settings saved in GAE memcache and only query from Datastore if they are not available

APP_INFO = memcache.get("app_info"+ENVIRONMENT) or AppInfo.get_by_id(ENVIRONMENT)

ADMIN_USER = memcache.get("admin_user"+ENVIRONMENT) or AdminUser.get_by_id(ENVIRONMENT)

SEARCHIFY = memcache.get("searchify_credentials") or SearchifyCredentials.query().get()

ZENDESK = memcache.get("zendesk_credentials") or ZendeskCredentials.query().get()

USER_GROUP = memcache.get("user_group") or UserGroup.query().get()
