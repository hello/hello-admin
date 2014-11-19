from google.appengine.ext import ndb


class ZendeskCredentials(ndb.Model):
    domain = ndb.StringProperty(required=True)
    email_account = ndb.StringProperty(required=True)
    api_token = ndb.StringProperty(required=True)

    @classmethod
    def query_tokens(cls):
        return cls.query().fetch(1)


class SearchifyCredentials(ndb.Model):
    api_client = ndb.StringProperty(required=True)

    @classmethod
    def query_tokens(cls):
        return cls.query().fetch(1)

class ZendeskDailyStats(ndb.Model):
    new_tickets = ndb.IntegerProperty(required=True, indexed=False)
    solved_tickets = ndb.IntegerProperty(required=True, indexed=False)
    open_tickets = ndb.IntegerProperty(required=True, indexed=False)
    closed_tickets = ndb.IntegerProperty(required=True, indexed=False)
    created_at = ndb.DateTimeProperty(auto_now_add=True)

    @classmethod
    def query_stats(cls):
        return cls.query().order("-created_at").fetch(31)