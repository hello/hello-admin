import json
import logging as log
import time
from api.calibration import AVG_CALIBRATED_ADC, BASE, K_FACTOR
from core.handlers.base import BaseCron
from google.appengine.api import taskqueue
from models.ext import DustCalibrationCheckPoint, DustCalibrationLeftOverPairs
from google.appengine.api import urlfetch

DUST_CALIBRATION_CHECKPOINT_KEY = "checkpoint"
MAX_RECENT_PAIRS_PAGES = 20

class DustCalibration(BaseCron):
    def calibrate(self, is_leftover):
        avg_dust_response = self.hello_request(
            api_url="calibration/average_dust/{}".format(self.request.get("account_id")),
            url_params={"sense_internal_id": int(self.request.get("internal_device_id"))},
            type="GET",
            raw_output=True
        )

        if avg_dust_response.error or not avg_dust_response.data:
            log.error(avg_dust_response.error)
            return

        if avg_dust_response.data.values()[0] == 0:
            reject_message = "Cron-bot rejects updating calibration because avg_dust last N days is 0 for {}".format(self.request.get("external_device_id"))
            log.info(reject_message)
            self.slack_pusher.send_to_dust_calibration_channel(reject_message)
            if not is_leftover:
                DustCalibrationLeftOverPairs(
                    id=self.request.get("external_device_id"),
                    account_id=int(self.request.get("account_id")),
                    internal_device_id=int(self.request.get("internal_device_id")),
                    external_device_id=self.request.get("external_device_id")
                ).put()
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
        if is_leftover:
            DustCalibrationLeftOverPairs.get_by_id(self.request.get("external_device_id")).key.delete()
        success_message = "Cron-bot has put a new calibration {}".format(body_data)
        log.info(success_message)
        self.slack_pusher.send_to_dust_calibration_channel(success_message)


class DustCalibrationUpdate(DustCalibration):
    def get(self):
        urlfetch.set_default_fetch_deadline(60)
        self.calibrate(False)


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

            recent_pairs += recent_pairs_response.data
            max_id = min([j.get("internal_device_id") for j in recent_pairs_response.data]) - 1

            if checkpoint is not None and max_id <= checkpoint.max_id:
                break

        if recent_pairs:
            DustCalibrationCheckPoint(
                id=DUST_CALIBRATION_CHECKPOINT_KEY,
                max_id=max([j.get("internal_device_id") for j in recent_pairs])
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
        attempt_messsage = "Cron-bot attempts to calibrate for {} pairs".format(len(uncalibrated_pairs))
        log.info(attempt_messsage)
        self.slack_pusher.send_to_dust_calibration_channel(attempt_messsage)
        for uncalibrated_pair in uncalibrated_pairs:
            taskqueue.add(
                url="/cron/dust_calibration_update",
                params=uncalibrated_pair,
                method="GET",
                queue_name="calibrate-recent-senses"
            )
        self.response.write(json.dumps(self.get_recent_pairs()))

class DustCalibrationLeftOverUpdate(DustCalibration):
    def get(self):
        urlfetch.set_default_fetch_deadline(60)
        self.calibrate(True)


class DustCalibrationLeftOverUpdateQueue(BaseCron):
    def get_leftover_pairs(self):
        return DustCalibrationLeftOverPairs.query()

    def get(self):
        leftover_pairs = self.get_leftover_pairs()
        log.info("Cron-bot attempts to calibrate for {} leftover pairs".format(leftover_pairs.count()))

        for leftover_pair in leftover_pairs:
            taskqueue.add(
                url="/cron/dust_calibration_leftover_update",
                params=leftover_pair.to_dict(),
                method="GET",
                queue_name="calibrate-leftover-senses"
            )
