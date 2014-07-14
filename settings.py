import os

DEBUG = True
ENVIRONMENT = 'prod'
CLIENT_ID = 'gae'

if os.environ['SERVER_SOFTWARE'].find('Development') == 0:
    DEBUG = False
    CLIENT_ID = 'dev'
    ENVIRONMENT = 'dev'