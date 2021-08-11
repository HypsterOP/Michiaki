/* eslint-disable no-useless-constructor */
const Event = require("../../../structures/event");

module.exports = class GuildDeleteEvent extends Event {
  constructor(...args) {
    super(...args);
  }

  async do(guild) {
    const { config } = this.mongoose.models;

    const filter = { guild: guild.id };
    const data = await config.findOneAndDelete(filter);
    if (data) {
      log.success("Mongoose Database", guild.name + " was unregistered");
    }
  }
};
