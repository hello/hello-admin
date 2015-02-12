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

### Setup

- Populate Credentials for Local: Goto http://localhost:8080/setup
- Populate Credentials for Prod:
  1. Go to https://github.com/hello/hello-admin-app/blob/master/handlers/helpers.py#L200 to edit method `__init__(self, request, response)` of class ProtectedRequestHandler
  2. Comment these 2 lines out:
    
    ```
      if settings.DEBUG is False:
          self.restrict()
    ```
  3. Deploy the change to a version, let's say `setup` (Set `version: setup` at `app.yaml` before deploying)
  4. Follow instruction at https://setup-dot-hello-admin.appspot.com/setup
  5. If you can't get to https://setup-dot-hello-admin.appspot.com/setup, do:
    1. Create AppInfo, AppUser, ZendeskCredentials, SearchifyCredentials by visiting https://setup-dot-hello-admin.appspot.com/api/setup
    2. If needed, recreate user-group entity by visiting https://setup-dot-hello-admin.appspot.com/api/create_groups 
    3. If needed, recreate key store locker by visiting https://setup-dot-hello-admin.appspot.com/api/create_key_store_locker
    4. Above actions wipe out current entities and init defaults. You want to update them at https://appengine.google.com/datastore/explorer?&app_id=s~hello-admin. For RSA keys, you want to use https://setup-dot-hello-admin.appspot.com/provision because GAE doesn't allow text changes on prod
    5. **Flush memcache**
    6. Finally, visit https://setup-dot-hello-admin.appspot.com/update
    7. Remember not to check the changes in step 2 in master because we want restriction on all other versions. It maybe a good idea to keep a `setup` version around just in case.

- Update Current Credentials
  1. Visit: https://appengine.google.com/datastore/explorer?&app_id=s~hello-admin
  2. Change AppInfo / AdminUser /   
  3. **Flush memcache**
 

### More setup
- Create Additional Apps:
  - Using current UI at : https://hello-admin.appspot.com/settings
  - If you can't get to that, you want to make a call to  @POST https://dev-api.hello.is/v1/applications
      with `postData` = {
        "name": "app name"
        "scopes": ["scope1", "scope2"]
        "description": "description",
        "client_id": "clientId",
        "client_secret": "clientSecret",
        "redirect_uri": "redirect URL"
      } 
      with a token that has ADMINISTRATION_WRITE scope
- Create new tokens for an user:
  - Using current UI at : https://hello-admin.appspot.com/settings
- View saved tokens per app/user
  - https://hello-admin.appspot.com/api/tokens/?app=admin-data-viewer
  - https://hello-admin.appspot.com/api/tokens/?username=tim@home.com
  - https://hello-admin.appspot.com/api/tokens/?app=admin-data-viewer&username=kdm3@sayhello.com

