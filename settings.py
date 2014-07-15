import os

DEBUG = False
ENVIRONMENT = 'prod'
CLIENT_ID = 'gae'

if os.environ['SERVER_SOFTWARE'].find('Development') == 0:
    DEBUG = True
    CLIENT_ID = 'dev'
    ENVIRONMENT = 'dev'