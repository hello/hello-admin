from google.appengine.ext import ndb
import settings


class AppInfo(ndb.Model):
    client_id = ndb.StringProperty(required=True)
    endpoint = ndb.StringProperty(required=True)
    access_token = ndb.StringProperty(required=True)
    created = ndb.DateTimeProperty(auto_now_add=True)
    env = ndb.StringProperty(default="new_api")


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
    super_firmware = ndb.StringProperty(required=True)
    token_maker=ndb.StringProperty(required=True)
    settings_moderator=ndb.StringProperty(required=True)
    shipping=ndb.StringProperty(required=True)
    contractor=ndb.StringProperty(required=True)
    created = ndb.DateTimeProperty(auto_now_add=True)
    namespace = ndb.StringProperty(required=True)

    @classmethod
    def create_defaults(cls, namespace):
        groups_data = {
            'super_engineer': 'long@sayhello.com, tim@sayhello.com, james@sayhello.com, kingshy@sayhello.com',
            'settings_moderator': 'chris@sayhello.com, kingshy@sayhello.com, jimmy@sayhello.com, km@sayhello.com',
            'token_maker': 'chris@sayhello.com, kingshy@sayhello.com, josef@sayhello.com, jimmy@sayhello.com, km@sayhello.com, benjo@sayhello.com, jingyun@sayhello.com, kevin@sayhello.com',
            'customer_experience': 'marina@sayhello.com, tim@sayhello.com, chrisl@sayhello.com, natalya@sayhello.com, kenny@sayhello.com, kevin@sayhello.com, cstemp@sayhello.com',
            'software': 'long@sayhello.com, tim@sayhello.com, james@sayhello.com, kingshy@sayhello.com',
            'hardware': 'scott@sayhello.com, ben@sayhello.com',
            'firmware': 'chris@sayhello.com, josef@sayhello.com, tim@sayhello.com, jchen@sayhello.com, jimmy@sayhello.com, benjo@sayhello.com, kevin@sayhello.com, jingyun@sayhello.com',
            'super_firmware': 'chris@sayhello.com, josef@sayhello.com, tim@sayhello.com',
            'shipping': 'marina@sayhello.com, chrisl@sayhello.com, bryan@sayhello.com, natalya@sayhello.com, tim@sayhello.com, kingshy@sayhello.com, kenny@sayhello.com, cstemp@sayhello.com',
            'contractor': 'customersupport@sayhello.com',
            'namespace': namespace
        }
        UserGroup(**groups_data).put()

