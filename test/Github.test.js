const chai = require("chai");

const github = require("../src/Github.js");

const { Github }  = github;

chai.should();

describe('Github.test.js', () => {
    describe("Github", () => {
        if("should allow create user", () => {
            const github = new Github();
        });
    });
});