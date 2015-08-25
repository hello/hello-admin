import datetime
import json
import logging as log
import time
import requests
from handlers.helpers import BaseCron
from indextank import ApiClient
import settings


class GeckoboardPush(BaseCron):
    def push_to_gecko(self, count, device_type, widget_id):
        post_data = {
            "api_key": self.geckoboard_credentials.api_key,
            "data": {
                "item": [
                    {
                        "value": count,
                        "text": device_type
                    },
                    ]
            }
        }

        widget_url = "https://push.geckoboard.com/v1/send/" + widget_id
        gecko_response = requests.post(widget_url, json.dumps(post_data))
        return {"success": gecko_response.ok}


class DevicesCountPush(GeckoboardPush):
    def get(self):
        devices_status_breakdown = self.hello_request(
            type="GET",
            api_url="devices/status_breakdown",
            raw_output=True,
            url_params={'start_ts': int(time.time()*1000) - 24*3600*1000, 'end_ts': int(time.time()*1000)}
        ).data

        if self.geckoboard_credentials is None:
            self.error("missing Geckoboard credentials!")
        senses_count = devices_status_breakdown.get('senses_count', -1)
        pills_count = devices_status_breakdown.get('pills_count', -1)

        self.response.write(json.dumps({
            "sense": self.push_to_gecko(senses_count, "senses", self.geckoboard_credentials.senses_widget_id),
            "pill": self.push_to_gecko(pills_count, "pills", self.geckoboard_credentials.pills_widget_id)
        }))


class AlarmsCountPush(GeckoboardPush):
    def get(self):
        # if settings.GECKOBOARD is None or settings.GECKOBOARD.alarms_widget_id:
        #     self.error("missing Geckoboard credentials!")

        alarm_pattern = "ALARM RINGING"
        alarms_count = -1

        try:
            now_date = datetime.datetime.now().strftime("%Y-%m-%d")
            index = ApiClient(self.searchify_credentials.api_client).get_index(settings.SENSE_LOGS_INDEX_PREFIX + now_date)
            alarms_count = index.search(query=alarm_pattern)['matches']

        except Exception as e:
            log.error(e.message)
            self.error(e.message)

        self.response.write(json.dumps({
            # "alarms": self.push_to_gecko(alarms_count, "alarms", settings.GECKOBOARD.alarms_widget_id),
            "alarms": self.push_to_gecko(alarms_count, "alarms", "125660-3c3cfc26-67e6-4fbf-8ccd-0039c641fda3"),
            }))