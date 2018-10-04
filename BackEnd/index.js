const express = require('express');

const request = require('superagent');

const app = express();

const config = require('./src/config.js');

const port = 9292;


function githubPromise(url) {
    return request
        .get(url)
        .auth(config.GITHUB_USER, config.ACCESS_TOKEN)
        .set('Accept', 'application/vnd.github.v3+json')
        .then((response) => {
            if (response.statusCode === 200) {
                // Send response in object Format
                return response.body;
            }
            return null;
        })
        .catch((error) => { console.log('caught', error.message); });
}

function getAllRepos(url, retour) {
    var result;

    githubPromise(url)
        .then(response => retour.)
    console.log(result);
}

function createNewJSON(response) {
    const retour = {};
    retour['login'] = response.login;
    retour['name'] = response.name;
    retour['avatar'] = response.avatar_url;
    retour['repos'] = [];

    githubPromise(response.url)
        .then(respone)
    getAllRepos(response.repos_url, retour);

    return JSON.stringify(retour);
}

/* get username JSON */
app.get('/user/:username', (req, res) => {
    const username = req.params.username;
    let url = config.GITHUB_URL;
    url = `${url}users/${username}`;

    githubPromise(url)
        .then(response => res.send(createNewJSON(response)));
});


/* Get Repo JSON */
app.get('/repo/:name', (req, res) => {

});

app.get('/', (req, resp) => {
    resp.send('hello world');
});


const server = app.listen(port, () => {
    console.log('Listening on %d', server.address().port);
});
