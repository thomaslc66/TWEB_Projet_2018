if(process.env.NODE_MODE !== 'production'){
    require('dotenv').config();
}

const express = require('express');
const cors = require('cors');

const { routes, db } = require('./controllers/Route');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

/********************************************************
 * Express route to ask for a user
 ********************************************************/
app.get('/user/:username', routes);

/********************************************************
 * Express route to ask for a repository
 ********************************************************/
app.get('/repo/:owner/:name', routes);

/********************************************************
 * Search for a repository when you don't know the user
 ********************************************************/
app.get('/repo/:name', routes);

/********************************************************
 * Default route
 ********************************************************/
app.get('/', routes);


/********************************************************
 * Error when route not foud
 ********************************************************/
app.use((req, res, next) => {
    const error = new Error('Route not Found!');
    error.status = 404;
    next(error);
});

/********************************************************
 * Error Handler
 ********************************************************/
app.use((err, req, res) => {
    console.error(err);
    res.status(err.status || 500);
    res.send(err.message);
});

/********************************************************
 * app start 
 ********************************************************/
const server = app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
});

// Use for testing
module.exports = { server, db };