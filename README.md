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

- Update Current Credentials
  1. Visit: https://appengine.google.com/datastore/explorer?&app_id=s~hello-admin
  2. Change AppInfo / AdminUser /   
  3. Flush memcache

- Populate Credentials (for local dev, esp. after your local java server connects to a new database)
  These following actions will wipe out the current datastore entities and create new defaults.
  1. Create AppInfo, AppUser, ZendeskCredentials, SearchifyCredentials by visiting localhost:8080/create/app_against_prod
  This action will initiate default entities for those essential credentials 
  2. Create group entity by visiting http://localhost:8080/api/create_groups
  This action will initiate default user groups (Firmware, Software, etc)
  3. Create key store locker by visiting http://localhost:8080/api/create_key_store_locker
  This action will initiate empty RSA private key for sense on dvt, pvt and mp phases.
  4. Update entities at http://localhost:8000/datastore (Port may not be 8000)
  5. Flush memcache
  6. Finally, visit localhost:PORT/update

### More setup
- Create New Apps:
  - Using current UI at : https://hello-admin.appspot.com/settings
  - If you can't get to that, you want to make a call to @POST https://hello-admin.appspot.com/api/app
      with `postData` = {
        "name": "app name"
        "scopes": ["scope1", "scope2"]
        description: "description",
        client_id: "clientId",
        client_secret: "clientSecret",
        redirect_uri: "redirect URL"
      } 
      with a token that has ADMINISTRATION_WRITE scope
  - If even above step doesn't work, make a call to @POST https://dev-api.hello.is/v1/applications
    with same `postData` pattern and token. 
- Create New Tokens For An User:
  - Using current UI at : https://hello-admin.appspot.com/settings
