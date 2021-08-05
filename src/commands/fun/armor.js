const Command = require("../../structures/command");
const { Message, MessageAttachment } = require("discord.js");

let memeToken = process.env.MEME;
const Meme = require('memer-api')
const meme = new Meme(memeToken)

module.exports = class ArmorCommand extends Command {
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
        const text = args.slice(0).join('')
        if(!text) return message.channel.send({ content: "Please provide some text." })

        await meme.armor(text).then(image => {
            const aaaa = new MessageAttachment(image, "armor.png")
            message.channel.send({ files: [aaaa] })
        })
      
    } catch (err) {
      return message.channel.send({ content: err });
    }
  }
};
