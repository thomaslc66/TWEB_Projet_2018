const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

const userSchema = new Schema({
    error: Number,
    queryDate: {type: Date, default: Date.now},
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
    _id: String
});

module.exports = DataBase;