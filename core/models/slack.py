import logging as log
import requests
import json

class Slack(object):
    DEPLOYS_CHANNEL = "deploys"
    STATS_CHANNEL = "stats"
    ADMIN_LOGS_CHANNEL = "admin_logs"
    DUST_CALIBRATION_CHANNEL = "dust_calibration"

    def __init__(self, namespace, slack_webhook_settings):
        self.namespace = namespace
        self.slack_webhook_settings = slack_webhook_settings

    def send(self, channel, message):
        if self.namespace == "dev" or channel not in self.slack_webhook_settings:
            return

        payload = {
            "text": "[{}] {}".format(self.namespace, message),
            "icon_emoji": self.slack_webhook_settings[channel].icon,
            "username": self.slack_webhook_settings[channel].bot,
            "link_names": 1
        }

        try:
            requests.post(
                url=self.slack_webhook_settings[channel].url,
                data=json.dumps(payload),
                headers={"Content-Type": "application/json"}
            )
        except requests.RequestException as e:
            log.error("Slack notification failed because {}".format(e))

    def send_to_deploys_channel(self, message=""):
        self.send(self.DEPLOYS_CHANNEL, message)

    def send_to_stats_channel(self, message=""):
        self.send(self.STATS_CHANNEL, message)

    def send_to_admin_logs_channel(self, message=""):
        self.send(self.ADMIN_LOGS_CHANNEL, message)

    def send_to_dust_calibration_channel(self, message=""):
        self.send(self.DUST_CALIBRATION_CHANNEL, message)