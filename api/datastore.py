import json
import logging as log
import yaml

from google.appengine.api import namespace_manager
from core.models.authentication import ApiInfo, AVAILABLE_NAMESPACES
from core.handlers.base import BaseRequestHandler
from core.configuration.elasticsearch_configuration import ElasticSearchConfiguration
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
        with open("config.staging.yaml", "r") as stream:
            config_from_file = yaml.load(stream)
            namespace_manager.set_namespace(config_from_file.get("namespace"))
            ApiInfo(**config_from_file.get("api_info").get("admin")).put()
            ApiInfo(**config_from_file.get("api_info").get("app")).put()
            ApiInfo(**config_from_file.get("api_info").get("appv2")).put()

            Clearbit(**config_from_file.get("clear_bit")).put()
            ElasticSearchConfiguration(**config_from_file.get("elasticsearch_configuration")).put()
            SearchifyCredentials(**config_from_file.get("searchify_credentials")).put()
            ZendeskCredentials(**config_from_file.get("zendesk_credentials")).put()

            self.response.write(json.dumps(config_from_file))

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




