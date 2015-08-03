import logging as log
from handlers.helpers import ProtectedRequestHandler
import datetime


class NamespaceAPI(ProtectedRequestHandler):
    def persist_namespace(self):
        forced_namespace = self.request.get("namespace")
        log.info('forced namespace'.format(forced_namespace))
        self.response.set_cookie('namespace', forced_namespace, expires=datetime.datetime.now() + datetime.timedelta(days=30))

    def get(self):
        log.info("User {} set namespace to be {}".format(self.current_user_email, self.request.get("namespace")))
        self.redirect("/")
