import os
import sys
import logging as log

import pytz


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










def stripStringToList(string, separator=","):
    """
    :param string: a string that needs to be parsed into a list
    :type string: str
    :param separator: separator between elements of the string
    :type separator: str
    """
    return [u.strip() for u in string.split(separator)]







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




