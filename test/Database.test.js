// Use to test index.test.js before Database
// Because there are conflict with db connections
require("./index.test.js")

let chai = require('chai');
const dirtyChai = require('dirty-chai');
const expect = chai.expect

chai.use(dirtyChai);

const DataBase = require('../src/DataBase');

let db = new DataBase({});

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
    number_of_public_repos: 12,
};

describe("Database.test.js", () => {
    describe('Database Tests', () => {

        before((done) => {
            db.connect();
            db.clear();
            done();
        })

        after((done) => {
            db.close();
            done();
        });

        it('Can create database', (done) => {
            expect(db).to.not.be.undefined();
            done();
        });

        it('Can calculate delay', (done) => {
            const delay = db.delay(500);
            expect(delay).to.be.above(0);
            done();
        });

        describe('Can insert/get user and cache user', () => {
            it('Can insert/get user and cache user', (done) => {                
                db.insertUser(user);

                const dbUserPromise = db.getUser(user.login)
                .then((result) => {
                    expect(result).to.be.deep.equal(user);
                })
                .catch((err) => {
                    console.log(err);                                     
                });

                const dbUserCachePromise = db.getCachedUser(user.login)
                .then((result) => {          
                    expect(result.id).to.be.deep.equal(user.id);
                    expect(result.login).to.be.deep.equal(user.login);
                })
                .catch((err) => {
                    console.log(err);                                     
                });

                Promise.all([dbUserPromise, dbUserCachePromise])
                    .then(() => {
                        done();
                    });
            }).timeout(10000);
        });
    });
});