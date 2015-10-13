from settings import SLACK_WEBHOOK
import logging as log
import requests
import json

class Slack():
    def __init__(self, namespace):
        self.namespace = namespace
    def send(self, channel, message):
        if self.namespace == "dev" or channel not in SLACK_WEBHOOK:
            return
        payload = {
            "text": "[{}] {}".format(self.namespace, message),
            "icon_emoji": SLACK_WEBHOOK[channel]["icon"],
            "username": SLACK_WEBHOOK[channel]["bot"],
            "link_names": 1
        }
        try:
            requests.post(
                url=SLACK_WEBHOOK[channel]["url"],
                data=json.dumps(payload),
                headers={"Content-Type": "application/json"}
            )
        except Exception as e:
            log.error("Slack notification failed: %s", e)

    def send_to_deploys_channel(self, message=""):
        self.send("deploys", message)

    def send_to_stats_channel(self, message=""):
        self.send("stats", message)

    def send_to_admin_logs_channel(self, message=""):
        self.send("admin_logs", message)

    def send_to_dust_calibration_channel(self, message=""):
        self.send("dust_calibration", message)