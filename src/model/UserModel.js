const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let schema = new Schema(
  {
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
    five_best_repo: Object,
    number_of_public_repos: Number,
    language_used: Object
  },
  {
    toObject: {
      virtuals: false
    }
  }
);

module.exports = mongoose.model("user", schema);
