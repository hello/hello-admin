import os

DEBUG = False
ENVIRONMENT = 'prod'
CLIENT_ID = 'sense-admin'

PROD_CLIENT = 'sense-admin'
PROD_API = 'https://api.hello.is/v1/'

DEV_CLIENT = 'gae_admin'
DEV_API = 'http://localhost:9999/v1/'

if os.environ['SERVER_SOFTWARE'].find('Development') == 0:
    DEBUG = True
    CLIENT_ID = 'dev'
    ENVIRONMENT = 'dev'
