# TWEB_Projet_2018

## Prepare Dev Environment

Install [mongodb](https://www.mongodb.com/download-center?initial=true#community) and run the following command
(On Windows you must Add MongoDB binaries to the System PATH "C:\Program Files\MongoDB\Server\4.0\bin" and restart Visual Studio Code)

```{shell}
mongod --dbpath=./data/ --port 12345
```

Create a .env file in the root directory and add the following configuration
(You must install dotenv Visual Studio Code plugin)

```{java}
PORT='3000'
GITHUB_KEY='github_key'
GITHUB_SECRET='github_secret'
ACCESS_TOKEN='access_token'
GITHUB_URL='https://api.github.com/'
GITHUB_USER='user'
NODE_MODE='developement'
```

[Generate Tocken](https://blog.github.com/2013-05-16-personal-api-tokens/)
GITHUB_KEY : Github public key
GITHUB_SECRET : Github secret key
ACCESS_TOKEN : Github tocken
GITHUB_USER : Github user
NODE_MODE : Value "developement" or "production"

## Run server

Run this command in an other terminal

```{shell}
npm start
```

## Backend Node.js Server with use of github API

### To run this backEnd server, you need to first do a

```{shell}
npm install
```

#### 3 api call are possible

1. /user/:username where username is the github login of the one you want to stalk.
2. /repo/:owner/:repo_name where owner is the github login of the repository owner and repo_name the name of the repository
3. /repo/:name if you don't know the owner of a repo and want the server to search for some possible matches.

##### this will install all the needed dependencies. Then you will need to configure your DataBase configuration. For this you will use the .env file that you need to create in order to run this server
