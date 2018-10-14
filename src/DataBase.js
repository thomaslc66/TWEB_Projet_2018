
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
        //this.client = new MongoClient(this.dbUrl);
        this.data;
        this.userSchema = new Mongoose.Schema({
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
        this.User = Mongoose.model('user', this.userSchema);
        ;
    }


    connect(){
        Mongoose.connect(`${this.dbUrl}/${this.dbName}`);
        const db = Mongoose.connection;
        db.on('error', console.error.bind(console, 'connection error: '))
        db.once('open', () => {
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

        dbUser.save((err) => {
            if(err) throw err.message;
            //user is saved in db
            console.log('1 user added to db');
        });

    }

    checkUser(){

    }

    updateUser(){

    }


    close(){
        this.client.close();
    }

}

module.exports = DataBase;