from core.handlers.base import ProtectedRequestHandler


class LastHeartbeatAPI(ProtectedRequestHandler):
    def get(self):
        self.hello_request(
            api_url="pill/heartbeat/{}".format(self.request.get("pill_id")),
            type="GET",
        )


class HeartbeatsAPI(ProtectedRequestHandler):
    def get(self):
        raw_pill_heartbeat_response = self.hello_request(
            api_url="pill/heartbeats",
            url_params={
                "email": self.request.get("email", default_value=None),
                "pill_id_partial": self.request.get("pill_id_partial", default_value=None),
                "start_ts": self.request.get("ts", default_value=None)
            },
            type="GET",
            raw_output=True
        )
        raw_values = raw_pill_heartbeat_response.data.values()
        for each in raw_values:
            for r in each:
                r['last_seen'] = r['created_at']
                r['device_id'] = r['pill_id']
                r['id'] = r['pill_id']

        raw_pill_heartbeat_response.set_data(raw_values)
        self.response.write(raw_pill_heartbeat_response.get_serialized_output())


class LatestPillsAPI(ProtectedRequestHandler):
    def get(self):
        self.hello_request(
            api_url="pill/latest/pair",
            type="GET",
            url_params={
                "max_id": self.request.get("max_id", default_value=1000000),
                "limit": self.request.get("limit", default_value=20)
            }
        )


class LatestPillsDataAPI(ProtectedRequestHandler):
    def get(self):
        self.hello_request(
            api_url="pill/latest/data",
            type="GET",
            url_params={
                "max_id": self.request.get("max_id", default_value=1000000),
                "limit": self.request.get("limit", default_value=20)
            }
        )