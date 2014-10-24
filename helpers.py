import os
import sys
import logging as log


def display_error(e):
	message = repr(e) or 'Unknown error'
	exc_type, exc_obj, exc_tb = sys.exc_info()
	fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
	error = '{} - file {} - line {} - {}'.format(exc_type, fname, exc_tb.tb_lineno, message).replace('"', '').replace("'", "").strip()
	log.error(error)
	return error
