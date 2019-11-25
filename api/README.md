# API
The API is responsible for delivering data to the webclients.
If you want to start the API seperatly (without docker) you can follow the steps in [Setup](#setup) and [Start](#start)

## Setup
To install all dependencies run the following command in the 'api' directory:
```
npm install
```

### Start
To start the API run the following command in the 'api' directory:
```
npm start
```

## Usage
The following endpoints are available for requesting:

### Queries

| Endpoint    | Arguments                    | Returns                             | Comments                                       |
| ----------- | -----------------------------|-------------------------------------|------------------------------------------------|
| user        | id/name/email,limit=10       | \[user\]                            | requires logged in admin user for now          |
| me          | None                         | user                                | requires logged user                           |
| publicToken | None                         | Client Credentials token for Spotify| [limited scope](https://developer.spotify.com/documentation/general/guides/authorization-guide/#client-credentials-flow)         |
| user        | id/name/ sid/mbid, limit=10  | \[Artist\]                          | 	id-format: “Artist/{number}”; use only one argument; limit only applies to name argument          |
| genre       |id/name, limit=10             | \[Genre\]                           | 	id-format: “Artist/{number}”; use only one argument; limit only applies to name argument          |


### Mutations

| Endpoint          | Arguments                                   | Returns                             | Comments                                        |
| ------------------| --------------------------------------------|-------------------------------------|------------------------------------------------ |
| login             | email                                       | { success, message, user, token }   | logs in a user                                  |
| signup            | user: { email, firstname, lastname, name }  | { success, message, user, token }   |                                                 |
| addroles          | id, roles []                                | success: Boolean                    | requires admin user                             |
| loginapp          | base                                        | { success, message, token }         | logs in the client                              |
| createfeedback    | feedback, email, type, group                | Boolean (represents success)        | argument feedback is required, the others aren’t|

## Authentication
There are two forms of authentication: user authentication and client authentication. These can both be used at the same time. Client authentication should be used at all times, but isn’t required in development mode.

### User Authentication

Shouldn’t be used yet, nothing is saved in the DB about the user as of yet.

To log in a user, send a login mutation to the API with the users email address. This will only work if the user already exists in the database.

If this returns { success: false }, send a signup mutation to the API containing an user-object:
``` 
user: {
    email,
    firstname,
    lastname,
    name
}
```
Both signup and login mutations have the same responseobject:
``` 
{
    success,
    message,
    user,
    token
}
```
This token is then to be used with every request in the ‘Authorization’ header. The structure of the header-content is ```Bearer ${token}```.


### Client Authentication

To log in the client send a ```loginapp``` mutation to the API. The base parameter needs to contain the App key and secret separated by a ':' and Base64 encoded. e.g.:  
```Buffer.from('key:secret').toString('base64')```

The mutation will return a token if successful.

After logged in, send a header with each request: ‘Client-Authentication’ with the value of the token the client received from the ```loginapp``` mutation.

