const Command = require("../../structures/command");
const { Message } = require("discord.js");

module.exports = class ChallengeCommand extends Command {
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
      if (!text) {
        return message.channel.send({ content: "Please specify some text." });
      }
      const link = await this.client.alexflipnote.image.challenge({ text });
      message.channel.send({ files: [link] });
    } catch (err) {
      return message.channel.send({ content: err });
    }
  }
};
