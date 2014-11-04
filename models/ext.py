from google.appengine.ext import ndb


class ZendeskCredentials(ndb.Model):
    domain = ndb.StringProperty(required=True)
    email_account = ndb.StringProperty(required=True)
    api_token = ndb.StringProperty(required=True)

    @classmethod
    def query_tokens(cls):
        return cls.query().fetch(1)