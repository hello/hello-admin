import json
import logging as log
import time
from core.handlers.base import BaseCron
from google.appengine.api import taskqueue


class DustCalibrationUpdate(BaseCron):
    def get(self):
        self.send_to_slack_admin_logs_channel("cron-bot has put a new calibration {}".format(self.request.body))
        self.hello_request(
            api_url="calibration",
            body_data=json.dumps({
                "tested_at": self.request.get("tested_at"),
                "sense_id": self.request.get("sense_id"),
                "dust_offset": self.request.get("dust_offset")
            }),
            type="PUT"
        )


class DustCalibrationUpdateQueue(BaseCron):
    def get_recent_pairs(self):
        recent_pairs_response = self.hello_request(
            api_url="account/recent_pairs",
            type="GET",
            url_params={
                "min_up_days": self.request.get("min_up_days", default_value=10),
                "limit": self.request.get("min_up_days", default_value=200),
                "max_id": self.request.get("max_id", default_value=1000000000000),
            },
            raw_output=True
        )
        if recent_pairs_response.error:
            log.error("Failed to get recent pairs {}".format(recent_pairs_response.error))
            return []

        return recent_pairs_response.data

    def get_calibration_batch(self, sense_ids):
        calibration_batch_response = self.hello_request(
            api_url="calibration",
            type="POST",
            body_data=json.dumps(sense_ids),
            raw_output=True
        )

        if calibration_batch_response.error:
            log.error("Failed to get calibration batch")
            return {}

        return calibration_batch_response.data

    def get_recent_uncalibrated_pairs(self):
        recent_pairs = self.get_recent_pairs()
        calibrated_map = self.get_calibration_batch([t.get("external_device_id") for t in recent_pairs])
        calibrated_sense_ids = calibrated_map.keys()

        uncalibrated_pairs = [t for t in recent_pairs if t.get("external_device_id") not in calibrated_sense_ids]
        return uncalibrated_pairs


    def make_calibration(self, uncalibrated_pairs):
        calibrations = []
        for uncalibrated_pair in uncalibrated_pairs:
            avgOffsetResponse = self.hello_request(
                api_url="calibration/average_dust/{}".format(uncalibrated_pair.get("account_id")),
                url_params={"sense_internal_id": uncalibrated_pair.get("internal_device_id")},
                type="GET",
                raw_output=True
            )
            if avgOffsetResponse.error or not avgOffsetResponse.data:
                break
            calibrations.append({
                "tested_at": int(time.time() * 1000),
                "sense_id": uncalibrated_pair.get("external_device_id"),
                "dust_offset": avgOffsetResponse.data.values()[0]
            })
        return calibrations

    def get(self):
        # Only calibrate for new senses which did not have calibration record and been online long enough
        uncalibrated_pairs = self.get_recent_uncalibrated_pairs()
        calibrations = self.make_calibration(uncalibrated_pairs)
        log.info("calibrations {}".format(calibrations))

        for calibration in calibrations:
            taskqueue.add(
                url="/cron/dust_calibration_update",
                params=calibration,
                method="GET",
                queue_name="calibrate-recent-senses"
            )
