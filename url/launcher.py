import webapp2
import settings
from url import cron_urls
from url import api_urls
from url import view_urls


cron = webapp2.WSGIApplication(
    routes= cron_urls.routes,
    debug=settings.DEBUG
)

main = webapp2.WSGIApplication(
    routes= api_urls.routes + view_urls.routes,
    debug=settings.DEBUG
)
