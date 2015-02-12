### Hello Admin App
Internal Tools for Hello Team

[https://hello-admin.appspot.com/](https://hello-admin.appspot.com/)

Requires a @sayhello.com email address.
hello-admin is authorized through our Google Apps Account. If you want deploy changes, you need to be added to the list of administrators for the app. Let me (tim@sayhello.com) know and I'll add you.


### GAE Datastore
- Content:
  - AppInfo: Dev API endpoint
  - AdminUser: GAE admin user info
  - AccessToken: Store all tokens created on admin tools (alive or expired). 
  - KeyStoreLocker: Store confidential RSA PRIVATE KEY for sense provisioning
  - SearchifyCredentials: searchify API endpoint
  - UserGroup: control who can view what
  - ZendeskCredentials: zendesk API endpoint
  - ZendeskDailyStats: zendesk daily cron data

- Update Credentials
  - Visit: https://appengine.google.com/datastore/explorer?&app_id=s~hello-admin
  - Change AppInfo / AdminUser /   
  - Flush memcache !!!

- Populate Credentials (for local dev, esp. after your local java server connects to a new database)
  - Create AppInfo, AppUser, ZendeskCredentials, SearchifyCredentials by visiting localhost:8080/create/app_against_prod
  - Create group entity by visiting http://localhost:8080/api/create_groups
  - Create key store locker by visiting http://localhost:8080/api/create_key_store_locker
  - Update entities at http://localhost:8000/datastore (Port may not be 8000)
  - Flush memcache !!!
  - Finally, visit localhost:PORT/update
