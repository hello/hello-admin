from google.appengine.ext import ndb


class ElasticSearchConfiguration(ndb.Model):
    host=ndb.StringProperty(required=True)
    http_port=ndb.IntegerProperty(required=True)
    read_user=ndb.StringProperty(required=True)
    read_password=ndb.StringProperty(required=True)
    write_user=ndb.StringProperty(required=True)
    write_password=ndb.StringProperty(required=True)




