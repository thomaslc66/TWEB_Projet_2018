if(process.env.NODE_MODE !== 'production'){
    require('dotenv').config();
}

const express = require('express');
const assert = require('assert');
const cors = require('cors');

const Github = require('./src/Github');
const DataBase = require('./src/DataBase')

const app = express();
const port = process.env.PORT || 3000;

const db = new DataBase({});
const client = new Github({ token: process.env.ACCESS_TOKEN });

//TODO Uncomment if you want to use the DB
db.connect();

/********************************************************
 * Express route to ask for a user
 ********************************************************/
app.get('/user/:username', cors(), (req, res) => {
    const username = req.params.username;
    const url = `${process.env.GITHUB_URL}users/${username}`;

    //check if user is in dataBase
    if(db.checkUser(username)){
        //call to getUser -> from DataBase
        res.send(db.getUser(username));
    }else{
        //call to createUserJson -> github Api
        client.createUserJSON(url)
        .then((result) => {
            if(result.error === 0){
                db.addUser(result);  
            }
            res.send(result);
        })
        .catch((err) => {
            console.log(err);
        });
    }
});


/********************************************************
 * Express route to ask for a repository
 ********************************************************/
app.get('/repo/:owner/:name', (req, res) => {
    const repoName = req.params.name;
    const owner = req.params.owner;
    const url = `${process.env.GITHUB_URL}repos/${owner}/${repoName}`;

    client.createRepoJSON(url)
        .then((result) => {
            // connection to MangoDB
            //db.connect();
            //db.addUser(result);
            res.send(result)
        });
});

/********************************************************
 * Search for a repository when you don't know the user
 ********************************************************/
app.get('/repo/:name', (req, res) => {
    const repo_name = req.params.name;
    const url = `${process.env.GITHUB_URL}search/repositories?q=${repo_name}`;

    client.createSearchResultJSON(url)
        .then((result) => {
            res.send(result)
        });
});

/********************************************************
 * Default route
 ********************************************************/
app.get('/', (req, resp) => {
    resp.send('{}');
});


/********************************************************
 * Error when route not foud
 ********************************************************/
app.use((req, res, next) => {
    const error = new Error('Route not Found!');
    error.status = 404;
    next(error);
});

/********************************************************
 * Error Handler
 ********************************************************/
app.use((err, req, res) => {
    console.error(err);
    res.status(err.status || 500);
    res.send(err.message);
});


/********************************************************
 * app start 
 ********************************************************/
app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
});
