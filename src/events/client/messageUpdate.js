/* eslint-disable no-useless-constructor */
const Event = require("../../structures/event");

module.exports = class ReadyEvent extends Event {
  constructor(...args) {
    super(...args);
  }

  async do(_, message) {
    if (message.partial) {
      await message.fetch();
    }

    this.client.emit("message", message);
  }
};
