import datetime
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
                self.SENSE_LOGS_INDEX_FW_CRASH,
                search_params
            ),
            data=json.dumps({
                "aggs" : multi_facets_settings
            }),
            headers={"Authorization": self.token}
        )

        response_output = ResponseOutput.fromPyRequestResponse(response, self.current_user_email)
        last_hour_string = (datetime.datetime.utcnow() - datetime.timedelta(hours=1)).strftime("%m/%d/%y %H:%M:%S")
        now_string = datetime.datetime.utcnow().strftime("%m/%d/%y %H:%M:%S")
        sense_logs_es_url = "https://hello-admin.appspot.com/sense_logs_es/?text=&sense_id=&top_fw=&middle_fw=" \
                            "&start={}&end={}&limit=&asc=false&crash_only=true".format(last_hour_string, now_string)

        total_hits = response_output.data.get("hits", {}).get("total", 0)
        if total_hits > 0:
            message = "{} documents with FW crash symptoms found <{}|last_hour>".format(total_hits, sense_logs_es_url)
            aggregations = response_output.data.get("aggregations", {})
            for agg_field in aggregations.keys():
                if not aggregations[agg_field]["buckets"]:
                    continue
                message += "\n```Breakdown by {}\n".format(agg_field)
                message += "\n".join(["{}: {}".format(j["key"].upper(), j["doc_count"]) for j in aggregations[agg_field]["buckets"]])
                message += "\nOthers: {}\n".format(aggregations[agg_field]["sum_other_doc_count"])  + "\n```"

            self.slack_pusher.send_to_firmware_crash_logs_channel(message)
        self.response.write(response_output.get_serialized_output())


class ElasticSearchDropIndex(ElasticSearchHandler):
    TOLERANCE_DAYS = 14
    def get(self):
        index_name = "sense-logs-" + (datetime.datetime.utcnow() - datetime.timedelta(days=self.TOLERANCE_DAYS - 1)).strftime("%Y-%m-%d")
        response = requests.delete(
            url="{}/{}".format(
                self.base_url,
                index_name
            ),
            headers={"Authorization": self.token}
        )
        response_output = ResponseOutput.fromPyRequestResponse(response, self.current_user_email)
        self.response.write(response_output.get_serialized_output())


class UnexpectedFirmwareAlert(ElasticSearchHandler):
    def get(self):
        start_ts = int(time.time()*1000) - 1000*3600
        lucene_phrase = "has_unexpected_firmware:true AND epoch_millis:[{} TO *]".format(start_ts)
        search_params = "?q={}".format(lucene_phrase) if lucene_phrase else ""
        fields = ["top_firmware_version", "middle_firmware_version"]
        top_size = 9  # Only show top 9 and others

        multi_facets_settings = {
            field.strip() : {
                "terms": {"field": field, "size": top_size}
            }
        for field in fields}

        response = requests.post(
            url="{}/_search{}".format(
                self.base_url,
                search_params
            ),
            data=json.dumps({
                "aggs" : multi_facets_settings
            }),
            headers={"Authorization": self.token}
        )

        response_output = ResponseOutput.fromPyRequestResponse(response, self.current_user_email)
        sense_logs_es_url = "https://hello-admin.appspot.com/sense_logs_es/?advance_input=has_unexpected_firmware:true" \
                            "%20AND%20epoch_millis:[{}%20TO%20{}]&limit=&asc=false".format(start_ts, int(time.time()*1000))

        total_hits = response_output.data.get("hits", {}).get("total", 0)
        if total_hits > 0:
            message = "@chris: {} documents with unexpected firmware <{}|last_hour>".format(total_hits, sense_logs_es_url)
            aggregations = response_output.data.get("aggregations", {})
            for agg_field in aggregations.keys():
                if not aggregations[agg_field]["buckets"]:
                    continue
                message += "\n```Breakdown by {}\n".format(agg_field)
                message += "\n".join(["{}: {}".format(j["key"].upper(), j["doc_count"]) for j in aggregations[agg_field]["buckets"]])
                message += "\nOthers: {}\n".format(aggregations[agg_field]["sum_other_doc_count"])  + "\n```"

            self.slack_pusher.send_to_firmware_crash_logs_channel(message)
        self.response.write(response_output.get_serialized_output())