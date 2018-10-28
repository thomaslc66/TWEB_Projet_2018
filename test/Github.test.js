const chai = require("chai");
const dirtyChai = require("dirty-chai");
const expect = chai.expect;

chai.use(dirtyChai);

const Github = require("../src/Github");

const github = new Github({ token: process.env.ACCESS_TOKEN });

const goodLogin = "fxbenard";
const wrongLogin = "asdjhaskjdhaskjdhaskj";
const GithubUrl = "https://myawsomeurl.com/";

describe("Github.test", () => {
  describe("Create Github", () => {
    it("Can create new github client", () => {
      expect(github).to.not.be.undefined();
    });
  });

  describe("Github Tools", () => {
    it("Get Github URL Without Options", () => {
      expect(github.getUrl(`${GithubUrl}{option}`)).to.be.deep.equal(GithubUrl);
    });

    it("Create error JSON", () => {
      const errorJSON = github.createErrorJSON();
      expect(errorJSON.error).to.be.deep.equal(1);
      expect(errorJSON.text).to.be.deep.equal("not found");
    });
  });

  describe("Fetch Github", () => {
    it("Can fetching data from github", done => {
      github
        .githubPromise(`${process.env.GITHUB_URL}users/${goodLogin}`)
        .then(result => {
          expect(result.login).to.be.deep.equal(goodLogin);
          done();
        })
        .catch(err => {
          done(new Error(err));
        });
    });

    it("Receive error if not good name", () => {
      github
        .githubPromise(`${process.env.GITHUB_URL}users/${wrongLogin}`)
        .then(result => {
          expect(result.error).to.be.deep.equal(1);
          expect(result.text).to.be.deep.equal("not found");
        });
    });
  });

  describe("Fetch Github User", () => {
    it("Can fetching user from github", done => {
      github
        .createUserJSON(`${process.env.GITHUB_URL}users/${goodLogin}`)
        .then(result => {
          expect(result.login).to.be.deep.equal(goodLogin);
          done();
        })
        .catch(err => {
          done(new Error(err));
        });
    });

    it("Fail when fetching user from github with wrong name", () => {
      github
        .createUserJSON(`${process.env.GITHUB_URL}users/${wrongLogin}`)
        .then(result => {
          expect(result.error).to.be.deep.equal(1);
          expect(result.text).to.be.deep.equal("not found");
        });
    });
  });
});
