const request = require('superagent');

class ResponseError extends Error {
    constructor(res, body) {
        super(`${res.status} error requesting ${res.url}: ${res.statusText}`);
        this.status = res.status;
        this.path = res.url;
        this.body = body;
    }
}

/**
 * @class Github
 * @description Github class is the class that is used to call github api
 * and send json formated object to the client
 */
class Github {

    /**
     * @constructor - constructor of the Github Class
     * @param token - the token to the githubAPi 
     * @description - object constructor
     */
    constructor({ token} = {}) {
        this.token = token;
    }

    /**
     * @name githubPromise
     * @param {*} url - url of the api to parse
     * @returns - return a promise with a json object
     * @description - method to ask github for a json object
     */
    githubPromise(url) {
        return request
            .get(url)
            .auth(process.env.GITHUB_USER, process.env.ACCESS_TOKEN)
            .set('Accept', 'application/vnd.github.v3+json')
            .then((response) => {
                if (response.statusCode === 200) {
                    // Send response in object Format
                    return response.body;
                }
                return this.createErrorJSON();
            })
            // Error, user or repo not found
            .catch((error) => { 
                console.log('Error on GithubPromise: ', error.message); 
                return this.createErrorJSON();
            });
    }

    // Github url 
    getUrl(url) {
        return url.split('{')[0];
    }

    createRepoJSON(url) {
        return this.githubPromise(url)
            .then((repo) => {
                const urls = [];
                const promises = urls.map(urlParam => this.githubPromise(urlParam));
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

    /**
     * @function createUserJSON
     * @global generate a JSON for api
     * @param {*} url
     */
    createUserJSON(url) {
        return this.githubPromise(url)
            .then((user) => {
                // TODO add a way to manage error
                if(user.error === 1){
                    console.log('User not found');
                    return user;
                }else{
                    const starred_url = this.getUrl(user.starred_url);
                    const gists_url = this.getUrl(user.gists_url);
                    const following_url = this.getUrl(user.following_url);
                    const urls = [user.repos_url, user.followers_url, following_url, gists_url, starred_url, user.subscriptions_url];
                    const promises = urls.map(urlParam => this.githubPromise(urlParam));
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
                    }
            })
            .catch((err) => {
                console.log(err);
                return Promise.resolve(() => {
                    console.log('error');
                    this.createErrorJSON();
                });
            });
    }

    createErrorJSON(){
        return {
            error: 1,
            text: "not found",
        }; 
    }

}

module.exports = Github;
