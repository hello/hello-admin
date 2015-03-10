import os
from models.setup import AppInfo
from models.setup import AdminUser
from models.setup import UserGroup
from models.ext import SearchifyCredentials
from models.ext import ZendeskCredentials


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

## Grab settings saved in GAE datastore
APP_INFO = AppInfo.get_by_id(ENVIRONMENT)
ADMIN_USER = AdminUser.get_by_id(ENVIRONMENT)
SEARCHIFY = SearchifyCredentials.query().get()
ZENDESK = ZendeskCredentials.query().get()
USER_GROUP = UserGroup.query().get()
