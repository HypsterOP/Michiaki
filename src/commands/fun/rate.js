const Command = require("../../structures/command");
const { Message } = require("discord.js");

module.exports = class RateCommand extends Command {
  constructor(...args) {
    super(...args, {
      id: "Rate"
    });
  }

  /**
   * @param {Message} message
   * @param {String[]} args
   */
  async do(message, args) {
    try {
      const text = args.slice(0).join(' ');

      if(!text) return message.channel.send({ content: `What should i rate 🤔` });

      const rate = Math.random() * 101;

      message.channel.send({ content: `:notepad_spiral: I'd rate \`${text}\` a solid **${rate.toFixed(3)} / 100%**` })
    } catch (err) {
      return message.channel.send({ content: err });
    }
  }
};
