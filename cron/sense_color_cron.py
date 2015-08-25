import logging as log
from google.appengine.api import memcache, taskqueue
from handlers.helpers import BaseCron


class SenseColorUpdate(BaseCron):
    def get(self):
        acknowledge = self.hello_request(
            api_url="devices/color/{}".format(self.request.get("sense_id")),
            type="POST",
            raw_output=True
        ).data

        log.info("Updated color for sense {}, acknowledge : {}".format(self.request.get("sense_id"), acknowledge))

        colorless_size = self.request.get("total")

        memcache.incr(key="{}".format(colorless_size), delta=1)
        colored_size = memcache.get(key="{}".format(colorless_size))
        log.info("Updated color for {} out of {} senses".format(colored_size, colorless_size))


class SenseColorUpdateQueue(BaseCron):
    def get(self):
        colorless_senses = list(set(self.hello_request(
            api_url="devices/color/missing",
            type="GET",
            raw_output=True
        ).data))
        log.info("There are {} colorless senses".format(len(colorless_senses)))
        cached_log = {
            "key": "{}".format(len(colorless_senses)),
            "value": 0,
            "time": 24*3600
        }
        if memcache.get("sense_color_update") is None:
            memcache.add(**cached_log)
        else:
            memcache.set(**cached_log)
        for sense_id in colorless_senses:
            taskqueue.add(
                url="/cron/sense_color_update",
                params={
                    "sense_id": sense_id,
                    "total": len(colorless_senses)
                },
                method="GET",
                queue_name="sense-color-update"
            )