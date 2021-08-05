const Command = require("../../structures/command");
const { Message } = require("discord.js");

module.exports = class PingCommand extends Command {
  constructor(...args) {
    super(...args, {
    });
  }

  /**
   * @param {Message} message
   * @param {String[]} args
   */
  async do(message, args) {
    try {
      const msg = await message.channel.send({ content: "Pinging The servers..." })
      const latency = msg.createdTimestamp - message.createdTimestamp;
      const ping = this.client.ws.ping;

      return msg.edit({
          content: [
              `API Ping: ${ping}ms`,
              `Message Latency: ${latency}ms`
          ].join('\n')
      })
    } catch (err) {
      return message.channel.send({ content: err });
    }
  }
};
