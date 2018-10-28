const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let schema = new Schema(
  {
    error: Number,
    query_date: { type: Date, default: Date.now, required: false },
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
    public_repos_number: Number,
    five_best_repo: Object,
    language_used: Object
  },
  {
    toObject: {
      virtuals: false //don't seems to work at all
    },
    toJSON : { 
      virtuals: false //don't seems to work at all
    }
  }
);

module.exports = mongoose.model("user", schema);
