from collections import Counter, defaultdict
import os
import sys
import logging as log
from datetime import datetime
import calendar
import pytz
import time
from google.appengine.api import memcache


utc_timezone = pytz.timezone("UTC")
pacific_timezone = pytz.timezone("America/Los_Angeles")
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


def stripStringToList(string, separator=","):
    """
    :param string: a string that needs to be parsed into a list
    :type string: str
    :param separator: separator between elements of the string
    :type separator: str
    """
    return [u.strip() for u in string.split(separator)]


def get_current_pacific_datetime():
    return datetime.now(pacific_timezone)

def get_pacific_time_from_epoch_seconds(es):
    return datetime.fromtimestamp(es).replace(tzinfo=utc_timezone)\
                                              .astimezone(pacific_timezone).strftime("%d-%B-%Y %H:%M:%S %Z")


def extract_dicts_by_fields(dicts, fields):
    """
    :param dicts: a list of dicts (dict) that needs extraction
    :type dicts: list
    :param fields: a list of fields (str) that serve as filters
    :type fields: list
    """
    if not isinstance(dicts, list) or not isinstance(fields, list):
        raise TypeError("Expecting input as lists")
    return [{field: d.get(field, None) for field in fields} for d in dicts]

def epoch_to_human(ts):
    """
    :param ts: epoch timestamp
    :type ts: int
    :return humdan datetime string
    """
    return time.strftime("%Y/%m/%d %H:%M:%S %Z", time.localtime(ts/1000 if ts > 10**10 else ts))


def get_zendesk_stats(tickets):
    """
    :param tickets: list of ticket objects (dicts) returned by zendesk api
    :type tickets: list
    :return: dict
    """
    status_counter = Counter()
    recipient_counter = Counter()
    tickets_by_date = defaultdict(list)
    for t in tickets:
        status_counter += Counter([t['status']])
        recipient_counter += Counter([t['recipient']])
        created_date = t['created_at'].split('T')[0]
        tickets_by_date[created_date].append(t)

    output_data = {
        'total_breakdown': {
            'status': status_counter,
            'recipient': recipient_counter
        },
        'daily_breakdown': {},
        'bar_charts': {},
        'z': tickets[0]
    }

    for date, content in tickets_by_date.iteritems():
        status_counter_by_date = Counter()
        recipient_counter_by_date = Counter()
        for c in content:
            status_counter_by_date += Counter([c['status']])
            recipient_counter_by_date += Counter([c['recipient']])
        output_data['daily_breakdown'][date] = {
            'status': dict(status_counter_by_date),
            'recipient': dict(recipient_counter_by_date)
        }

    bingo_status = []
    for k in status_counter.keys():
        status_set = [{'x': date,
                       'y': stats['status'].get(k, 0)}
               for date, stats in output_data['daily_breakdown'].iteritems()]
        status_set = sorted(status_set, key=lambda t: int(time.mktime(time.strptime(t['x'], '%Y-%m-%d'))))
        bingo_status.append({'key': k or 'unknown status', 'values': status_set})
    bingo_recipient = []
    for k in recipient_counter.keys():
        recipient_set = [{'x': date, 'y': stats['recipient'].get(k, 0)}
               for date, stats in output_data['daily_breakdown'].iteritems()]
        bingo_recipient.append({'key': k or 'unknown recipient', 'values': recipient_set})
    output_data['bar_charts'] = {
        'status': bingo_status,
        'recipient': bingo_recipient
    }
    return output_data