import json
import logging as log

__author__ = 'zet'


class ResponseOutput(object):
    def __init__(self, data=[], error="", status=501, viewer=""):
        self.data = data
        self.error = error
        self.status = status
        self.viewer = viewer

    def set_data(self, data):
        if not isinstance(data, list) and not isinstance(data, dict):
            log.warning("Response data is neither a list nor a dict")
        self.data = data

    def set_error(self, error):
        if not isinstance(error, str):
            raise TypeError("Response error must be a string")
        self.error = error

    def set_status(self, status):
        if not isinstance(status, int) and not isinstance(status, long):
            raise TypeError("Response status must be an int or a longs")
        self.status = status

    def set_viewer(self, viewer):
        if not isinstance(viewer, str):
            raise TypeError("Viewer must be a string")
        self.viewer = viewer

    def get_serialized_output(self):
        return json.dumps({
            'data': self.data,
            'error': self.error,
            'status': self.status,
            'viewer': self.viewer
        })