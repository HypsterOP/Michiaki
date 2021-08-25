const mongoose = require("mongoose");

module.exports = mongoose.model(
  "database",
  new mongoose.Schema({
    key: String,
    value: mongoose.SchemaTypes.Mixed,
  })
);
