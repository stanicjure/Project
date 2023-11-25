const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const generalStatsSchema = new Schema({
  name: String,
  requestsNumber: Number,
});

module.exports = mongoose.model("GeneralStats", generalStatsSchema);
