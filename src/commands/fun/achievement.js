const Command = require("../../structures/command");
const { Message, MessageAttachment } = require("discord.js");

module.exports = class AchieveCommand extends Command {
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
        return message.channel.send({ content: "Please provide some text." });
      }

      const link = await this.client.alexflipnote.image.achievement({
        text
      });

      message.channel.send({ files: [link] });
    } catch (err) {
      return message.channel.send({ content: err });
    }
  }
};
