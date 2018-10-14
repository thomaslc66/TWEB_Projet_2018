require('dotenv').config();

const express = require('express');

const Github = require('./src/Github');
const DataBase = require('./src/DataBase')
const assert = require('assert');

const app = express();
const port = process.env.PORT;
const db = new DataBase({});
const client = new Github({ token: process.env.ACCESS_TOKEN });

db.connect();

/* get username JSON */
app.get('/user/:username', (req, res) => {
    const username = req.params.username;
    const url = `${process.env.GITHUB_URL}users/${username}`;

    // call client.requestUser(username) to check if user exist in dataBase
    client.createUserJSON(url)
        .then((result) => {
            //db.userExists(result.login);
            if(result.error === 0){
                db.addUser(result);  
            }
            res.send(result);
        })
        .catch((err) => {
            console.log(err);
        });
});


/* Get Repo JSON */
app.get('/repo/:name', (req, res) => {
    const repo_name = req.params.name;
    const url = `${process.env.GITHUB_URL}search/repositories?q=${repo_name}`;

    client.createRepoJSON(url)
        .then((result) => {
            // connection to MangoDB
            //db.connect();
            //db.addUser(result);
            res.send(result)
        });
});

app.get('/', (req, resp) => {
    resp.send('hello world');
});


// 404 to Error Handler
app.use((req, res, next) => {
    const error = new Error('Not Found!');
    error.status = 404;
    next(error);
});

// Error Handler
app.use((err, req, res) => {
    console.error(err);
    res.status(err.status || 500);
    res.send(err.message);
});


app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
});
