const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let schema = new Schema(
  {
    query_date: { type: Date, default: Date.now, required: false },
    login: String,
    id: Number
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

module.exports = mongoose.model("cacheUser", schema);
