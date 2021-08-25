const Command = require("../../structures/command");
const { Message } = require("discord.js");

const cowsay = require("cowsay");

module.exports = class CowSayCommand extends Command {
  constructor(...args) {
    super(...args, {});
  }

  /**
   * @param {Message} message
   * @param {String[]} args
   */
  async do(message, args) {
    try {
      const text = args.slice(0).join(" ");

      if (!text)
        return message.channel.send({ content: `Please provide some text...` });

      message.channel.send({
        content: `\`\`\`${cowsay.say({ text: text, e: "OO" })}\`\`\``,
      });
    } catch (err) {
      return message.channel.send({ content: err });
    }
  }
};
