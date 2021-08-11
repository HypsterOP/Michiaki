/* eslint-disable no-use-before-define */
const models = require("./models");
const mongoose = require("mongoose");
const { Collection } = require("discord.js");
const collection = new Collection();

const init = (client) => {
  if (mongoose.connection.readyState !== 1) {
    if (!process.env.MONGO_URL) {
      throw new Error(
        "A mongoose connection is required because there is no established connection with mongoose!"
      );
    }

    mongoose
      .connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useFindAndModify: false,
        useCreateIndex: true,
        useUnifiedTopology: true
      })
      .then((x) =>
        log.success(
          "Mongoose Database",
          `Connected! Database name: "${x.connections[0].name}"`
        ));
  }

  client.on("ready", () => {
    models.database.find().then((data) => {
      data.forEach((value) => {
        collection.set(value.key, value.value);
      });
    });
  });
};

/**
 * @method
 * @param {String} [key] The key, so you can get it with <database>.get("key")
 * @param {*} [value] The value which will be saved to the key
 * @example
 * <database>.set("test","noice")
 */
const Set = (key, value) => {
  if (!key) {
    throw new TypeError(
      "'database' => Please provide \"key\" in the field provided."
    );
  }

  if (!value) {
    throw new TypeError("'database' => Please specify a \"value\"");
  }

  models.database.findOneAndUpdate(
    { key },
    { key, value },
    { upsert: true, strict: true }
  );
  collection.set(key, value);
  return Get(key);
};

/**
 * @method
 * @param {String} key The key you wish to get, and returns value
 * @example
 * <database>.get("test") //Will return "noice" (if you have set it)
 */
const Get = (key) => {
  if (!key) {
    throw new TypeError("'database' => Please specify a \"key\"");
  }

  return collection.get(key);
};

/**
 * @method
 * @param {String} key The key you wish to check, returns boolean
 * @example
 * <database>.has("test") // will return true if there is a key
 */
const Has = (key) => {
  if (!key) {
    throw new TypeError("'database' => Please specify a \"key\"");
  }

  return Boolean(Get(key));
};

/**
 * @method
 * @param {String} key They key you wish to delete
 * @example
 * <database>.delete("test")
 */
const Delete = (key) => {
  if (!key) {
    throw new TypeError("'database' => Please specify a \"key\"");
  }

  return models.database
    .findOneAndDelete({ key })
    .then(() => collection.delete(key))
    .catch(() => false);
};

module.exports = {
  ...mongoose,
  init,
  database: { set: Set, get: Get, has: Has, delete: Delete, collection }
};
