import json
from google.appengine.ext import ndb

DVT_PK = """-----BEGIN RSA PRIVATE KEY-----
MIICXAIBAAKBgQCnVQRSWEcHgjPbPLMB8jVA0HACtkSe2T9CRXmaQGLgXFrRqKdy
KSI/3zybWPwbslOi7fRemh2ulSqSLl8Sost4Ozj2Wg5r8NXa5J28tAXXk5tVCSBK
vmeVqT+Wead8yBvga1QSr1eBzS8QiPKDWmMgZPJyY/SuYXScOlAeckIIYQIDAQAB
AoGBAKRSYsoSkr4W6KG1O/z/Q7iAeF7RaxWrNen4m/AUpoS5bR5SxwzexBmBOd08
R2dTebqYfs+f/OIC7ilbjFWatL+oSU8PTg5YuT16Aprolry9nKeKw1W0CmmAoyGV
m55Nc3kRbl+eF1nzTvyWJVu36PSu9hP8R6yjtf+REhP9OjwZAkEA2MHtOC0J23ru
fuam/ez2Rf8UfvLn1kiD6/FOIqPRhUwHMiYIkigdw/asiq6QbMuhxxdPgd6cDGoP
4X8cs+BFrwJBAMWgXfmtRJ8AuyvzMWI9W9UWQtE9gqK/u39o1EYxDjMDX82NV5tO
yHKcal54s8/kJsOubjhlk0DlNT7yUfpHJu8CQEVyFFOMMn1MLH8h3Ny7/8c7S1DE
+DwyLXn5bMQyYh1n12JcxyA0lBzFulAQT5tbvnAv6rw8GxjrHj1r4UFMGGcCQH4h
0FjegYGKEewHF2nAB7CEuLibLZl6Dc1Ptsvl204rxSWIJHX3Xm/n7OvG1dzFnQgf
eDF+gvFUWRuHxVKbvvkCQDaXWtYmmhUL/7qxBwGlAkbNULaylVZhQQmLNhR13QTO
Gw37+ofFhVw4CQ1EvKymPvSf1QEkJ5zx9+8Xj1FbNX8=
-----END RSA PRIVATE KEY-----"""

PVT_PK = """-----BEGIN RSA PRIVATE KEY-----
MIICXQIBAAKBgQDMlMHAaB/SGajHzYI/TjoiN4vzpIis1UCUdskT5e8gyfCk7fja
xp55e1eL/iQtRTczIUUP5JSCw+n6tz2Qb/yQBUWQxhGcrSprvvLYhccStbFi6oej
a/ufukvc5SQdAoOCF9IZ/pTTSOGyNJAjVcA9uwmnbCZA+1TkiLGxtN7lswIDAQAB
AoGARvxGzlBS2j/1BH8WdojaOw0zDnNEyVOleN5OnwzlkGcBjPjVpHPOgTB/DCA+
xUaDBMbCg+U4crcv9MKoJfn1lBRJj8lqs/FQ4gUnKM/atJ04hA5I7rlw5aHr3F5G
Jn9qupVFlyLcMnvtNhWdUS+7leSWbH8hedfh9HfvO9+gyiECQQD1ocotem51kD4T
woDN185lIAUAZbMubssAfcMvpKO7ZEA2FONRM2ho4akcAPwMufXXMczuf0sZlL4k
gPFuOm1NAkEA1TdixjlGqy/eQaseleWUeGhIzwNOX4Hxphwc7VpQjWa+ZFORGBDj
JpyhRKasS1uBe4DXgFTyzfB2y4oYJNEe/wJBAO4wQHyPT5PDFt9UalCxZ1xai18S
P4nUOBg229JUZc1ubnHDGZeBMUsbIECel8vDfCh8C0xutaWNvkBppTSNhbUCQGAE
TiXoGyvyJYu7DM4CEidbBxa6bWvTL8hXNquolUfoMesqOtf0muaDeJha2pIhBiFg
9ysilikplcW5TYAe8G8CQQCBrS0YaQJq2TA437CTr77C6jrLGwDQc+trccxEesFl
k4Cv5Ae+CNMZWFr2AW8KJJY2w7F4SudBG9kbcnxxI3qT
-----END RSA PRIVATE KEY-----"""


class ZendeskCredentials(ndb.Model):
    domain = ndb.StringProperty(required=True, default="https://helloinc.zendesk.com")
    email_account = ndb.StringProperty(required=True, default="marina@sayhello.com")
    api_token = ndb.StringProperty(required=True, default="2qKOLrL5GbOva2LDOI4q4agcxplZ9GrycH1JqCMZ")


class SearchifyCredentials(ndb.Model):
    api_client = ndb.StringProperty(required=True, default="http://:G3KvEnaw2bDdQc@d7q83.api.searchify.com/")


class KeyStoreLocker(ndb.Model):

    private_key = ndb.TextProperty(required=True)

    @classmethod
    def get_secret(cls):
        return cls.query().order().fetch(1)

    @classmethod
    def create_defaults(cls):
        KeyStoreLocker(id="dvt", private_key=DVT_PK).put()
        KeyStoreLocker(id="mp", private_key="No PK").put()
        KeyStoreLocker(id="pvt", private_key=PVT_PK).put()

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
    api_key = ndb.StringProperty(required=True, default="738289f85e1593099c0a3e3ff600401e")
    senses_widget_id = ndb.StringProperty(required=True, default="125660-4507e07d-66c6-483c-8b01-7999f2233aa3")
    pills_widget_id = ndb.StringProperty(required=True, default="125660-2078c76d-65da-4d78-9375-129e757b18ad")
    senses_widget_id_external = ndb.StringProperty(required=True, default="78789-56e6c450-fac6-0133-0738-22000bca46d2")
    pills_widget_id_external = ndb.StringProperty(required=True, default="78789-f62d3540-faca-0133-a0a9-22000b4908e7")


class RecentlyActiveDevicesStats(ndb.Model):
    senses_zcount = ndb.IntegerProperty(required=True, indexed=False)
    pills_zcount = ndb.IntegerProperty(required=True, indexed=False)
    created_at = ndb.DateTimeProperty(auto_now_add=True)

    @classmethod
    def query_stats(cls, limit=30):
        return cls.query().order(-cls.created_at).fetch(limit)

    @classmethod
    def query_keys_by_created(cls, end_ts):
        return cls.query(cls.created_at < end_ts).order(-cls.created_at).fetch(keys_only=True)


class RecentlyActiveDevicesStatsDaily(ndb.Model):
    senses_zcount = ndb.IntegerProperty(required=True, indexed=False)
    pills_zcount = ndb.IntegerProperty(required=True, indexed=False)
    created_at = ndb.DateTimeProperty(auto_now_add=True)

    @classmethod
    def query_stats(cls, limit=30):
        return cls.query().order(-cls.created_at).fetch(limit)

    @classmethod
    def query_keys_by_created(cls, end_ts):
        return cls.query(cls.created_at < end_ts).order(-cls.created_at).fetch(keys_only=True)


class RecentlyActiveDevicesStats15Minutes(ndb.Model):
    senses_zcount = ndb.IntegerProperty(required=True, indexed=False)
    pills_zcount = ndb.IntegerProperty(required=True, indexed=False)
    created_at = ndb.DateTimeProperty(auto_now_add=True)

    @classmethod
    def query_stats(cls, limit=30):
        return cls.query().order(-cls.created_at).fetch(limit)

    @classmethod
    def query_keys_by_created(cls, end_ts):
        return cls.query(cls.created_at < end_ts).order(-cls.created_at).fetch(keys_only=True)


class SearchifyStats(ndb.Model):
    index_sizes = ndb.StringProperty(required=True, indexed=False)
    created_at = ndb.DateTimeProperty(auto_now_add=True)

    @classmethod
    def query_stats(cls, limit=None):
        return cls.query().order(-cls.created_at).fetch(limit)

    @classmethod
    def get_oldest_items_key(cls, limit=1):
        return cls.query().order(cls.created_at).fetch(limit, keys_only=True)


class SearchifyPurgeStats(ndb.Model):
    purge_size = ndb.IntegerProperty(required=True, indexed=False)
    index_name = ndb.StringProperty(required=True, indexed=False)
    level = ndb.StringProperty(required=True, indexed=False)
    created_at = ndb.DateTimeProperty(auto_now_add=True)

    @classmethod
    def query_stats(cls, limit=None):
        return cls.query().order(-cls.created_at).fetch(limit)

    @classmethod
    def query_keys_by_created(cls, end_ts):
        return cls.query(cls.created_at < end_ts).order(-cls.created_at).fetch(keys_only=True)

class OrdersMap(ndb.Model):
    url = ndb.StringProperty(required=True, default="https://hello-data.s3.amazonaws.com/preorders-exports/search-orders.json?AWSAccessKeyId=AKIAJNI44NR75TIPJLJA&Expires=1439409609&Signature=mJg6X5feSBbqy0ZSS3k8UARhFoY%3D")

class Clearbit(ndb.Model):
    token = ndb.StringProperty(required=True, indexed=True, default="d9b6441e8815f109870f5e0adfa90875")

class BuggyFirmware(ndb.Model):
    top_versions = ndb.StringProperty(required=True, indexed=False, default="0.7.2, 0.7.4, 0.7.5")
    middle_versions = ndb.StringProperty(required=True, indexed=False, default="")
    sense_ids = ndb.StringProperty(required=True, indexed=False, default="")


class LogsFacet(ndb.Model):
    date = ndb.StringProperty(required=True, indexed=True)
    pattern = ndb.StringProperty(required=True, indexed=True)
    middle_fw_version = ndb.StringProperty(required=True, indexed=False)
    count = ndb.IntegerProperty(required=True, indexed=False)
    created_at = ndb.DateTimeProperty(required=True, auto_now_add=True)

    @classmethod
    def get_by_date(cls, date):
        return cls.query(cls.date == date).order(-cls.created_at)

    @classmethod
    def get_by_date_as_dicts(cls, date):
        return [{
            "date": each.date,
            "pattern": each.pattern,
            "middle_fw_version": each.middle_fw_version,
            "count": each.count
        } for each in cls.get_by_date(date)]

    @classmethod
    def get_keys_by_date(cls, date):
        return cls.get_by_date(date).fetch(keys_only=True)

    @classmethod
    def delete_by_date(cls, date):
        return ndb.delete_multi(cls.get_keys_by_date(date))

    @classmethod
    def delete_all(cls):
        return ndb.delete_multi(cls.query().fetch(keys_only=True))


class DustCalibrationCheckPoint(ndb.Model):
    max_id = ndb.IntegerProperty(required=True, indexed=False)


class DustCalibrationLeftOverPairs(ndb.Model):
    account_id = ndb.IntegerProperty(required=True, indexed=False)
    internal_device_id = ndb.IntegerProperty(required=True, indexed=False)
    external_device_id = ndb.StringProperty(required=True, indexed=False)

