import json
import logging as log
import time
from api.calibration import AVG_CALIBRATED_ADC, BASE, K_FACTOR
from core.handlers.base import BaseCron
from google.appengine.api import taskqueue
from models.ext import DustCalibrationCheckPoint
from google.appengine.api import urlfetch

DUST_CALIBRATION_CHECKPOINT_KEY = "checkpoint"
MAX_RECENT_PAIRS_PAGES = 20

class DustCalibrationUpdate(BaseCron):
    def get(self):
        urlfetch.set_default_fetch_deadline(60)
        avg_dust_response = self.hello_request(
            api_url="calibration/average_dust/{}".format(self.request.get("account_id")),
            url_params={"sense_internal_id": self.request.get("internal_device_id")},
            type="GET",
            raw_output=True
        )

        if avg_dust_response.error or not avg_dust_response.data:
            log.error(avg_dust_response.error)
            return
        if avg_dust_response.data.values()[0] == 0:
            log.info("cron-bot reject updating calibration because avg_dust last N days is 0 for {}".format(self.request.get("external_device_id")))
            return

        adc_offset = int((AVG_CALIBRATED_ADC - avg_dust_response.data.values()[0] - BASE)/(-1 * K_FACTOR))
        body_data = json.dumps({
                "tested_at": int(time.time() * 1000),
                "sense_id": self.request.get("external_device_id"),
                "dust_offset": adc_offset
            })
        self.hello_request(
            api_url="calibration",
            body_data=body_data,
            type="PUT"
        )
        log.info("cron-bot has put a new calibration {}".format(body_data))


class DustCalibrationUpdateQueue(BaseCron):
    def get_recent_pairs(self):
        recent_pairs = []
        checkpoint = DustCalibrationCheckPoint.get_by_id(DUST_CALIBRATION_CHECKPOINT_KEY)
        max_id = None
        iter = 0
        while True:
            iter += 1
            if iter > MAX_RECENT_PAIRS_PAGES:
                log.warn("hitting ceiling pagination when getting recent pairs")
                break
            url_params = {
                "min_up_days": self.request.get("min_up_days", default_value=10),
                "limit": self.request.get("litmit", default_value=200),
            }
            if max_id:
                url_params["max_id"] = max_id
            recent_pairs_response = self.hello_request(
                api_url="account/recent_pairs",
                type="GET",
                url_params=url_params,
                raw_output=True
            )

            if not recent_pairs_response.data:
                break

            max_id = recent_pairs_response.data[-1].get("internal_device_id") - 1

            if checkpoint is not None and max_id <= checkpoint.max_id:
                break

            if not recent_pairs_response.error:
                recent_pairs += recent_pairs_response.data
        if recent_pairs:
            DustCalibrationCheckPoint(
                id=DUST_CALIBRATION_CHECKPOINT_KEY,
                max_id=recent_pairs[0].get("internal_device_id")
            ).put()
        return recent_pairs

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


    def get(self):
        # Only calibrate for new senses which did not have calibration record and been online long enough
        urlfetch.set_default_fetch_deadline(60)
        uncalibrated_pairs = self.get_recent_uncalibrated_pairs()
        if not uncalibrated_pairs:
            log.info("There is no sense in need of calibration in this job")
        log.info("Attempt to calibrate for {} pairs: {}".format(len(uncalibrated_pairs), uncalibrated_pairs))
        for uncalibrated_pair in uncalibrated_pairs:
            taskqueue.add(
                url="/cron/dust_calibration_update",
                params=uncalibrated_pair,
                method="GET",
                queue_name="calibrate-recent-senses"
            )