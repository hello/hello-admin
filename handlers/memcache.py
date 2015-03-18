import settings
import logging as log
from handlers.helpers import BaseRequestHandler
from models.setup import AppInfo
from models.setup import AdminUser
from models.setup import UserGroup
from models.ext import SearchifyCredentials
from models.ext import ZendeskCredentials


class RefreshMemcache(BaseRequestHandler):
    def get(self):
        try:
            self.update_or_create_memcache(key="app_info", value=AppInfo.get_by_id(settings.ENVIRONMENT), environment=settings.ENVIRONMENT)
            self.update_or_create_memcache(key="admin_user", value=AdminUser.get_by_id(settings.ENVIRONMENT), environment=settings.ENVIRONMENT)
            self.update_or_create_memcache(key="searchify_credentials", value=SearchifyCredentials.query().get())
            self.update_or_create_memcache(key="zendesk_credentials", value=ZendeskCredentials.query().get())
            self.update_or_create_memcache(key="user_group", value=UserGroup.query().get())
            log.info("Successfully refreshed memcache!")
        except Exception as e:
            self.error(e.message)
        self.redirect("/")