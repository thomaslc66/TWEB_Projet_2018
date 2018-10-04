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
    let result;

    githubPromise(url)
        .then(response => response.body);
    console.log(result);
}

function createNewJSON(user) {
    return githubPromise(user.repos_url)
        .then((repos) => {
            const retour = {};
            retour.login = user.login;
            retour.name = user.name;
            retour.avatar = user.avatar_url;
            retour.repos = repos;
            return retour;
        });
}

/* get username JSON */
app.get('/user/:username', (req, res) => {
    const username = req.params.username;
    let url = config.GITHUB_URL;
    url = `${url}users/${username}`;

    githubPromise(url)
        .then(response => createNewJSON(response))
        .then(retour => res.send(retour));
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
