##Hello Admin App

UI for account creation and access token generation.

[https://hello-admin.appspot.com/](https://hello-admin.appspot.com/)

Requires a @sayhello.com email address.
hello-admin is authorized through our Google Apps Account. If you want deploy changes, you need to be added to the list of administrators for the app. Let me (tim@sayhello.com) now and I'll add you.


###How-to

1. Visit [https://hello-admin.appspot.com/create/app](https://hello-admin.appspot.com/create/app). This will create two entities in the datastore: `UserAdmin` and `AppInfo`. Both entities have been created with dummy values.
2. Visit [https://appengine.google.com/datastore/explorer?&app_id=s~hello-admin](https://appengine.google.com/datastore/explorer?&app_id=s~hello-admin) and update the dummy values with the correct endpoint, client_id, username and password. Don't forget to flush memcache.
3. Visit [https://hello-admin.appspot.com/update](https://hello-admin.appspot.com/update) and if everything works properly you should be redirected to the home page from which you can now choose to generate tokens for a specific app.