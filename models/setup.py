from google.appengine.ext import ndb


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
    created = ndb.DateTimeProperty(auto_now_add=True)

    @classmethod
    def query_tokens(cls):
        return cls.query().order(-cls.created).fetch(20)

