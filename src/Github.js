const request = require("superagent");

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
  constructor({ token } = {}) {
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
    return (
      request
        .get(url)
        .set("Accept", "application/vnd.github.v3+json")
        .set("Authorization", `token ${process.env.ACCESS_TOKEN}`)
        .then(response => {
          if (response.statusCode === 200) {
            // Send response in object Format
            return response.body;
          }
          return this.createErrorJSON();
        })
        // Error, user or repo not found
        .catch(error => {
          console.log("Error on GithubPromise: ", error.message);
          return this.createErrorJSON();
        })
    );
  }

  /**********************************************************
   *
   * @function getUrl
   * @param {*} url the url we want to split
   * @description return the url without the unessary parts
   *
   ************************************************************/
  getUrl(url) {
    return url.split("{")[0];
  }

  /***************************************************************************
   *
   * @function createErrorJSON
   * @description create and return a Json in case of error during api request
   * @returns return a JSON with and error and a text
   *
   ****************************************************************************/
  createErrorJSON() {
    return {
      error: 1,
      text: "not found"
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
      .then(repo => {
        if (repo.error === 1) {
          console.log("Repository not found");
          return repo;
        } else {
          const releases_url = this.getUrl(repo.releases_url);
          const urls = [repo.forks_url, releases_url];
          const promises = urls.map(urlParam => this.githubPromise(urlParam));
          return Promise.all(promises).then(results => {
            const [forks_urls, releases_url] = results;
            const forks_url = forks_urls.map(forkUrl => {
              return forkUrl.html_url;
            });
            const release_url = releases_url.map(releaseUrl => {
              return releaseUrl.assets[0].download_count;
            });

            let total_realse_download = 0;
            if (release_url.length !== 0) {
              total_realse_download = release_url.reduce(
                (accumulator, currentValue) => accumulator + currentValue
              );
            }
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
              release_download_count: total_realse_download,
              company: repo.company
            };
          });
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
      .then(user => {
        if (user.error === 1) {
          console.log("User not found");
          return user;
        } else {
          const starred_url = this.getUrl(user.starred_url);
          const gists_url = this.getUrl(user.gists_url);
          const following_url = this.getUrl(user.following_url);
          const urls = [
            user.repos_url,
            user.followers_url,
            following_url,
            gists_url,
            starred_url,
            user.subscriptions_url
          ];
          const promises = urls.map(urlParam => this.githubPromise(urlParam));
          return Promise.all(promises).then(results => {
            // TODO modification of the Json results depending on the returned values desired
            const [
              repositories,
              followers_,
              following_,
              gists_,
              starred_,
              subscriptions_
            ] = results;
            const five_best_repo = repositories
              .map(repo => ({
                repo_name: repo.name,
                repo_url: repo.url,
                watchers_count: repo.watchers_count,
                stars_count: repo.stargazers_count,
                forks_count: repo.forks_count
              }))
              // Use || to sort by multiple properties to have sort.thenSortBy effect
              .sort((a, b) => {
                return (
                  b.watchers_count - a.watchers_count ||
                  b.forks_count - a.forks_count ||
                  b.stars_count - a.stars_count
                );
              })
              .slice(0, 5);

            // Count number of different language repositories
            let language_used = {};
            if (repositories.length !== 0) {
              language_used = repositories.reduce((prev, curr) => {
                prev[curr.language] = (prev[curr.language] || 0) + 1;
                return prev;
              }, {});

              language_used = Object.entries(language_used).map(
                ([key, value]) => ({
                  name: key,
                  count: value
                })
              );

              language_used = language_used
                .sort((a, b) => {
                  return b.count - a.count;
                })
                .slice(0, 5);
            }

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
              //repos: repositories,
              five_best_repo: five_best_repo,
              language_used: language_used
              //subscriptions: subscriptions_,
              //gists_number: user.public_gists,
              //gists: gists_,
              //starredRepos: starred_,
            };
          });
        }
      })
      .catch(err => {
        console.log(err);
        return Promise.resolve(() => {
          console.log("error");
          this.createErrorJSON();
        });
      });
  }
}

module.exports = Github;
