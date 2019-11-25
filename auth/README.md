# Endpoints

## oauth2
The oauth2 directory is responsible for providing support of various 3rd party authtication services.

More documentation for this endpoint coming soon.

## App

```
POST /app/login
```
This endpoint will allow the app to log in and receive a JWT for subsequent requests. Even if it is not always necessary to log in the app, it is recommended to do so.

**Required Headers**

| Header | Description |
| --- | --- |
| App-Login | The app id and secret seperated by an ':' and encoded in base64 |

**Result Example**

```json
{
    "success": true,
    "message": "Logged in successfully!",
    "token": {
        "token": "hbOTDcoytghclRYSTIKTYDCytxUTEDXICRYR",
        "expires_in": "24h"
    }
}
```

If an error has occured the status code 400 will be return with the following body:

```json
{
    "error": "This will be the accompanying error message"
}
```

## User
Coming soon to this service

