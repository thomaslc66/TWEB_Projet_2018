const routes = require('express').Router();

const Github = require('./../src/Github');
const DataBase = require('./../src/DataBase');

const db = new DataBase({});
const client = new Github({ token: process.env.ACCESS_TOKEN });

db.connect();

/********************** Routes ************************* */
routes.get('/user/:username', (req, res) => {
    const username = req.params.username;
    const url = `${process.env.GITHUB_URL}users/${username}`;

    // TODO create Controller
db.searchUser(username)
        .then((user) => {
            if(user.error === 1){
                // Two possibilities 
                // 1) user is in Db with old cache -> update
                // 2) user is not in db -> insert

                // call to github API
                client.createUserJSON(url)
                    .then((userFromApi) => {
                        if(userFromApi.error === 0){
                            /* TODO change this to only use findOneAndUpadate with the 
                            user.findOneAndUpdate(
                                {foo: 'bar'}, // find a document with that filter
                                userFromApi, // document to insert when nothing was found
                                {upsert: true, runValidators: true}, */
                            if(user.cache === true && user.update === true){
                                db.updateUser(userFromApi);
                            }else{
                                db.insertUser(userFromApi); 
                            }
                        }
                        db.saveUserForStatistics(userFromApi);
                        res.send(userFromApi);
                    })
                    .catch((err) => {
                        console.log(err);
                        res.send(client.createErrorJSON())
                    });
            }
            else{
                console.log("User parsed form DataBase");
                db.getUser(username)
                    .then((result) => {
                        res.send(result);
                    });
            }
        })
        .catch((err) => {
            console.log("BAhhhh.... Ca marche pas");
            client.createErrorJSON();
        });
});


routes.get('/repo/:owner/:name', (req, res) => {
    const repoName = req.params.name;
    const owner = req.params.owner;
    const url = `${process.env.GITHUB_URL}repos/${owner}/${repoName}`;

    client.createRepoJSON(url)
        .then((result) => {
            // connection to MangoDB
            //db.connect();
            //db.addUser(result);
            res.send(result)
        }).
        catch((err) =>{
            client.createErrorJSON();
        });
});

routes.get('/repo/:name', (req, res) => {
    const repo_name = req.params.name;
    const url = `${process.env.GITHUB_URL}search/repositories?q=${repo_name}`;

    client.createSearchResultJSON(url)
        .then((result) => {
            res.send(result)
        })
        .catch((err) => {
            client.createErrorJSON();
        })
});


routes.get('/', (req, resp) => {
    resp.send('{}');
});

module.exports = routes;
