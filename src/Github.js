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
            //.auth(process.env.GITHUB_USER, process.env.ACCESS_TOKEN)
            .set('Accept', 'application/vnd.github.v3+json')
            .set('Authorization', `token ${process.env.ACCESS_TOKEN}`)
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
        return this.githubPromise(url)
            .then((repo) => {
                if(repo.error === 1){
                    console.log('Repository not found');
                    return repo;
                }else{
                    const releases_url = this.getUrl(repo.releases_url);
                    const urls = [repo.forks_url, releases_url];
                    const promises = urls.map(urlParam => this.githubPromise(urlParam));
                    return Promise.all(promises)
                        .then((results) => {
                            const [forks_urls, releases_url] = results;
                            const forks_url = forks_urls.map(forkUrl => {return forkUrl.html_url});
                            return {
                                //add what you need to display
                                error: 0,
                                query_date: new Date(),
                                id: repo.id,
                                name: repo.name,
                                html_url: repo.html_url,
                                owner_login: repo.owner.login,
                                owner_html_url: repo.owner.html_url,            
                                forks_count: repo.forks_count,
                                forks_url: forks_url,
                                watchers_count: repo.watchers_count,
                                open_issues_count: repo.open_issues_count,
                                creation_date: repo.created_at,
                                last_update_ate: repo.updated_at,
                                release_download_count: 10,//JSON.parse(releases_url).count,        
                                company: repo.company,
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
        return this.githubPromise(url)
            .then((repo) => {
                if(repo.error === 1){
                    console.log('No Repository founded');
                    return repo;
                }else{
                    //multiple repositories
                    const result = [];
               
                    repo.items.forEach(element => {
                        result.push({
                            fullname: element.full_name,
                            user: element.owner.login,
                            url: element.html_url,
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
                                query_date: new Date(),
                                type: user.type,
                                id: user.id,
                                creation_date: user.created_at,
                                login: user.login,
                                name: user.name,
                                company: user.company,
                                location: user.location,
                                avatar: user.avatar_url,
                                followers_count: user.followers,
                                //followers: followers_,
                                following_count: user.following,
                                //following: following_,
                                public_repos_number: user.public_repos,
                                repos: repositories,
                                //subscriptions: subscriptions_,
                                gists_number: user.public_gists,
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
}

module.exports = Github;