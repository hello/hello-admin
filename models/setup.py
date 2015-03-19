from google.appengine.ext import ndb
import settings


class AppInfo(ndb.Model):
    client_id = ndb.StringProperty(required=True)
    endpoint = ndb.StringProperty(required=True)
    access_token = ndb.StringProperty(required=True)
    created = ndb.DateTimeProperty(auto_now_add=True)


class AdminUser(ndb.Model):
    username = ndb.StringProperty(required=True)
    password = ndb.StringProperty(required=True)
    created = ndb.DateTimeProperty(auto_now_add=True)


class AccessToken(ndb.Model):
    username = ndb.StringProperty(required=True)
    app = ndb.StringProperty(required=True)
    token = ndb.StringProperty(required=True)
    env = ndb.StringProperty(required=True)
    created = ndb.DateTimeProperty(auto_now_add=True)

    @classmethod
    def query_tokens(cls, username="", app=""):
        if not username and not app:
            return cls.query(cls.env == settings.ENVIRONMENT).order(-cls.created).fetch()
        elif username and app:
            return cls.query(cls.env == settings.ENVIRONMENT, cls.username == username, cls.app == app).order(-cls.created).fetch()
        elif username:
            return cls.query(cls.env == settings.ENVIRONMENT, cls.username == username).order(-cls.created).fetch()
        elif app:
            return cls.query(cls.env == settings.ENVIRONMENT, cls.app == app).order(-cls.created).fetch()
        else:
            return []


class UserGroup(ndb.Model):
    super_engineer = ndb.StringProperty(required=True)
    customer_experience = ndb.StringProperty(required=True)
    firmware = ndb.StringProperty(required=True)
    hardware = ndb.StringProperty(required=True)
    software = ndb.StringProperty(required=True)
    created = ndb.DateTimeProperty(auto_now_add=True)
