import calendar
from datetime import datetime

import time
from core.utils.common import utc_timezone, pacific_timezone


def iso_to_utc_timestamp(iso_time):
    """
    :param iso_time: a time string in ISO8601 format, e.g.: '2007-03-04T21:08:12'
    :type iso_time: str
    :return utc time in milliseconds
    """
    return calendar.timegm(datetime.strptime(iso_time.split('Z')[0], "%Y-%m-%dT%H:%M:%S").timetuple())


def iso_to_pacific_datetime_obj(iso_time):
    """
    :param iso_time: a time string in ISO8601 format, e.g.: '2007-03-04T21:08:12'
    :type iso_time: str
    """
    return datetime.strptime(iso_time.split('Z')[0], "%Y-%m-%dT%H:%M:%S").replace(tzinfo=utc_timezone).astimezone(pacific_timezone)


def iso_to_human_timestring(iso_time):
    """
    :param iso_time: a time string in ISO8601 format, e.g.: '2007-03-04T21:08:12'
    :type iso_time: str
    """
    return datetime.strptime(iso_time.split('Z')[0], "%Y-%m-%dT%H:%M:%S").strftime("%m-%d-%Y %H:%M:%S")


def get_current_pacific_datetime():
    return datetime.now(pacific_timezone)


def get_pacific_time_from_epoch_seconds(es):
    return datetime.fromtimestamp(es).replace(tzinfo=utc_timezone)\
                                              .astimezone(pacific_timezone).strftime("%d-%B-%Y %H:%M:%S %Z")


def epoch_to_human(ts):
    """
    :param ts: epoch timestamp
    :type ts: int
    :return humdan datetime string
    """
    return time.strftime("%Y/%m/%d %H:%M:%S %Z", time.localtime(ts/1000 if ts > 10**10 else ts))