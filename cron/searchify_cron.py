import datetime
import json
import logging as log

from core.handlers.base import BaseCron
from indextank import ApiClient
import settings


class DropOldSenseLogsSearchifyIndex(BaseCron):
    """
    To be run at the end of GMT day (23:55)
    """
    def get(self):
        output = {"status": "", "deleted_index_size": 0, "deleted_index_name": ""}
        searchify_cred = self.searchify_credentials
        searchify_client = ApiClient(searchify_cred.api_client)
        date_of_deleted_index = (datetime.datetime.now() - datetime.timedelta(days=settings.SENSE_LOGS_KEEP_DAYS - 1)).strftime("%Y-%m-%d")
        log.info("Attempting to drop index {}".format(date_of_deleted_index))

        deleted_index_name = settings.SENSE_LOGS_INDEX_PREFIX + date_of_deleted_index
        output["deleted_index_name"] = deleted_index_name

        deleted_index = searchify_client.get_index(deleted_index_name)
        if deleted_index.exists() is False:
            output["status"] = "Index {} does not exist to be deleted".format(deleted_index_name)
        else:
            try:
                searchify_client.delete_index(deleted_index_name)
                output["deleted_index_size"] = deleted_index.get_size()
                output["status"] = "Index {} dropped".format(deleted_index_name)
            except Exception as e:
                output['status'] = str(e.message)
                log.error("Failed to drop index {} because {}".format(deleted_index_name, str(e.message)))

        dumped_output = json.dumps(output)
        log.info(dumped_output)
        self.send_to_slack_stats_channel(dumped_output)
        self.response.write(dumped_output)