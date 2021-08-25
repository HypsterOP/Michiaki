/* eslint-disable multiline-ternary */
/* eslint-disable class-methods-use-this */
const Command = require("../../structures/command");
const { Message } = require("discord.js");

module.exports = class CoinflipCommand extends Command {
  constructor(...args) {
    super(...args, {
      guildOnly: false,
      description: "Heads or tails!",
    });
  }

  /**
   * @param {Message} message
   * @param {String[]} args
   */
  async do(message, args) {
    try {
      const heads = Math.floor(Math.random() * 2);
      heads
        ? message.channel.send({ content: "The coin landed on heads! :coin:" })
        : message.channel.send({ content: "The coin landed on tails! :coin:" });
    } catch (err) {
      return message.channel.send({ content: err });
    }
  }
};
