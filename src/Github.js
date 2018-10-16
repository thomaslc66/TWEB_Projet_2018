const request = require('superagent');

class ResponseError extends Error {
    constructor(res, body) {
        super(`${res.status} error requesting ${res.url}: ${res.statusText}`);
        this.status = res.status;
        this.path = res.url;
        this.body = body;
    }
}

/**************************************************************
 * 
 * @class Github
 * @description Github class is the class that is used to call github api
 * and send json formated object to the client
 * 
 **************************************************************/
class Github {

    /**********************************************************
     * @constructor - constructor of the Github Class
     * @param token - the token to the githubAPi 
     * @description - object constructor
     ***********************************************************/
    constructor({ token} = {}) {
        this.token = token;
    }

    /**************************************************************
     * 
     * @name githubPromise
     * @param {*} url - url of the api to parse
     * @returns - return a promise with a json object
     * @description - method to ask github for a json object
     * 
     *************************************************************/
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

    /**********************************************************
     * 
     * @function getUrl
     * @param {*} url the url we want to split
     * @description return the url without the unessary parts
     * 
     ************************************************************/
    getUrl(url) {
        return url.split('{')[0];
    }

    /***************************************************************************
     * 
     * @function createErrorJSON
     * @description create and return a Json in case of error during api request
     * @returns return a JSON with and error and a text
     * 
     ****************************************************************************/
    createErrorJSON(){
        return {
            error: 1,
            text: "not found",
        }; 
    }

    /* -------------------------------- REPO PART --------------------------- */

    /********************************************************
     * @function createRepoJSON
     * @global generate a JSON form api for a repository
     * @param {*} url
     * @returns Json Object with usefull repository information
     ********************************************************/
    createRepoJSON(url) {
        // TODO can't call githubPromises because repo with same name are sended back from github in an array object
        return this.githubPromise(url)
            .then((repo) => {
                if(repo.error === 1){
                    console.log('Repository not found');
                    return repo;
                }else{
                    const urls = [];
                    const promises = urls.map(urlParam => this.githubPromise(urlParam));
                    return Promise.all(promises)
                        .then((results) => {
                            const [] = results;
                            return {
                                //add what you need to display
                                error: 0,
                                repo_name: repo.name,
                                owner_login: repo.owner.login,
                                owner_avatar: repo.owner.avatar_url 
                            };
                        });
                    
                }
            })
            .catch(err => {
                console.log(err);
                return this.createErrorJSON();
            });
    }

    /********************************************************
     * @function createSearchResultJSON
     * @global generate a list of possible repository when you don't know the owner
     * @param {*} url
     * @returns Json Object with usefull repository information
     ********************************************************/
    createSearchResultJSON(url) {
        // TODO can't call githubPromises because repo with same name are sended back from github in an array object
        return this.githubPromise(url)
            .then((repo) => {
                if(repo.error === 1){
                    console.log('No Repository founded');
                    return repo;
                }else{
                    //multiple repositories
                    const result = [];
                    const resultSize = repo.items.length;
                
                    repo.items.forEach(element => {
                        result.push({
                            fullname: element.full_name,
                            user: element.owner.login,
                            language: element.language
                        });
                    });

                    return result;
                }
            })
            .catch(err => {
                console.log(err);
                return this.createErrorJSON();
            });
    }

    /* -------------------------------- USER PART --------------------------- */

    /********************************************************
     * @function createUserJSON
     * @global generate a JSON form api for a user
     * @param {*} url
     ********************************************************/
    createUserJSON(url) {
        return this.githubPromise(url)
            .then((user) => {
                if(user.error === 1){
                    console.log('User not found');
                    return user;
                }else{
                    //check if user is already in db
                    const starred_url = this.getUrl(user.starred_url);
                    const gists_url = this.getUrl(user.gists_url);
                    const following_url = this.getUrl(user.following_url);
                    const urls = [user.repos_url, user.followers_url, following_url, gists_url, starred_url, user.subscriptions_url];
                    const promises = urls.map(urlParam => this.githubPromise(urlParam));
                    return Promise.all(promises)
                        .then((results) => {
                            // TODO modification of the Json results depending on the returned values
                            const [repositories, followers_, following_, gists_, starred_, subscriptions_] = results;
                            return {
                                error: 0,
                                queryDate: new Date(),
                                type: user.type,
                                id: user.id,
                                creationDate: user.created_at,
                                login: user.login,
                                name: user.name,
                                company: user.company,
                                location: user.location,
                                avatar: user.avatar_url,
                                followersCount: user.followers,
                                //followers: followers_,
                                followingCount: user.following,
                                //following: following_,
                                numberOfPublicRepos: user.public_repos,
                                //repos: repositories,
                                //subscriptions: subscriptions_,
                                numberOfGists: user.public_gists,
                                //gists: gists_,
                                //starredRepos: starred_,
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

    /********************************************************
     * @function requestUser
     * @global ask the DB if user exists
     * @param {*} username
     ********************************************************/
    requestUser(username){
        // TODO create Method to check if user is in dataBase or not
    }

}

module.exports = Github;
