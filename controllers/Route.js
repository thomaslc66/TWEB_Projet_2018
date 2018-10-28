const routes = require("express").Router();
const Github = require("./../src/Github");
const DataBase = require("./../src/DataBase");

const db = new DataBase({});
const client = new Github({ token: process.env.ACCESS_TOKEN });

/* istanbul ignore if  */
if (process.env.NODE_MODE !== "test") {
  db.connect();
}

/* ********************* Route ************************* */
routes.get("/user/:username", (req, res) => {
  /* eslint-disable prefer-destructuring */
  const username = req.params.username;
  const url = `${process.env.GITHUB_URL}users/${username}`;

  db.searchUser(username)
    .then((user) => {
      // Test in Database.test.js
      /* istanbul ignore else  */
      if (user.error === 1) {
        // Two possibilities
        // 1) user is in Db with old cache -> update
        // 2) user is not in db -> insert

        // call to github API
        client
          .createUserJSON(url)
          .then((userFromApi) => {
            if (userFromApi.error === 0) {
              // Test in Database.test.js
              /* istanbul ignore if  */
              if (user.cache === true && user.update === true) {
                db.updateUser(userFromApi);
              } else {
                db.insertUser(userFromApi);
              }
            }
            res.send(userFromApi);
          })
          .catch(() => {
            /* istanbul ignore next */
            res.send(client.createErrorJSON());
          });
      } else {
        db.getUser(username).then((result) => {
          res.send(result);
        });
      }
    })
    .catch(() => {
      /* istanbul ignore next */
      res.send(client.createErrorJSON());
    });
});

module.exports = {
  routes,
  db,
};
