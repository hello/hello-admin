import logging as log
from core.models.authentication import ApiInfo, AVAILABLE_NAMESPACES
from handlers.helpers import ProtectedRequestHandler


class InitializeDataStore(ProtectedRequestHandler):
    def get(self):
        if not self.request.get("all"):
            self.init_per_namespace(self.namespace)  # init datastore for current active namespace
        else:
            for namespace in AVAILABLE_NAMESPACES:
                self.init_per_namespace(namespace)

    def init_per_namespace(self, namespace):
        self.persist_namespace(namespace)
        self.init_api_info(namespace)
        log.info("Initialized datastore for namespace {}".format(namespace))

    @staticmethod
    def init_api_info(namespace):
        ApiInfo.create_defaults(namespace)


