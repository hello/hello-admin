import os
from models.setup import AppInfo
from models.ext import SearchifyCredentials
from models.ext import ZendeskCredentials
from models.ext import GeckoboardCredentials
from  collections import namedtuple

DEBUG = False
ENVIRONMENT = "prod"
ADMIN_APP_INFO = AppInfo.get_by_id("admin")
CANARY_APP_INFO_ID = "canary"

DEFAULT_LOCAL_DEV_CLIENT_ID = "gae_admin"
DEFAULT_LOCAL_AGAINST_PROD_API_URL = "http://localhost:9999/v1/"
DEFAULT_LOCAL_AGAINST_DEV_API_URL = "http://localhost:3333/v1/"

SERVER = os.environ.get("SERVER_NAME", "")

if SERVER.startswith("localhost"):
    DEBUG = True
    ENVIRONMENT = "dev"
    ADMIN_APP_INFO = AppInfo.get_by_id("admin-dev")

## Grab settings saved in GAE memcache and only query from Datastore if they are not available

SEARCHIFY = SearchifyCredentials.query().get()
ZENDESK = ZendeskCredentials.query().get()

GECKOBOARD = GeckoboardCredentials.query().get()

ACTIVE_DEVICES_HISTORY_KEEP_DAYS = 4

## Seachify Index
SENSE_LOGS_INDEX_MAY = "sense-logs-2015-05"
SENSE_LOGS_INDEX_PREFIX = "sense-logs-"
SENSE_LOGS_INDEX_BACKUP = "sense-logs-backup"
SENSE_LOGS_KEEP_DAYS = 7

## Papertrail
PAPERTRAIL_TOKEN = "AllkLtsvxLdFfsneCb3"

# Slack
SlackWebhookConfig = namedtuple("SlackWebhookConfig", "url bot icon")
SLACK_WEBHOOK = {
    "deploys": SlackWebhookConfig(
        url="https://hooks.slack.com/services/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",
        bot="deploy-bot",
        icon=":ghost:"
    ),
    "stats": SlackWebhookConfig(
        url="https://hooks.slack.com/services/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",
        bot="stats-bot",
        icon=":hammer:"
    ),
    "admin_logs": SlackWebhookConfig(
        url="https://hooks.slack.com/services/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",
        bot="admin-logs-bot",
        icon=":snake:"
    ),
    "dust_calibration": SlackWebhookConfig(
        url="https://hooks.slack.com/services/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",
        bot="dusty-bot",
        icon=":thought_balloon:"
    ),
    "firmware-crash-logs": SlackWebhookConfig(
        url="https://hooks.slack.com/services/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",
        bot="crash-bot",
        icon=":broken_heart:"
    ),
}

TIMELINE_RESEARCH_OAUTH_CLIENT_ID = "timeline-research"
INSIGHTS_OAUTH_CLIENT_ID = "a9ca0fbb-f831-4bd7-8ca1-f9d393d0ea66"
