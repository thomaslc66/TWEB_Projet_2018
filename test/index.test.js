const supertest = require("supertest");
const { app, db, port } = require("../index");

// Do not chanche test order !!!!
// Test order is very important !!!
describe("index.test and Route", () => {
  let server;
  let request;

  describe("Launch App", () => {
    it("App launching", done => {
      server = app.listen(port, () => {
        console.log(`Listening on http://localhost:${port}`);
        request = supertest.agent(server);
        done();
      });
    });
  });

  describe("Connect Database", () => {
    it("Database connection", done => {
      db.connect(done);
    }).timeout(10000);
  });

  describe("Drop Database", () => {
    it("Dropping database", done => {
      db.clear(done);
    });
  });

  describe("Test Routes", () => {
    it("Should error 404", done => {
      request
        .get("/qwertz")
        .expect("Content-Type", "text/html; charset=utf-8")
        .expect(404, done);
    });

    it("[/user/:username] Should answer", done => {
      request
        .get("/user/tweb2018")
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect(200, done);
    }).timeout(10000);

    it("[/user/:username] Should answer error", done => {
      request
        .get("/user/askjhfkjsadhfjadsbvkjfvb")
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect(
          200,
          {
            error: 1,
            text: "not found"
          },
          done
        );
    }).timeout(10000);
  });

  describe("Close database connection", () => {
    it("Connection database closing", done => {
      db.close(done);
    });
  });

  describe("Shutdown server", () => {
    it("Server shutting down", done => {
      server.close(() => {
        console.log("Server Closed");
        done();
      });
    });
  });
});
