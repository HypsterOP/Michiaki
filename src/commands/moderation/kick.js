const Command = require("../../structures/command");
const { Message } = require("discord.js");

module.exports = class nameCommand extends Command {
  constructor(...args) {
    super(...args, {
      usage: "<@user> [reason]"
    });
  }

  /**
   * @param {Message} message
   * @param {String[]} args
   */
  async do(message, args) {
    try {
      code
    } catch (err) {
      return message.channel.send({ content: err });
    }
  }
};
