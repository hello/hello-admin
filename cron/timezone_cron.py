import datetime
import logging as log
import re

from google.appengine.api import taskqueue

from api.papertrail import PaperTrailWrapper
from core.handlers.base import ProtectedRequestHandler


class UpdateTimezoneByPartnerQueue(PaperTrailWrapper):
    def get(self):
        papertrail_warnings = self.get_events(
            search_dict={
                "q": "program:suripu-workers-sense.log No timezone",
                "max_time": datetime.datetime.now().strftime("%s"),
                "min_time": (datetime.datetime.now() - datetime.timedelta(minutes=5)).strftime("%s")
            },
            raw_output=True
        ).data
        regex_pattern = "(No timezone info for account )(\d+)( paired with)(.*)(, account may already unpaired with device but merge table not updated.)"

        timezoneless_account_ids = []
        for p in papertrail_warnings.get("events", []):
            matches = re.findall(regex_pattern, p.get("message", ""))
            if matches:
                account_id = int(matches[0][1])
                timezoneless_account_ids.append(account_id)

        timezoneless_account_id_set = sorted(list(set(timezoneless_account_ids)))

        for a in timezoneless_account_id_set:
            taskqueue.add(
                url="/cron/update_timezone_by_partner",
                params={
                    "account_id": a,
                },
                method="GET",
                queue_name="update-timezone-queue"
            )

        log.info("Accounts that may need to update timezone by partner: {}".format(timezoneless_account_id_set))
        self.response.write(timezoneless_account_id_set)


class UpdateTimezoneByPartner(ProtectedRequestHandler):
    def get(self):
        account_id = self.request.get("account_id")
        response = self.hello_request(
            api_url="devices/update_timezone_by_partner/{}".format(account_id),
            type="POST",
            raw_output=True
        )
        if response.status == 204:
            log.info("Successfully updated timezone by partner for account {}".format(account_id))
            self.send_to_slack_admin_logs_channel("Successfully updated timezone by partner for account <https://hello-admin.appspot.com/account_profile/?input={}&type=account_id| {}>".format(account_id, account_id))
        else:
            log.info("Failed to update timezone by partner for account {}".format(account_id))