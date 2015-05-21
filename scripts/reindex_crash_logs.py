from indextank import ApiClient

HOURS_BEFORE_CRASH = 2
SENSE_LOGS_INDEX_NAME = "sense-logs-2015-05"
FIRMWARE_CRASH_INDEX_NAME = "firmware-crash"
CRASH_KEYWORDS = ["travis", "fault", "xkd"]
LAST_CRASH_TIMESTAMP = {
    "travis": None,
    "fault": None,
    "xkd": None
}
LATEST_CRASH_TIMESTAMP = {}
sc = ApiClient("http://:G3KvEnaw2bDdQc@d7q83.api.searchify.com/")
slogs = sc.get_index(SENSE_LOGS_INDEX_NAME)
fw_crash_index = sc.get_index(FIRMWARE_CRASH_INDEX_NAME)

print "Begin extracting logs from {} to {}".format(SENSE_LOGS_INDEX_NAME, FIRMWARE_CRASH_INDEX_NAME)

added_docs_count = 0
for crash_keyword in CRASH_KEYWORDS:
    latest_crash = slogs.search(
        query="text:{}".format(crash_keyword),
        length=1,
        scoring_function=1,
        fetch_variables=True,
        docvar_filters={0: [[LAST_CRASH_TIMESTAMP[crash_keyword], None]]}
    )
    
    if latest_crash["matches"] == 0:
        print "No crash with keyword {} after {}".format(crash_keyword, LAST_CRASH_TIMESTAMP[crash_keyword])
        break
    LATEST_CRASH_TIMESTAMP[crash_keyword] = latest_crash["results"][0]["variable_0"]
    print "lastest crash time of {} is {}".format(crash_keyword, latest_crash["results"][0]["variable_0"])

    device_crashes_count = latest_crash["facets"]['device_id']
    for k, v in device_crashes_count.items():
        crashes = slogs.search(
            query="text:{}".format(crash_keyword),
            category_filters={"device_id": [k]},
            fetch_fields=["timestamp"],
            fetch_variables=True,
            length=min(v, 5000),
            scoring_function=1
        )
        if crashes["matches"] == 0:
            print "No matches"
            break

        print "matches", crashes["matches"]

        coverage = {"start": float("inf"), "end": 0}
        for c in crashes["results"]:
            crash_ts = c["variable_0"]
            top_leading_events_ts = crash_ts - 3600 * HOURS_BEFORE_CRASH
            
            if top_leading_events_ts >= coverage["start"]:
                continue

            start_ts = top_leading_events_ts
            if LAST_CRASH_TIMESTAMP[crash_keyword]:
                start_ts = max(start_ts, LAST_CRASH_TIMESTAMP[crash_keyword])
            end_ts = crash_ts
            coverage = {"start": start_ts, "end": end_ts}
            logs_until_the_crash = slogs.search(
                query="device_id:{}".format(k),
                fetch_fields=["timestamp", "text", "device_id"],
                fetch_variables=True,
                fetch_categories=True,
                docvar_filters={0: [[start_ts, end_ts]]},
                length=200
            )
            docs = [{
                "docid": rr["docid"],
                "fields": {
                    "timestamp": rr["timestamp"],
                    "text": rr["text"],
                    "device_id": rr["device_id"],
                    "all": 1
                },
                "variables": {
                    0: rr["variable_0"]
                },
                "categories": {
                    "device_id": rr["category_device_id"],
                    "crash_keyword": crash_keyword
                }
            } for rr in logs_until_the_crash["results"]]
            try:
                fw_crash_index.add_documents(docs)
                print "{}. Reindexed {} documents for device {} for {}".format(added_docs_count, len(docs), k, crash_keyword)
                added_docs_count += len(docs)
            except:
                print "Failed to add {} documents for device {} for {}".format(len(docs), k, crash_keyword)

print "\nJob done. Added {}".format(added_docs_count)
print "Reindex crash logs until"
print LATEST_CRASH_TIMESTAMP

def extract_range_list(ts_list, delta):
    coverage = {"start": float("inf"), "end": 0}
    for t in sorted(ts_list, reverse=True):
        if t - delta < coverage["start"]:
            print 'extracted', [t - delta, min(t, coverage["start"])]
            coverage = {"start": t - delta, "end": t}
            print 'coverage', coverage
