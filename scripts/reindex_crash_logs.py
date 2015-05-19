from indextank import ApiClient

HOURS_BEFORE_CRASH = 2
SENSE_LOGS_INDEX_NAME = "sense-logs-2015-05"
FIRMWARE_CRASH_INDEX_NAME = "firmware-crash-logs"
SEARCHIFY_ENDPOINT = "Ask Tim/Long"

sc = ApiClient(SEARCHIFY_ENDPOINT)
slogs = sc.get_index(SENSE_LOGS_INDEX_NAME)
fw_crash_index = sc.get_index(FIRMWARE_CRASH_INDEX_NAME)

print "Begin extracting logs from {} to {}".format(SENSE_LOGS_INDEX_NAME, FIRMWARE_CRASH_INDEX_NAME)

for crash_keyword in ["travis", "fault", "xkd"]:
    device_crashes_count = slogs.search(
        query="text:{}".format(crash_keyword),
        length=1
    )["facets"]['device_id']
    for k, v in device_crashes_count.items():
        crashes = slogs.search(
            query="text:{}".format(crash_keyword),
            category_filters={"device_id": [k]},
            fetch_fields=["timestamp"],
            fetch_variables=True,
            length=min(v, 5000)
        )
        for c in crashes['results']:
            start_ts = c["variable_0"] - 3600 * HOURS_BEFORE_CRASH
            end_ts = c["variable_0"]
            logs_until_the_crash = slogs.search(
                query="device_id:{}".format(k),
                fetch_fields=["timestamp", "text", "device_id"],
                fetch_variables=True,
                fetch_categories=True,
                docvar_filters={0: [[start_ts, end_ts]]},
                length=100
            )
            docs = [{
                "docid": rr["docid"],
                "fields": {
                    "timestamp": rr["timestamp"],
                    "text": rr["text"],
                    "device_id": rr["device_id"],
                },
                "variables": {
                    0: rr["variable_0"]
                },
                "categories": {
                    "device_id": rr["category_device_id"]
                }
            } for rr in logs_until_the_crash["results"]]
            try:
                fw_crash_index.add_documents(docs)
            except:
                print "Failed to reindex logs of device {} for {}".format(k, crash_keyword)
            print "Reindexed {} documents for device {} for {}".format(len(docs), k, crash_keyword)
