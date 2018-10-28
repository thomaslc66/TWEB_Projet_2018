if (process.env.NODE_MODE !== "production") {
  /* eslint-disable global-require */
  require("dotenv").config({ path: `${__dirname}/../.env` });
  /* eslint-enable global-require */
}

const chai = require("chai");
const dirtyChai = require("dirty-chai");
/* eslint-disable prefer-destructuring */
const expect = chai.expect;

chai.use(dirtyChai);

const DataBase = require("../src/DataBase");

const db = new DataBase({});

const user = {
  type: "User",
  id: 25,
  creation_date: "2017-03-21T14:56:48Z",
  login: "test",
  name: "testman",
  company: "testandco",
  location: "nowhere",
  avatar: "https://noavatar.com",
  followers_count: 8,
  following_count: 5,
  five_best_repo: [
    {
      repo_name: "Repo 01",
      repo_url: "https://nowhere1.com",
      watchers_count: 10,
      stars_count: 10,
      forks_count: 10,
    },
    {
      repo_name: "Repo 02",
      repo_url: "https://nowhere2.com",
      watchers_count: 8,
      stars_count: 8,
      forks_count: 8,
    },
    {
      repo_name: "Repo 03",
      repo_url: "https://nowhere3.com",
      watchers_count: 6,
      stars_count: 6,
      forks_count: 6,
    },
    {
      repo_name: "Repo 04",
      repo_url: "https://nowhere4.com",
      watchers_count: 4,
      stars_count: 4,
      forks_count: 4,
    },
    {
      repo_name: "Repo 05",
      repo_url: "https://nowhere5.com",
      watchers_count: 2,
      stars_count: 2,
      forks_count: 2,
    },
  ],
  language_used: {
    PHP: 5,
    JavaScript: 8,
    Perl: 3,
    CSS: 12,
  },
};

describe("Database.test", () => {
  after((done) => {
    db.close(done);
  });

  describe("Connect Database", () => {
    it("Can connect to database", (done) => {
      db.connect(done);
    }).timeout(10000);
  });

  describe("Drop Database", () => {
    it("Can drop database", (done) => {
      db.clear(done);
    });
  });

  describe("Database Tests", () => {
    it("Can create database", (done) => {
      expect(db).to.not.be.undefined();
      done();
    });

    it("Can calculate delay", (done) => {
      const delay = db.delay(500);
      expect(delay).to.be.above(0);
      done();
    });

    describe("Can insert user and cache user", () => {
      it("User and user cache insertion", (done) => {
        db.insertUser(user, done);
      });
    });

    describe("Can get user", () => {
      it("User fetching", (done) => {
        db.getUser(user.login)
          .then((userResult) => {
            expect(userResult).to.not.be.null();
            delete userResult._id;
            delete userResult.__v;
            delete userResult.query_date;
            expect(userResult).to.be.deep.equal(user);
            done();
          })
          .catch((err) => {
            done(new Error(err));
          });
      });
    });

    describe("Can get user cache", () => {
      it("User cache fetching", (done) => {
        db.getCachedUser(user.login)
          .then((userCacheResult) => {
            expect(userCacheResult).to.not.be.null();
            expect(userCacheResult.id).to.be.deep.equal(user.id);
            expect(userCacheResult.login).to.be.deep.equal(user.login);
            done();
          })
          .catch((err) => {
            done(new Error(err));
          });
      });
    });

    describe("Can search user", () => {
      it("User searching", (done) => {
        db.searchUser(user.login)
          .then((userResult) => {
            expect(userResult).to.not.be.null();
            expect(userResult.id).to.be.deep.equal(user.id);
            expect(userResult.login).to.be.deep.equal(user.login);
            done();
          })
          .catch((err) => {
            done(new Error(err));
          });
      });

      it("User searching failed", (done) => {
        db.searchUser("hello")
          .then((userResult) => {
            expect(userResult).to.not.be.null();
            expect(userResult.error).to.be.deep.equal(1);
            expect(userResult.cache).to.be.deep.equal(false);
            expect(userResult.update).to.be.deep.equal(false);
            done();
          })
          .catch((err) => {
            done(new Error(err));
          });
      });

      it("User searching need to be update", (done) => {
        const start = new Date().getTime();
        let end = start;
        while (end < start + 5000) {
          end = new Date().getTime();
        }
        db.searchUser(user.login)
          .then((userResult) => {
            expect(userResult).to.not.be.null();
            expect(userResult.error).to.be.deep.equal(1);
            expect(userResult.cache).to.be.deep.equal(true);
            expect(userResult.update).to.be.deep.equal(true);
            done();
          })
          .catch((err) => {
            done(new Error(err));
          });
      }).timeout(20000);
    });

    describe("Can update user", () => {
      it("User updating", (done) => {
        user.following_count = 500;
        db.updateUser(user, done);
      });
    }).timeout(10000);

    describe("Validate update user", () => {
      it("User update validating", (done) => {
        db.getUser(user.login)
          .then((userResult) => {
            delete userResult._id;
            delete userResult.__v;
            delete userResult.query_date;
            expect(userResult).to.be.deep.equal(user);
            done();
          })
          .catch((err) => {
            done(new Error(err));
          });
      });
    }).timeout(10000);
  });
});
