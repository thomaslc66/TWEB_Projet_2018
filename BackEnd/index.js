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

function getUrl(url) {
    return url.split('{')[0];
}

function createRepoJSON(url) {
    return githubPromise(url)
        .then((repo) => {
            const urls = [];
            const promises = urls.map(urlParam => githubPromise(urlParam));
            return promises.all(promises)
                .then((results) => {
                    const [] = results;
                    return {
                        repo_name: repo.name,
                    };
                });
        })
        .catch(err => console.log(err));
}

function createUserJSON(url) {
    return githubPromise(url)
        .then((user) => {
            const starred_url = getUrl(user.starred_url);
            const gists_url = getUrl(user.gists_url);
            const following_url = getUrl(user.following_url);
            const urls = [user.repos_url, user.followers_url, following_url, gists_url[0], starred_url, user.subscriptions_url];
            const promises = urls.map(urlParam => githubPromise(urlParam));
            return Promise.all(promises)
                .then((results) => {
                    const [repositories, followers_, following_, gists_, starred_, subscriptions_] = results;
                    return {
                        type: user.type,
                        id: user.id,
                        creationDate: user.created_at,
                        login: user.login,
                        name: user.name,
                        company: user.company,
                        location: user.location,
                        avatar: user.avatar_url,
                        followersCount: user.followers,
                        followers: followers_,
                        followingCount: user.following,
                        following: following_,
                        numberOfPublicRepos: user.public_repos,
                        repos: repositories,
                        subscriptions: subscriptions_,
                        numberOfGists: user.public_gists,
                        gists: gists_,
                        starredRepos: starred_,
                    };
                });
        })
        .catch(err => console.log(err));
}

/* get username JSON */
app.get('/user/:username', (req, res) => {
    const username = req.params.username;
    const url = `${config.GITHUB_URL}users/${username}`;

    createUserJSON(url)
        .then(result => res.send(result));
});


/* Get Repo JSON */
app.get('/repo/:name', (req, res) => {
    const repo_name = req.params.name;
    const url = `${config.GITHUB_URL}search/repositories?q=${name}`;

    createRepoJSON(url)
        .then(result => res.send(result));
});

app.get('/', (req, resp) => {
    resp.send('hello world');
});


const server = app.listen(port, () => {
    console.log('Listening on %d', server.address().port);
});
