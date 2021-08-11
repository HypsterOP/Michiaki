/* eslint-disable no-useless-constructor */
const Event = require("../../structures/event");

module.exports = class ReadyEvent extends Event {
  constructor(...args) {
    super(...args);
  }

  async do(guild) {
    const { config } = this.mongoose.models;

    const guilds = this.client.guilds.cache.array();
    for (const guild of guilds) {
      const filter = { guild: guild.id };
      const update = { guild: guild.id };
      let data = await config.findOne(filter);
      if (!data) {
        data = new config(update);
        data.save();
        log.success("Mongoose Database", guild.name + " was registered");
      }
    }
  }
};
