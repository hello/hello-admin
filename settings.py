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

## Seachify Index
SENSE_LOGS_INDEX_MARCH = "sense-logs-2015-03"
SENSE_LOGS_INDEX_MAY = "sense-logs-2015-05"
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
    SENSE_LOGS_INDEX_MARCH: 10,
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

SEARCHIFY_PURGE_STATS_KEEP_DAYS = 7

ACTIVE_DEVICES_MINUTE_HISTORY_KEEP_DAYS = 4

SEARCHIFY_STATS_KEEP_SIZE = 2880

PAPERTRAIL_TOKEN = "AllkLtsvxLdFfsneCb3"