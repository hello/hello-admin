from google.appengine.ext import ndb
import datetime


class ZendeskCredentials(ndb.Model):
    domain = ndb.StringProperty(required=True)
    email_account = ndb.StringProperty(required=True)
    api_token = ndb.StringProperty(required=True)


class SearchifyCredentials(ndb.Model):
    api_client = ndb.StringProperty(required=True)


class KeyStoreLocker(ndb.Model):
    private_key = ndb.TextProperty(required=True)

    @classmethod
    def get_secret(cls):
        return cls.query().order().fetch(1)


class ZendeskDailyStats(ndb.Model):
    new_tickets = ndb.IntegerProperty(required=True, indexed=False)
    solved_tickets = ndb.IntegerProperty(required=True, indexed=False)
    open_tickets = ndb.IntegerProperty(required=True, indexed=False)
    pending_tickets = ndb.IntegerProperty(required=True, indexed=False)
    closed_tickets = ndb.IntegerProperty(required=True, indexed=False)
    created_at = ndb.DateTimeProperty(auto_now_add=True)

    @classmethod
    def query_stats(cls, limit=None):
        return cls.query().order(-cls.created_at).fetch(limit)


class GeckoboardCredentials(ndb.Model):
    api_key = ndb.StringProperty(required=True)
    senses_widget_id = ndb.StringProperty(required=True)
    pills_widget_id = ndb.StringProperty(required=True)


class RecentlyActiveDevicesStats(ndb.Model):
    senses_zcount = ndb.IntegerProperty(required=True, indexed=False)
    pills_zcount = ndb.IntegerProperty(required=True, indexed=False)
    created_at = ndb.DateTimeProperty(auto_now_add=True)

    @classmethod
    def query_stats(cls, limit=None):
        return cls.query().order(-cls.created_at).fetch(limit)

    @classmethod
    def query_keys_by_created(cls, end_ts):
        return cls.query(cls.created_at < end_ts).order(-cls.created_at).fetch(keys_only=True)
