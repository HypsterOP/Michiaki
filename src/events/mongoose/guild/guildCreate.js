/* eslint-disable no-useless-constructor */
const Event = require("../../../structures/event");

module.exports = class GuildCreateEvent extends Event {
  constructor(...args) {
    super(...args);
  }

  async do(guild) {
    const { config } = this.mongoose.models;

    const filter = { guild: guild.id };
    const update = { guild: guild.id };
    const data = await config.findOneAndUpdate(filter, update, {
      new: true,
      upsert: true
    });
    if (data) {
      log.success("Mongoose Database", guild.name + " was registered");
    }
  }
};
