import logging as log
import datetime
import json
from google.appengine.api import namespace_manager

from core.handlers.base import ProtectedRequestHandler


class NamespaceAPI(ProtectedRequestHandler):
    def persist_namespace(self):
        forced_namespace = self.request.get("namespace")
        log.info('forced namespace'.format(forced_namespace))
        namespace_manager.set_namespace(forced_namespace)
        self.response.set_cookie('namespace', forced_namespace, expires=datetime.datetime.now() + datetime.timedelta(days=365))

    def get(self):
        log.info("User {} set namespace to be {}".format(self.current_user_email, self.request.get("namespace")))
        self.redirect("/")


class NamespaceAPIList(ProtectedRequestHandler):
    def get(self):
        context = self._extra_context({})
        self.response.write(json.dumps(context['available_namespaces']))

