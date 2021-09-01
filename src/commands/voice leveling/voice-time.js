const Command = require("../../structures/command");
const { Message, MessageEmbed } = require("discord.js");
const ms = require("ms");

module.exports = class Voice_TimeCommand extends Command {
  constructor(...args) {
    super(...args, {
      id: "Voice_Time",
    });
  }

  /**
   * @param {Message} message
   * @param {String[]} args
   */
  async do(message, args) {
    try {
      const userData = this.client.voiceManager.users.find(
        (u) => u.guildId === message.guild.id && u.userId === message.author.id
      );
      if (!userData)
        return message.channel.send({
          content: `Looks like you haven't been in the vc yet.`,
        });
      const embed = new MessageEmbed()
        .setAuthor(
          `Total Voice Time`,
          message.author.displayAvatarURL({ dynamic: true })
        )
        .setDescription(`Voice Time: ${ms(userData.voiceTime.total)}`);

      message.channel.send({ embeds: [embed] });
    } catch (err) {
      return message.channel.send({ content: err });
    }
  }
};
