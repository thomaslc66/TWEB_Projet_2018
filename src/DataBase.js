
//const Schema = require('./src/User.js');
const Mongoose = require('mongoose');
// To Avoid findAndModify is deprecated
Mongoose.set('useFindAndModify', false);
const CACHE_TIME = 100;

const User = require("./model/UserModel.js")
const CacheUser = require("./model/UserCacheModel.js")
const UserStatistics = require("./model/UserModel.js")
const Repo = require("./model/RepoModel")
const CacheRepo = require("./model/RepoCacheModel")
const RepoStatistics = require("./model/RepoStatisticsModel")

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
        this.dbName = process.env.DB_NAME;
        this.dbUrl = process.env.NODE_MODE !== 'production' ?  'mongodb://localhost:12345' : process.env.DB_URL;
        this.db;
    }

    connect(){
        Mongoose.connect(`${this.dbUrl}/${this.dbName}`, { useNewUrlParser: true });
        this.db = Mongoose.connection;
        this.db.on('error', console.error.bind(console, 'connection error: '))
        this.db.once('open', () => {
            console.log('Connected to DB => OK');
        });
    }

    /**************************************************************
     * 
     * @function delay()
     * @description calculated the delay between 2 requests on the same user or repo
     * @return return this delay
     * 
     *************************************************************/
    delay(queryDate){
        return (new Date() - queryDate) / 1000;
    }

    close(){
        Mongoose.connection.close();
        this.db.once('close', () => {
            console.log('Disconnected from DB');
        });
    }

    clear() {
        Mongoose.connection.dropDatabase();
    }

    /**************************************************************
     * 
     * @function saveInDB(value)
     * @description save the value in DB
     * 
     ******************************************************************/
    saveInDB(value){    
        value.save((err) => {
            if(err) throw err.message;
            console.log('Value saved');
        });
    }

    /**************************************************************
     * 
     * @function insertUser()
     * @description construction and insertion of a user in DB
     * 
     *************************************************************/
    insertUser(user){
        const dbUser = new User({
            type: user.type,
            id: user.id,
            creation_date: user.creation_date,
            login: user.login,
            name: user.name,
            company: user.company,
            location: user.location,
            avatar: user.avatar,
            followers_count: user.followers_count,
            following_count: user.following_count,
            number_of_public_repos: user.number_of_public_repos,
        });

        const dbCacheUser = new CacheUser({
            query_date: user.query_date,
            login: user.login,
            id: user.id
        });

        this.saveInDB(dbUser);
        this.saveInDB(dbCacheUser);

    }

    /**************************************************************
     * 
     * @function getCachedUser()
     * @description find if user is in cache
     * @return null or the cachedUser found
     * 
     *************************************************************/
    getCachedUser(login){
        return CacheUser.findOne({login})
            .then(cachedUser => {
                if(cachedUser == null){
                    //user not find return null
                    return null;
                }else{
                    //user is in DB return the cachedUser store in DB
                    return cachedUser.toObject({virtuals: false});
                }
            })
            .catch((error) => {
                //error accessing DB
                console.log(error.message);
                return null;
            });
    }

    /**************************************************************
     * 
     * @function searchUser()
     * @description find user in DB
     * @return the User found in DB or a Json Object with an error and booleans
     * 
     *************************************************************/
    searchUser(login){
        return this.getCachedUser(login)
            .then((cachedUser) => {
                if(cachedUser === null){
                    //user not in DB cache
                    return {
                        error: 1,
                        cache: false,
                        update: false
                    };
                }
                else{
                    let time = this.delay(cachedUser.query_date);
                    console.log(`${time} seconds since last query`);
    
                    if(time < CACHE_TIME){
                        //user in cache is still fresh
                        console.log(`Cache still fresh`);
                        return this.getUser(login);
                    }else{
                        // user need to be updated -> but first api call need to be made
                        return {
                            error: 1,
                            cache: true,
                            update: true
                        };
                    }
                }
            });
    }

    /**************************************************************
     * 
     * @function getUser()
     * @description find user in DB
     * @return null or the User found in DB
     * 
     *************************************************************/
    getUser(login){
        return User.findOne({login})
                            .then((dbUser) => {
                                // can dbUser be null?
                                return dbUser.toObject();
                            }).catch((err) => {
                                console.log(err.message);
                                return null;
                            });
    }

    /**************************************************************
     * 
     * @function updateUser()
     * @description 
     * @return 
     * 
     *************************************************************/
    updateUser(user){
        User.findOneAndUpdate({id: user.id}, user , {runValidators: true}, (err, result) => {
            if(err){
                console.log(`Error during update of user ${user.login}`);
            }else{
                console.log(`Update of user ${user.login}`);
                // TODO Update queryDate of cached user
                CacheUser.findOneAndUpdate({id: user.id}, {query_date: new Date}, {runValidators: true}, (err, result) => {
                    if(err){
                        console.log(`Error during cache update ${err.message}`);
                    }
                });
            }
        });
    }

    /**************************************************************
     * 
     * @function saveUserStatistics()
     * @description save user info to make statistic and graph
     * 
     *************************************************************/
    saveUserStatistics(user){
        console.log('trying to save statistics');
        UserStatistics.findOne({id : 100})
            .then((result) => {
                let id;
                let request_number;
                let followers_sum;
                let followers_max;
                let followers_min;

                if(result === null){
                    // Normaly will occurs only the first time for creation
                    id = 100;
                    request_number = 1;
                    followers_sum = user.followers_count;
                    followers_max = user.followers_count;
                    followers_min = user.followers_count;

                    const user_stats = new UserStatistics({
                        id: id,
                        request_number: request_number,
                        followers_sum: followers_sum,
                        followers_max: followers_max,
                        followers_min: followers_min
                    }); 
                    //first save of the schema
                    this.saveInDB(user_stats)
                    console.log("Statistics Saved");
                }else{
                    result.request_number = result.request_number + 1;
                    result.followers_sum  = result.followers_sum + user.followers_count;
                    result.followers_max = result.followers_max > user.followers_count ? result.followers_max : user.followers_count;
                    result.followers_min = result.followers_min > user.followers_count ? user.followers_count : result.followers_min;

                    //save of the same object
                    this.saveInDB(result)             
                    console.log("Statistics Saved");

                }


            });
    }

    /**************************************************************
     * 
     * @function inserRepo()
     * @description construction and insertion of a repo in DB
     * 
     *************************************************************/
    inserRepo(repo){
        const dbRepo = new Repo({
            id: repo.id,
            name: repo.name,
            html_url: repo.html_url,
            owner_login: repo.owner_login,
            owner_html_url: repo.owner_html_url,            
            forks_count: repo.forks_count,
            forks_url: repo.forks_url,
            watchers_count: repo.watchers_count,
            open_issues_count: repo.open_issues_count,
            creation_date: repo.creation_date,
            last_update_ate: repo.last_update_ate,
            release_download_count: repo.release_download_count,         
            company: repo.company,
        });

        const dbCacheRepo = new sCacheRepo({
            query_date: repo.query_date,
            name: repo.name,
            id: Number,
        });

        this.saveInDB(dbRepo);
        this.saveInDB(dbCacheRepo);
    }


    /**************************************************************
     * 
     * @function saveReposStatistics()
     * @description save repos info to make statistics and graphs
     * @info You need to modify createRepoStatisticsSchema() and delete DB 
     * if you add modification to this method
     * 
     *************************************************************/
    saveReposStatistics(repo){
        console.log('trying to save repos statistics');
        RepoStatistics.findOne({id : 200})
            .then((result) => {
                let id;
                let request_number;
                let fork_number;

                if(result === null){
                    // Normaly will occurs only the first time for creation
                    id = 200;
                    request_number = 0;
                    fork_number = 0;

                    const repo_stats = new RepoStatistics({
                        id: id,
                        fork_number: fork_number,
                        request_number: request_number
                    }); 
    
                    //first save of the schema
                    this.saveInDB(repo_stats);
                }else{
                    result.fork_number = result.fork_number + repo.fork_number;
                    result.request_number = result.request_number + 1;
                    
                    //save of the same object
                    this.saveInDB(result)
                }
            });
    }
}

module.exports = DataBase;