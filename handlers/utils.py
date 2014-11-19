import os
import sys
import logging as log
from datetime import datetime
import calendar
import pytz


utc_timezone = pytz.timezone("UTC")
local_timezone = pytz.timezone("America/Los_Angeles")
def display_error(e):
    """
    :param e: exception
    :type e: :class:Exception
    """
    message = repr(e) or 'Unknown error'
    exc_type, exc_obj, exc_tb = sys.exc_info()
    fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
    error = '{} - file {} - line {} - {}'.format(exc_type, fname, exc_tb.tb_lineno, message)\
        .replace("'", '').replace('"', '').strip()
    log.error(error)
    return error

def iso_to_utc_timestamp(iso_time):
    """
    :param iso_time: a time string in ISO8601 format, e.g.: '2007-03-04T21:08:12'
    :type iso_time: str
    :return utc time in milliseconds
    """
    return calendar.timegm(datetime.strptime(iso_time.split('Z')[0], "%Y-%m-%dT%H:%M:%S").timetuple())


def iso_to_datetime_obj(iso_time):
    """
    :param iso_time: a time string in ISO8601 format, e.g.: '2007-03-04T21:08:12'
    :type iso_time: str
    """
    return datetime.strptime(iso_time.split('Z')[0], "%Y-%m-%dT%H:%M:%S").replace(tzinfo=utc_timezone).astimezone(local_timezone)


def iso_to_human_timestring(iso_time):
    """
    :param iso_time: a time string in ISO8601 format, e.g.: '2007-03-04T21:08:12'
    :type iso_time: str
    """
    return datetime.strptime(iso_time.split('Z')[0], "%Y-%m-%dT%H:%M:%S").strftime("%m-%d-%Y %H:%M:%S")

