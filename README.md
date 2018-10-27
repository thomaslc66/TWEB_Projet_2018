# TWEB_Projet_2018

This project is part of the TWEB 2018 cours. The goal was to use the github API and create an app with a Backend server and a frontend (GUI).

Our project is a standard use of the github API. With this app, you can search for user and display a lot of info on a specific user.
Like a Who Is but for github user. This github Repo is in fact the backend that call the github API and send back the Json value used in the frontend.
This project can be fork and updated if you want it to display more or less infos on the user. You will find a tutorial to deploy the app on Heroku, or your local server.

## Prepare for local environnement

1) Install [mongodb](https://www.mongodb.com/download-center?initial=true#community) and run the following command
(On Windows you must Add MongoDB binaries to the System PATH "C:\Program Files\MongoDB\Server\4.0\bin" and restart Visual Studio Code)

```shell
mongod --dbpath=./data/ --port 12345
```

Not that the DB il local is running on port: 12345
You alson need to create a folder named "data" in the root of the directory

2) Create a .env file in the root directory and add the following configuration
(You must install dotenv Visual Studio Code plugin)

```java
PORT='3000'
ACCESS_TOKEN='access_token'
GITHUB_URL='https://api.github.com/'
NODE_MODE='developement'
```
Link to generate a Github Access Token:
[Generate Tocken](https://blog.github.com/2013-05-16-personal-api-tokens/)

ACCESS_TOKEN : Github token
NODE_MODE : Value "test, "developement" or "production"

Add this option to VSCode User Setting json

```json
  "workbench.iconTheme": "vscode-icons",
  "editor.formatOnSave": true,
  "eslint.autoFixOnSave": true,
  "eslint.alwaysShowStatus": true,
  "prettier.eslintIntegration": true,
  "prettier.disableLanguages": ["js"],
  "files.autoSave": "onFocusChange"
```

## Before first Run of server

Run this command a terminal to install all dependencies

```shell
npm install
```


## Run server

Then you can run this command in an other terminal

```shell
npm start
```

## Backend Node.js Server with use of github API and Mongo DB (local)

#### Api Call

You can use this route to ask for the github info on a user.

1. /user/:username where username is the github login of the one you want to stalk.

exemple: 
```shell
localhost:3000/user/testuser
```

This call will return you a Json table with multiple information.

```javascript
  {
    error: 0,
    query_date: "2018-10-27T10:55:20.283Z",
    type: "User",
    id: 9827392,
    creation_date: "2014-11-18T18:14:13Z",
    login: "thomaslc66",
    name: null,
    company: null,
    location: null,
    avatar: "https://avatars0.githubusercontent.com/u/9827392?v=4",
    followers_count: 6,
    following_count: 6,
    public_repos_number: 24,
    five_best_repo: [
      {
        repo_name: "sye_labo5",
        repo_url: "https://api.github.com/repos/thomaslc66/sye_labo5",
        watchers_count: 0,
        stars_count: 0,
        forks_count: 1
      },
      {
        repo_name: "Plex_Media",
        repo_url: "https://api.github.com/repos/thomaslc66/Plex_Media",
        watchers_count: 0,
        stars_count: 0,
        forks_count: 0
      },
      {
        repo_name: "AndroidCyclingTrainer",
        repo_url: "https://api.github.com/repos/thomaslc66/AndroidCyclingTrainer",
        watchers_count: 0,
        stars_count: 0,
        forks_count: 0
      },
      {
        repo_name: "ArmagetronServer",
        repo_url: "https://api.github.com/repos/thomaslc66/ArmagetronServer",
        watchers_count: 0,
        stars_count: 0,
        forks_count: 0
      },
      {
        repo_name: "ASD1_Labo3",
        repo_url: "https://api.github.com/repos/thomaslc66/ASD1_Labo3",
        watchers_count: 0,
        stars_count: 0,
        forks_count: 0
      }
      ],
      language_used: {
        C++: 3,
        Java: 11,
        HTML: 3,
        null: 2,
        PHP: 1,
        CSS: 1,
        Python: 1,
        C: 1,
        JavaScript: 1
        }
}
```

This Json object will be saved the first time into the MongoDb using the Mongoose dependecy.

This will also generate a cache user value saved in the db using the date the first query on this user was made.
If the cache time (you can change it to suits your needs) is still less than the query date, the Json will be served from the DB.

Otherwise if the cache time is more, then a new call to the Github API will be made and the user will be updated in the DB.



## Backend Node.js Server with use of github API and Mongo DB (Production)

A simple way to deploy this app is with Heroku.

1) Fork this github repo
2) Go to Heroku website and register or login in
3) create a new app in heroku admin panel and link it to your github reop (forked)
4) A good thing to do is: in the package.json file add in the start scirpt (npm install)
```shell
  "scripts": {
    "start": "npm install && node index.js",
    "test": "nyc --reporter=text --reporter=html mocha"
  },
  ```
  5) go into the app setting. From here you need to set the env variables for your heroku app.
  6) You need to add one by one those env. variables with your personal token
  ```java
PORT='3000'
ACCESS_TOKEN='access_token'
GITHUB_URL='https://api.github.com/'
NODE_MODE='production'
```
  7) You can now enable the automatic deploy or deploy the app manualy.
  8) go to your app website and check the app with a user.
