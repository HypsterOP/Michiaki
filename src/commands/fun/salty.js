const Command = require("../../structures/command");
const { Message } = require("discord.js");

module.exports = class SaltyCommand extends Command {
  constructor(...args) {
    super(...args, {});
  }

  /**
   * @param {Message} message
   * @param {String[]} args
   */
  async do(message, args) {
    try {
      const user = message.mentions.users.first() || message.author;

      const av = user.displayAvatarURL({ format: "png" });

      const link = await this.client.alexflipnote.image.salty({ image: av });

      message.channel.send({ files: [link] });
    } catch (err) {
      return message.channel.send({ content: err });
    }
  }
};
