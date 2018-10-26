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
      virtuals: false
    }
  }
);

module.exports = mongoose.model("cacheUser", schema);
