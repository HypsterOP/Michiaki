const Command = require("../../structures/command");
const { Message, MessageAttachment } = require("discord.js");

module.exports = class EggCommand extends Command {
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

      await this.client.memer
        .egg(user.displayAvatarURL({ format: "png" }))
        .then((image) => {
          const aa = new MessageAttachment(image, "egg.png");
          message.channel.send({ files: [aa] });
        });
    } catch (err) {
      return message.channel.send({ content: err });
    }
  }
};
