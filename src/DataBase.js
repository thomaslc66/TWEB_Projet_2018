
//const MongoClient = require('mongodb').MongoClient;
//const Schema = require('./src/User.js');
const Mongoose = require('mongoose');


/**
 * @class DataBase
 * @description DataBase class is the class that is used to connect and manage the mongoDB DataBase
 */
class DataBase {

    /**
     * @constructor - constructor of the DataBase Class
     * @description - object constructor
     */
    constructor({} = {}) {
        this.dbName = 'githubApi';
        this.dbUrl = 'mongodb://localhost:12345';
        this.userSchema = this.createUserSchema();
        this.cacheUserSchema = this.createCacheUserSchema();
        this.User = Mongoose.model('user', this.userSchema);
        this.CacheUser = Mongoose.model('cacheUser', this.cacheUserSchema);
        this.db;
        ;
    }

    connect(){
        Mongoose.connect(`${this.dbUrl}/${this.dbName}`);
        this.db = Mongoose.connection;
        this.db.on('error', console.error.bind(console, 'connection error: '))
        this.db.once('open', () => {
            console.log('Connected to DB => OK');
        });
    }

    addUser(user){
        const dbUser = new this.User({
            error: user.error,
            queryDate: user.queryDate,
            type: user.type,
            id: user.id,
            creationDate: user.creationDate,
            login: user.login,
            name: user.name,
            company: user.company,
            location: user.location,
            avatar: user.avatar,
            followersCount: user.followersCount,
            followingCount: user.followersCount,
            numberOfPublicRepos: user.numberOfPublicRepos,
            numberOfGists: user.numberOfGists,
            //_id: user._id
        });

        const dbCacheUser = new this.CacheUser({
            queryDate: user.queryDate,
            login: user.login
        });

        dbUser.save((err) => {
            if(err) throw err.message;
            //user is saved in db
            console.log('1 user added to db');
        });

        dbCacheUser.save((err) => {
            if(err) throw err.message;
            console.log('1 user added to cache for next search');
        });

    }

    createUserSchema(){
        return new Mongoose.Schema({
            error: Number,
            queryDate: {type: Date, default: Date.now, required: false},
            type: String,
            id: Number,
            creationDate: String,
            login: String,
            name: String,
            company: String,
            location: String,
            avatar: String,
            followersCount: Number,
            followingCount: Number,
            numberOfPublicRepos: Number,
            numberOfGists: Number,
            //_id: {type: String, required: false}
        });
    }

    createCacheUserSchema(){
        return new Mongoose.Schema({
            queryDate: {type: Date, default: Date.now, required: false},
            login: String
        });
    }

    /**************************************************************
     * 
     * @description using mongoose query find if user exists and last time
     * the request was made.
     *************************************************************/
    checkUser(login){
        return this.CacheUser.findOne({login:`${login}`}, (err, user) => {
            if(err) throw err

            console.log(`${user.login} was founded in data base`)

            let query = user.queryDate;
            let lastRequestDelay = this.delay(query);
            console.log(`La requête à été faite il y a ${lastRequestDelay} secondes`)
            return true;
        });
    }

    updateUser(){

    }

    /************************
     * TODO Ask how to return query like the defines User Schema ???
     */
    getUser(login){
        return  this.User.findOne({login:`${login}`}, (err, user) => {
            if(err) throw err
            console.log(`${user.login} returned from -> DB`)
            return user;
        });
    }

    delay(queryDate){
        return (new Date() - queryDate) / 1000;
    }

    close(){
        this.client.close();
    }

}

module.exports = DataBase;