import os
from models.setup import AppInfo
from models.setup import AdminUser
from models.setup import UserGroup
from models.ext import SearchifyCredentials
from models.ext import ZendeskCredentials
from models.ext import GeckoboardCredentials

DEBUG = False
ENVIRONMENT = "prod"
ADMIN_APP_INFO = AppInfo.get_by_id("admin")

DEFAULT_LOCAL_DEV_CLIENT_ID = "gae_admin"
DEFAULT_LOCAL_AGAINST_PROD_API_URL = "http://localhost:9999/v1/"
DEFAULT_LOCAL_AGAINST_DEV_API_URL = "http://localhost:3333/v1/"

SERVER = os.environ.get("SERVER_NAME", "")

if SERVER.startswith("dev"):
    ENVIRONMENT = "dev"
    ADMIN_APP_INFO = AppInfo.get_by_id("admin-dev")

if SERVER == "localhost":
    DEBUG = True
    ENVIRONMENT = "local-dev"

## Grab settings saved in GAE memcache and only query from Datastore if they are not available
APP_INFO = AppInfo.get_by_id(ENVIRONMENT)
ADMIN_USER = AdminUser.get_by_id(ENVIRONMENT)
SEARCHIFY = SearchifyCredentials.query().get()
ZENDESK = ZendeskCredentials.query().get()
USER_GROUP = UserGroup.query().get()
GECKOBOARD = GeckoboardCredentials.query().get()

DEFAULT_ACCESS_TOKEN = APP_INFO.access_token if APP_INFO else None
ACTIVE_DEVICES_HISTORY_KEEP_DAYS = 4

## Seachify Index
SENSE_LOGS_INDEX_MAY = "sense-logs-2015-05"
SENSE_LOGS_INDEX_PREFIX = "sense-logs-"
SENSE_LOGS_INDEX_BACKUP = "sense-logs-backup"

## Papertrail
PAPERTRAIL_TOKEN = "AllkLtsvxLdFfsneCb3"



