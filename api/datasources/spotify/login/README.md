# Login Documentation

## Spotify OAuth
Here the usage of the Spotify OAuth Endpoint will be described.

### Getting the redirect-url
```
GET /login/spotify/
```
This GET-request will return an url the client can redirect to link the Spotify account



There is one optional parameter for this endpoint:
 - uri: the url the server will redirect to in the end after receiving the tokens in an url-encoded format. Any parameters this url has will be returned in addition to the refresh_token and access_token.

The following happens when the client redirects to the url provided by this endpoint:
The access_token and refresh_token will be returned by redirecting to the client website and putting the refresh_token and the access_token in the request/redirect url in a GET-format.

### Refreshing the token
```
GET /login/spotify/refresh/
```
This GET-request will use the refresh_token (provided by the client) and return the new access_token and new refresh_token in a JSON format.
