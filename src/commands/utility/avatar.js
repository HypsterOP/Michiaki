const Command = require("../../structures/command");
const { Message, MessageEmbed } = require("discord.js");

module.exports = class AvatarCommand extends Command {
  constructor(...args) {
    super(...args, {
      id: "Avatar",
      description: 'Avatar command...'
    });
  }

  /**
   * @param {Message} message
   * @param {String[]} args
   */
  async do(message, args) {
    try {
      const user = message.member || message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.guild.members.cache.find(x => x.displayName === args[0])
      if(!user) return message.channel.send({ content: `User Not Found.` })

      const av = user.user.displayAvatarURL({ dynamic: true })

      const embed = new MessageEmbed()
        .setTitle(`${user.user.tag}'s Avatar`)
        .setDescription(
          `[PNG](${user.user.displayAvatarURL({
            format: "png",
          })}) | [JPG](${user.user.displayAvatarURL({
            format: "jpg",
          })}) | [JPEG](${user.user.displayAvatarURL({
            format: "jpeg",
          })}) | [WEBP](${user.user.displayAvatarURL({
            format: "webp",
          })}) | [GIF](${user.user.displayAvatarURL({ format: 'gif' })})`
        )
        .setImage(av)
        .setColor('NOT_QUITE_BLACK');

        message.channel.send({ embeds: [embed] })
    } catch (err) {
      return message.channel.send({ content: err });
    }
  }
};
