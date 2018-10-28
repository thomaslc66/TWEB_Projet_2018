// if for automatic deployement purpose.
if (process.env.NODE_MODE !== "production") {
  /* eslint-disable global-require */
  require("dotenv").config({ path: `${__dirname}/../.env` });
  /* eslint-enable global-require */
}

const express = require("express");
const cors = require("cors");

const { routes, db } = require("./controllers/Route");

const app = express();
const port = process.env.PORT || 3000;

// use cors for front end request compatibility
app.use(cors());

/* *******************************************************
 * Express route to ask for a user
 ******************************************************* */
app.get("/user/:username", routes);

/* *******************************************************
 * Default route
 ******************************************************* */
app.get("/", routes);

/* *******************************************************
 * Error when route not foud
 ******************************************************* */
app.use((req, res) => {
  console.log("Route not found");
  res.status(404);
  res.send("404 Route not found");
});

/* ******************************************************
 * Error Handler
 ******************************************************* */
// Difficult to test
/* istanbul ignore next */
app.use((err, req, res) => {
  console.log("Route not found");
  res.status(err.status || 500);
  res.send(err.message);
});

/* *******************************************************
 * app start
 ******************************************************* */
// Test in index.test.js
/* istanbul ignore if  */
if (process.env.NODE_MODE !== "test") {
  app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
  });
}

// Use for testing
module.exports = { app, db, port };
