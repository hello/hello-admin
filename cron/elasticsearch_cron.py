from api.elasticsearch import ElasticSearchHandler
import time
import requests
import json
from core.models.response import ResponseOutput


class FirmwareCrashElasticSearchAlert(ElasticSearchHandler):
    def get(self):
        start_ts = int(time.time()*1000) - 1000*3600
        lucene_phrase = "has_firmware_crash:true AND epoch_millis:[{} TO *]".format(start_ts)
        search_params = "?q={}".format(lucene_phrase) if lucene_phrase else ""
        fields = ["top_firmware_version", "middle_firmware_version", "sense_id"]
        top_size = 9  # Only show top 9 and others

        multi_facets_settings = {
            field.strip() : {
                "terms": {"field": field, "size": top_size}
            }
        for field in fields}

        response = requests.post(
            url="{}/{}/_search{}".format(
                self.base_url,
                self.SENSE_LOGS_INDEX_PATTERN,
                search_params
            ),
            data=json.dumps({
                "aggs" : multi_facets_settings
            }),
            headers={"Authorization": self.token}
        )

        response_output = ResponseOutput.fromPyRequestResponse(response, self.current_user_email)

        message = "FW crash found by ES last hour"
        aggregations = response_output.data.get("aggregations", {})
        for agg_field in aggregations.keys():
            message += "\n```Breakdown by {}".format(agg_field)
            message += "\n".join(["{}: {}".format(j["key"].upper(), j["doc_count"]) for j in aggregations[agg_field]["buckets"]])
            message += "\nOthers: {}\n".format(aggregations[agg_field]["sum_other_doc_count"])  + "\n```\n"

        self.slack_pusher.send_to_firmware_crash_logs_channel(message)
        self.response.write(response_output.get_serialized_output())
