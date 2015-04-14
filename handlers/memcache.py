import settings
import json
import logging as log
from handlers.helpers import ProtectedRequestHandler
from models.setup import AppInfo
from models.setup import AdminUser
from models.setup import UserGroup
from models.ext import SearchifyCredentials
from models.ext import ZendeskCredentials
from models.ext import GeckoboardCredentials


class RefreshMemcache(ProtectedRequestHandler):
    def get(self):
        try:
            self.update_or_create_memcache(key="app_info", value=AppInfo.get_by_id(settings.ENVIRONMENT), environment=settings.ENVIRONMENT)
            self.update_or_create_memcache(key="admin_user", value=AdminUser.get_by_id(settings.ENVIRONMENT), environment=settings.ENVIRONMENT)
            self.update_or_create_memcache(key="searchify_credentials", value=SearchifyCredentials.query().get())
            self.update_or_create_memcache(key="zendesk_credentials", value=ZendeskCredentials.query().get())
            self.update_or_create_memcache(key="user_group", value=UserGroup.query().get())
            self.update_or_create_memcache(key="geckoboard_credentials", value=GeckoboardCredentials.query().get())
            log.info("Successfully refreshed memcache!")
        except Exception as e:
            self.response.write(json.dumps({"error": e.message}))
