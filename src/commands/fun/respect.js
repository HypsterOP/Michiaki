const Command = require("../../structures/command");
const { Message, MessageEmbed } = require("discord.js");

module.exports = class RespectCommand extends Command {
  constructor(...args) {
    super(...args, {
      id: "Respect",
      aliases: ["f", "rp", "+rp"],
      examples: ["respect", "f", "rp @HypsterOP"],
    });
  }

  /**
   * @param {Message} message
   * @param {String[]} args
   */
  async do(message, args) {
    try {
      const embed = new MessageEmbed()
        .setColor("NOT_QUITE_BLACK")
        .setFooter(`Press F to pay respect`)
        .setDescription(
          `${message.member} has paid their respect${
            args.length ? ` to ${args.join(" ")}.` : ""
          }`
        );
      const f = await message.channel.send({ embeds: [embed] });

      await message.delete().catch(() => null);

      return f.react("🇫");
    } catch (err) {
      return message.channel.send({ content: err });
    }
  }
};
