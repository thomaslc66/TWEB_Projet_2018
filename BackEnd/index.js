require('dotenv').config();

const express = require('express');

const MongoClient = require('mongodb').MongoClient;

const Github = require('./src/Github');
// const assert = require('assert');
//const config = require('./src/config.js');

const app = express();

const port = process.env.PORT;
console.log(port);

const dbUrl = 'mongodb://localhost:27017';

const dbName = 'githubApi';

const dbClient = new MongoClient(dbUrl);

const client = new Github({ token: process.env.ACCESS_TOKEN });


// connection to MangoDB
/* client.connect((err) => {
    assert.equal(null, err);
    console.log('Connected to DB => OK');
    const dataBase = client.db(dbName);
    client.close();
});
*/

/* get username JSON */
app.get('/user/:username', (req, res) => {
    const username = req.params.username;
    const url = `${process.env.GITHUB_URL}users/${username}`;

    client.createUserJSON(url)
        .then(result => res.send(result));
});


/* Get Repo JSON */
app.get('/repo/:name', (req, res) => {
    const repo_name = req.params.name;
    const url = `${process.env.GITHUB_URL}search/repositories?q=${name}`;

    client.createRepoJSON(url)
        .then(result => res.send(result));
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
