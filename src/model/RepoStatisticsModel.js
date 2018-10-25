const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let schema = new Schema({
    id: Number,
    request_number: Number,
    fork_number: Number,
},
{
    toObject: {
        virtuals: false
    }
});
 
module.exports = mongoose.model('repoStatistics', schema);