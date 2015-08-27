import logging as log

from google.appengine.api import namespace_manager

from core.models.authentication import ApiInfo, AVAILABLE_NAMESPACES
from core.handlers.base import BaseRequestHandler
from models.ext import ZendeskCredentials, SearchifyCredentials, KeyStoreLocker, GeckoboardCredentials, OrdersMap, \
    Clearbit, BuggyFirmware
from models.setup import UserGroup


class InitializeDataStore(BaseRequestHandler):
    def persist_namespace(self):
        pass

    def get(self):
        if not self.request.get("all"):
            self.init_per_namespace(self.namespace)  # init datastore for current active namespace
        else:
            for namespace in ["dev"] + AVAILABLE_NAMESPACES:
                self.init_per_namespace(namespace)

    def init_per_namespace(self, namespace):
        namespace_manager.set_namespace(namespace)

        self.init_api_info(namespace)
        self.init_user_group(namespace)
        self.init_zendesk_credentials()
        self.init_searchify_credentials()
        self.init_key_store_locker()
        self.init_geckoboard_credentials()
        self.init_orders_map()
        self.init_clearbit()
        self.init_buggy_firmware()

        log.info("Initialized datastore for namespace {}".format(namespace))

    @staticmethod
    def init_api_info(namespace):
        ApiInfo.create_defaults(namespace)

    @staticmethod
    def init_user_group(namespace):
        UserGroup.create_defaults(namespace)

    @staticmethod
    def init_zendesk_credentials():
        ZendeskCredentials().put()

    @staticmethod
    def init_searchify_credentials():
        SearchifyCredentials().put()

    @staticmethod
    def init_key_store_locker():
        KeyStoreLocker.create_defaults()

    @staticmethod
    def init_geckoboard_credentials():
        GeckoboardCredentials().put()

    @staticmethod
    def init_orders_map():
        OrdersMap().put()

    @staticmethod
    def init_clearbit():
        Clearbit().put()

    @staticmethod
    def init_buggy_firmware():
        BuggyFirmware().put()




