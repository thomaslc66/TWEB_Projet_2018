if (process.env.NODE_MODE !== "production") {
  require("dotenv").config({ path: `${__dirname}/../.env` });
}

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
          // Difficult to test
          /* istanbul ignore next */
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
          const urls = [user.repos_url];
          const promises = urls.map(urlParam => this.githubPromise(urlParam));
          return Promise.all(promises).then(results => {
            const [repositories] = results;
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
                .slice(0, 5)
                .map(item => {
                  if (item.name === "null") item.name = "unknown";
                  return item;
                });
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
              following_count: user.following,
              public_repos_number: user.public_repos,
              five_best_repo: five_best_repo,
              language_used: language_used
            };
          });
        }
      })
      .catch(err => {
        // Difficult to test
        /* istanbul ignore next */ {
          console.log(err);
          return Promise.resolve(() => {
            console.log("error");
            this.createErrorJSON();
          });
        }
      });
  }
}

module.exports = Github;
