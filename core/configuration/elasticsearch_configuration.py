from google.appengine.ext import ndb


class ElasticSearchConfiguration(ndb.Model):
    host=ndb.StringProperty(required=True)
    http_port=ndb.IntegerProperty(required=True)
    token=ndb.StringProperty(required=True)




