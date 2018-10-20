const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

const UserSchema = () => new Schema({
    type: String,
    id: Number,
    creation_date: String,
    login: String,
    name: String,
    company: String,
    location: String,
    avatar: String,
    followers_count: Number,
    following_count: Number,
    number_of_public_repos: Number,
});

module.exports = UserSchema;