/* eslint-disable class-methods-use-this */
const Event = require("../../../structures/event");
const { connection } = require("mongoose");

module.exports = class MongoDBDisconnectedEvent extends Event {
  constructor(...args) {
    super(...args, {
      once: true,
      emitter: connection
    });
  }

  async do() {
    log.success("Mongoose Database", "MongoDB connection successfully opened.");
  }
};
