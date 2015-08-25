from collections import Counter
import datetime
import json
import operator
from api.searchify import SearchifyQuery
from handlers.helpers import ProtectedRequestHandler
from indextank import ApiClient
from models.ext import BuggyFirmware
import settings


class FirmwareLogsAlert(ProtectedRequestHandler):
    @property
    def keywords(self):
        return ["ASSERT", "fault", "fail at"]

    def get(self):
        output = {}
        utc_now = datetime.datetime.utcnow()
        utc_now_date = utc_now.strftime("%Y-%m-%d")
        utc_now_secs = int(utc_now.strftime("%s"))
        utc_last_hour = utc_now - datetime.timedelta(hours=1)

        index = ApiClient(self.searchify_credentials.api_client).get_index(settings.SENSE_LOGS_INDEX_PREFIX + utc_now_date)
        buggy_firmware = BuggyFirmware.query().get()

        # messages = "Current FW crash logs black list is\n```top version: {}\nmiddle version: {}\nsense_id: {}```\n\n".format(buggy_firmware.top_versions, buggy_firmware.middle_versions, buggy_firmware.sense_ids)
        messages = ""
        for keyword in self.keywords:
            searchify_query = SearchifyQuery()
            searchify_query.set_query("text:{}".format(keyword))
            searchify_query.set_fetch_fields(["top_fw_version", "middle_fw_version", "device_id"])
            searchify_query.set_docvar_filters({0: [[utc_now_secs - 1*3600, utc_now_secs]]})
            response = index.search(**searchify_query.mapping())

            if response.get('matches', 0) <= 0:
                # messages += "No FW crash found for keyword {} over last hour\n".format(keyword)
                continue

            start_ts = "%20".join([utc_last_hour.strftime("%m/%d/%Y"), utc_last_hour.strftime("%H:%M:%S")])
            end_ts = "%20".join([utc_now.strftime("%m/%d/%Y"), utc_now.strftime("%H:%M:%S")])
            sense_logs_link = "<https://hello-admin.appspot.com/sense_logs/?field=text&keyword={}&sense_id=&limit=2000&start={}&end={}| here>".format(keyword,start_ts, end_ts)

            top_fw_list = []
            middle_fw_list = []
            sense_id_list = []
            total_legit_crash_logs = 0
            for r in response.get("results", []):
                if any([r.get("top_fw_version") in buggy_firmware.top_versions.split(", "),
                        r.get("middle_fw_version") in buggy_firmware.middle_versions.split(", "),
                        r.get("device_id") in buggy_firmware.sense_ids.split(", "),
                        not r.get("top_fw_version"),
                        not r.get("middle_fw_version"),
                        not r.get("device_id")]):
                    continue
                total_legit_crash_logs += 1
                if r.get("top_fw_version"):
                    top_fw_list.append(r.get("top_fw_version"))
                if r.get("middle_fw_version"):
                    middle_fw_list.append(r.get("middle_fw_version"))
                if r.get("device_id"):
                    sense_id_list.append(r.get("device_id"))

            if total_legit_crash_logs <= 0:
                continue

            message = "@chris @kevintwohy: {} FW crash logs with keyword `{}` over last hour, view logs {}".format(total_legit_crash_logs, keyword, sense_logs_link)

            if sum(Counter(top_fw_list).values()) > 0:
                message += "\n\n```Breakdown by top firmware"
                for x in sorted(Counter(top_fw_list).items(), key=operator.itemgetter(1), reverse=True):
                    message += "\n {} \t {}".format(x[0], x[1])
                message += "```"

            if sum(Counter(middle_fw_list).values()) > 0:
                message += "\n\n```Breakdown by middle firmware"
                for x in sorted(Counter(middle_fw_list).items(), key=operator.itemgetter(1), reverse=True):
                    message += "\n {} \t {}".format(x[0], x[1])
                message += "```"
            if sum(Counter(sense_id_list).values()) > 0:
                message += "\n\n```Breakdown by sense external ID"
                for x in sorted(Counter(sense_id_list).items(), key=operator.itemgetter(1), reverse=True):
                    message += "\n {} \t {}".format(x[0], x[1])
                message += "```"
            messages += message

        output["messages"] = messages
        if messages:
            self.send_to_slack_admin_logs_channel(messages)
        self.response.write(json.dumps(output))