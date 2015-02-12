import os

DEBUG = False
ENVIRONMENT = 'prod'
CLIENT_ID = 'gae'

PROD_CLIENT = 'gae_admin'
PROD_API = 'https://dev-api.hello.is/v1/'

DEV_CLIENT = 'gae_admin'
DEV_API = 'http://localhost:9999/v1/'

if os.environ['SERVER_SOFTWARE'].find('Development') == 0:
    DEBUG = True
    CLIENT_ID = 'dev'
    ENVIRONMENT = 'dev'
