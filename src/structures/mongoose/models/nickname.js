const mongoose = require("mongoose");

const nicknames = new mongoose.Schema(
  {
    past: { type: String, default: null },
    current: { type: String, default: null },
    date: { type: Date, default: Date.now }
  },
  { _id: false }
);

module.exports = mongoose.model(
  "nickname",
  new mongoose.Schema({
    guild: { type: String },
    user: { type: String },
    past: { type: String, default: null },
    current: { type: String, default: null },
    list: [nicknames],
    date: { type: Date, default: Date.now }
  })
);
