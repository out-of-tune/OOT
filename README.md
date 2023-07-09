# out-of-tune
Out-of-tune (OOT) is a web application, that utilizes an interactive graph to visualize the world of music.  

Try the live demo here: https://app.out-of-tune.org
## What is the target audience of out-of-tune?
Every developer who is interested in data visualization and analysis should take a look at out-of-tune.
It might inspire them to use a graph-based approach for their own data visualization. 

## Table of Contents
- [out-of-tune](#out-of-tune)
  - [What is the target audience of out-of-tune?](#what-is-the-target-audience-of-out-of-tune)
  - [Table of Contents](#table-of-contents)
  - [Installing out-of-tune](#installing-out-of-tune)
  - [Used Technologies](#used-technologies)
    - [ArangoDB](#arangodb)
      - [Special features](#special-features)
      - [Efficiency](#efficiency)
      - [Evaluation](#evaluation)
    - [GraphQL](#graphql)
    - [VivaGraphJS](#vivagraphjs)
    - [VueJS](#vuejs)
  - [Service Structure](#service-structure)
    - [Reverse proxy](#reverse-proxy)
    - [Frontend Server/Client](#frontend-serverclient)
    - [Caching and Apollo (API)](#caching-and-apollo-api)
    - [Authentication](#authentication)
    - [ArangoDB](#arangodb-1)


## Installing out-of-tune

First you must install:
- Git
- Docker (with docker-compose)


Clone the out-of-tune repository from github.
```
git clone https://github.com/out-of-tune/OOT.git
```

You now have to configure your .env file. The best way to do this is just copy the sample.env file (in the root folder <b>AND</b> in the client folder of the repository) and rename it. 
```
cp .sample.env .env
```
But first you should enter a Spotify app key and Spotify app secret. You can get one here: https://developer.spotify.com/dashboard/applications  
Follow the instruction and add the key and secret to the .env file.

Now you can start the service by running:
```
docker-compose up --build
```

Add the CLIENT_KEY and CLIENT_SECRET to the database. To accomplish this, follow these steps: 
- Connect to the arango database (standard ip: localhost:8529) via browser
- Login with the credentials specified in the .env file
- Go to the correct database (as specified in the .env file)
- Add the following tuple to the APP collection: ```{key: "[CLIENT_KEY from .env]", secret: "[CLIENT_SECRET from .env]"}```

