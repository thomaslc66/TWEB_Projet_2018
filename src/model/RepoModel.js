const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let schema = new Schema({
    id: Number,
    name: String,
    html_url: String,
    owner_login: String,
    owner_html_url: String,            
    forks_count: Number,
    forks_url: String,
    watchers_count: Number,
    open_issues_count: Number,
    creation_date: String,
    last_update_ate: String,
    release_download_count: Number,         
    company: String,
},
{
    toObject: {
        virtuals: false
    }
});
 
module.exports = mongoose.model('repo', schema);