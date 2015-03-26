### Hello Admin App
Internal Tools for Hello Team

- dev version domain should always start with `dev`, i.e [https://dev-dot-hello-admin.appspot.com/](https://dev-dot-hello-admin.appspot.com/) which points to dev database
- env is auto-detected in [settings] (https://github.com/hello/hello-admin-app/blob/master/settings.py)
- **never** merge dev to master

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
  0. Generate a gae admin account like `gae@sayhello.com` by calling @POST /v1/account. See Registration class.
  0. Generate an OAuth application by calling @POST /v1/applications with 
    ```
    post_data = {
      "name": "GAE Admin app", 
      "client_id": "gae_admin", 
      "client_secret": "gae secret", 
      "redirect_uri": "https://hello-admin.appspot.com", 
      "scopes": ["AUTH", "ADMINISTRATION_READ", "ADMINISTRATION_WRITE"], 
      "description": "admin oauth app"
    }. 
    ```
    
    You need a token with scope ADMINISTRATION_WRITE but will realize tokens can only be created by calling @POST /v1/oauth2/token with a post data specifying client_id of the application which you don't currently have. Ask Tim to do deploy a soft API allowing you to **get_or_create** a token with any client_id, i.e. if the posted client_id doesn't belong to any known applications, that api will create a new application and return the token associated with it. In this case, we want a `gae_admin` token for `gae@sayhello.com`
    

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
    4. Above actions wipe out current entities and init defaults. 
      - You want to update them at https://appengine.google.com/datastore/explorer?&app_id=s~hello-admin. 
      - For admin_user: you want to use the created `gae@sayhello.com` account in step i
      - For app_info: you want to use  the created `gae_admin` application created in step ii
      - For RSA keys, you want to use https://setup-dot-hello-admin.appspot.com/provision because GAE doesn't allow text changes on prod
    5. **Flush memcache**
    6. Finally, visit https://setup-dot-hello-admin.appspot.com/update
  6. Remember not to check the changes in step iii in master because we want restriction on all other versions. It maybe a good idea to keep a `setup` version around just in case.
  7. AccessToken entities in datastore need to be purged: All the expired tokens there need to be removed, otherwise we may keep calling java server using dead tokens (esp. after a migration).

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


### Deploy API server
- Commit changes to suripu 
- Make sure config is right in .yml files
- Merge, after the build is done, the scripts will be uploaded s3 
- Run [scripts/deploy.sh](https://github.com/hello/hello-admin-app/blob/master/scripts/deploy.sh) to download it, update symlink, update config and restart suripu-admin

