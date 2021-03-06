// const Schema = require('./src/User.js');
const Mongoose = require("mongoose");
// To Avoid findAndModify is deprecated
Mongoose.set("useFindAndModify", false);

// change this value if you want more or less time in cache
const TIME_IN_CACHE = 1000;
const CACHE_TIME = process.env.NODE_MODE === "test" ? 5 : TIME_IN_CACHE;

const User = require("./model/UserModel");
const CacheUser = require("./model/UserCacheModel");

/* **********************************************************************************************
 *
 * @class DataBase
 * @description DataBase class is the class that is used to connect and manage the mongoDB DataBase
 *
 *********************************************************************************************** */
class DataBase {
  /* ****************************************************
   *
   * @constructor - constructor of the DataBase Class
   * @description - object constructor
   *
   *************************************************** */
  constructor() {
    this.dbName = process.env.DB_NAME;
    this.dbUrl = process.env.NODE_MODE !== "production"
      ? "mongodb://localhost:12345"
      : process.env.DB_URL;
    this.db = null;
  }

  // initialize db connection
  connect(done) {
    Mongoose.connect(
      `${this.dbUrl}/${this.dbName}`,
      {
        useNewUrlParser: true,
      },
      done,
    );

    this.db = Mongoose.connection;

    this.db.once("close", () => {
      console.log("Disconnected from DB");
    });
    // Difficult to test
    /* istanbul ignore next */
    this.db.on("error", () => {
      console.error.bind(console, "Connection error: ");
      this.close();
    });
    this.db.once("open", () => {
      console.log("Connected to DB => OK");
    });
  }

  /* *************************************************************
   *
   * @function delay()
   * @description calculated the delay between 2 requests on the same user or repo
   * @return return this delay
   *
   ************************************************************ */
  delay(queryDate) {
    return (new Date() - queryDate) / 1000;
  }

  /* *************************************************************
   *
   * @function close()
   * @description use for test purpose to close the connection
   *
   ************************************************************ */
  close(done) {
    this.db.close(done);
  }

  /* *************************************************************
   *
   * @function clear()
   * @description clear the database - for test purpose
   *
   ************************************************************ */
  clear(done) {
    this.db.dropDatabase(done);
  }

  /* *************************************************************
   *
   * @function saveInDB(value)
   * @description save the value in DB
   *
   ***************************************************************** */
  saveInDB(value, done) {
    return value.save((err) => {
      if (err) throw err.message;
      console.log("Value saved in DB");
      // for test purpose
      if (typeof done === "function") done();
    });
  }

  /* *************************************************************
   *
   * @function insertUser()
   * @description construction and insertion of a user in DB
   *
   ************************************************************ */
  insertUser(user, done) {
    const dbUser = new User({
      error: user.error,
      query_date: user.query_date,
      type: user.type,
      id: user.id,
      creation_date: user.creation_date,
      login: user.login,
      name: user.name,
      company: user.company,
      location: user.location,
      avatar: user.avatar,
      followers_count: user.followers_count,
      following_count: user.following_count,
      public_repos_number: user.public_repos_number,
      five_best_repo: user.five_best_repo,
      language_used: user.language_used,
    });

    const dbCacheUser = new CacheUser({
      query_date: user.query_date,
      login: user.login,
      id: user.id,
    });

    this.saveInDB(dbUser);
    this.saveInDB(dbCacheUser, done);
  }

  /* *************************************************************
   *
   * @function getCachedUser()
   * @description find if user is in cache
   * @return null or the cachedUser found
   *
   ************************************************************ */
  getCachedUser(login) {
    return CacheUser.findOne({ login })
      .then((cachedUser) => {
        if (cachedUser == null) {
          // user not find return null
          return null;
        } else {
          // user is in DB, return the cachedUser store in DB
          return cachedUser.toObject();
        }
      })
      .catch((error) => {
        // error accessing DB
        // Difficult to test
        /* istanbul ignore next */
        /* eslint-disable no-lone-blocks */
        {
          console.log(error.message);
          return null;
        }
        /* eslint-enable no-lone-blocks */
      });
  }

  /* *************************************************************
   *
   * @function searchUser()
   * @description find user in DB
   * @return the User found in DB or a Json Object with an error and booleans
   *
   ************************************************************ */
  searchUser(login) {
    return this.getCachedUser(login).then((cachedUser) => {
      if (cachedUser === null) {
        // user not in DB cache
        return {
          error: 1,
          cache: false,
          update: false,
        };
      } else {
        const time = this.delay(cachedUser.query_date);
        console.log(`${time} seconds since last query`);

        if (time < CACHE_TIME) { // change cache time to desired value
          // user in cache is still fresh
          console.log("Cache still fresh");
          return this.getUser(login);
        } else {
          // user need to be updated -> but first api call need to be made
          return {
            error: 1,
            cache: true,
            update: true,
          };
        }
      }
    });
  }

  /* *************************************************************
   *
   * @function getUser()
   * @description find user in DB
   * @return null or the User found in DB
   *
   ************************************************************ */
  getUser(login) {
    return User.findOne({ login })
      .then(dbUser => dbUser.toObject())
      .catch((err) => {
        // Difficult to test
        /* istanbul ignore next */
        /* eslint-disable no-lone-blocks */
        {
          console.log(err.message);
          return null;
        }
        /* eslint-enable no-lone-blocks */
      });
  }

  /* *************************************************************
   *
   * @function updateUser()
   * @description
   * @return
   *
   ************************************************************ */
  updateUser(user, done) {
    User.findOneAndUpdate(
      { id: user.id },
      user,
      { runValidators: true },
      (err) => {
        // Difficult to test
        /* istanbul ignore if */
        if (err) {
          console.log(`Error during update of user ${user.login}`);
        } else {
          console.log(`Update of user ${user.login}`);
          // TODO Update queryDate of cached user
          CacheUser.findOneAndUpdate(
            { id: user.id },
            { query_date: new Date() },
            { runValidators: true },
            (error) => {
              // Difficult to test
              /* istanbul ignore if */
              if (error) {
                console.log(`Error during cache update ${err.message}`);
              }
              // for test purpose
              if (typeof done === "function") done();
            },
          );
        }
      },
    );
  }
}

module.exports = DataBase;
