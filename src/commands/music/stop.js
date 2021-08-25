const Command = require("../../structures/command");
const { Message, MessageEmbed } = require("discord.js");

module.exports = class StopCommand extends Command {
  constructor(...args) {
    super(...args, {
      id: "Stop"
    });
  }

  /**
   * @param {Message} message
   * @param {String[]} args
   */
  async do(message, args) {
    try {
      const { channel } = message.member.voice;
      if (!channel)
        return message.reply({ content: `Join a voice channel first.` })

        if (
          this.client.distube.getQueue(message) &&
          channel.id !== message.guild.me.voice.channel.id
        )
          return message.channel.send({
            embeds: [
              new MessageEmbed()
                .setColor("RED")

                .setTitle(`Please join **my** Channel first`)
                .setDescription(
                  `Channel name: \`${message.guild.me.voice.channel.name}\``
                ),
            ],
          })

          message.channel.send({
              embeds: [
                  new MessageEmbed()
                  .setTitle(`Stopped playing! Thank you for using michiaki music! :heart:`)
                  .setColor('RANDOM')
              ]
          })

          this.client.distube.stop(message);
    } catch (err) {
      return message.channel.send({ content: err });
    }
  }
};
