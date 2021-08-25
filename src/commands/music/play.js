const Command = require("../../structures/command");
const { Message, MessageEmbed } = require("discord.js");
const { getPreview, getTracks } = require("spotify-url-info");

module.exports = class PlayCommand extends Command {
  constructor(...args) {
    super(...args, {});
  }

  /**
   * @param {Message} message
   * @param {String[]} args
   */
  async do(message, args) {
    try {
      const { channel } = message.member.voice;

      if (!channel)
        return message.reply({ content: `Join a voice channel first.` });

      const song = args.slice(0).join(" ");
      const embed = new MessageEmbed()
        .setDescription(`Please mention a song.`)
        .setColor("RED");

      if (!song) return message.reply({ embeds: [embed] });

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
        });

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
        });

      if (
        args.join(" ").toLowerCase().includes("spotify") &&
        args.join(" ").toLowerCase().includes("track")
      ) {
        getPreview(args.join(" ")).then((result) => {
          this.client.distube.play(message, result.title);
        });
      } else if (
        args.join(" ").toLowerCase().includes("spotify") &&
        args.join(" ").toLowerCase().includes("playlist")
      ) {
        getTracks(args.join(" ")).then((result) => {
          for (const song of result)
            this.client.distube.play(message, song.name);
        });
      } else {
        this.client.distube.play(message, song);
      }
    } catch (err) {
      console.log(err);
    }
  }
};
