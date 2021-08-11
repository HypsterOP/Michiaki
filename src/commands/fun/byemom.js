const Command = require("../../structures/command");
const { Message, MessageAttachment } = require("discord.js");

module.exports = class ByeMomCommand extends Command {
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
        return message.channel.send({ content: "Please provide some text" });
      }

      this.client.memer
        .byemom(
          message.author.displayAvatarURL({ format: "png" }),
          message.author.username,
          text
        )
        .then((image) => {
          const aa = new MessageAttachment(image, "byemom.png");
          message.channel.send({ files: [aa] });
        });
    } catch (err) {
      return message.channel.send({ content: err });
    }
  }
};
