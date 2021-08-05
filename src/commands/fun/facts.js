const Command = require("../../structures/command");
const { Message, MessageAttachment } = require("discord.js");

module.exports = class FactsCommand extends Command {
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
      const text = args.slice(0).join(' ')

      if(!text) return message.channel.send("please provide text.")
      this.client.memer.facts(text).then((image) => {
				const bb = new MessageAttachment(image, 'facts.png');
				message.channel.send({ files: [bb] });
			});
    } catch (err) {
      return message.channel.send({ content: err });
    }
  }
};
