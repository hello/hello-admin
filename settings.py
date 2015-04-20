import os
from models.setup import AppInfo
from models.setup import AdminUser
from models.setup import UserGroup
from models.ext import SearchifyCredentials
from models.ext import ZendeskCredentials
from models.ext import GeckoboardCredentials
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
ADMIN_APP_INFO = AppInfo.get_by_id("admin")
ADMIN_USER = memcache.get("admin_user"+ENVIRONMENT) or AdminUser.get_by_id(ENVIRONMENT)
SEARCHIFY = memcache.get("searchify_credentials") or SearchifyCredentials.query().get()
ZENDESK = memcache.get("zendesk_credentials") or ZendeskCredentials.query().get()
USER_GROUP = memcache.get("user_group") or UserGroup.query().get()
GECKOBOARD = memcache.get("geckoboard_credentials") or GeckoboardCredentials.query().get()

## Seachify Index
SENSE_LOGS_INDEX = "sense-logs-2015-03"
APPLICATION_LOGS_INDEX = "application-logs-2015-03"
WORKERS_LOGS_INDEX = "workers-logs-2015-03"

## Keep N newest docs from being purged
SENSE_LOGS_KEEP_SIZE = 558000  # * 3 days * 465 active-senses * 400 sense-docs/active-sense day
APPLICATION_LOGS_KEEP_SIZE = {
    'DEBUG': 41850, # 3 days * 465 active-senses * 30 app-debug-docs/active-sense day
    'INFO': 348750,  # 3 days * 465 active-senses * 250 app-info-docs/active-sense day
    'WARN': 104625, # 3 days * 465 active-senses * 75 app-warn-docs/active-sense day
    'ERROR': 97650 # at least 7 days * 465 active-senses * 30 app-error-docs/active-sense day
}
WORKERS_LOGS_KEEP_SIZE = {
    'DEBUG': 5000, # No history so far
    'INFO': 41850,  # 3 days * 465 active-senses * 55 app-info-docs/active-sense day
    'WARN': 104625, # 3 days * 465 active-senses * 30 app-warn-docs/active-sense day
    'ERROR': 97650 # 7 days * 465 active-senses * 30 app-error-docs/active-sense day
}


## Keep N lastest days of docs from being purge
SEARCHIFY_LOGS_KEEP_DAYS = {
    SENSE_LOGS_INDEX: 3,
    APPLICATION_LOGS_INDEX: {
        "DEBUG": 3,
        "INFO": 3,
        "WARN": 3,
        "ERROR": 7
    },
    WORKERS_LOGS_INDEX: {
        "DEBUG": 5,
        "INFO": 3,
        "WARN": 3,
        "ERROR": 7
    }
}

SEARCHIFY_PURGE_CAP_SIZE = 10000

ACTIVE_DEVICES_KEEP_DAYS = 2

SEARCHIFY_STATS_KEEP_SIZE = 2880