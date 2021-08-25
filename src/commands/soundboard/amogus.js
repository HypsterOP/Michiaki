const Command = require("../../structures/command");
const { Message } = require("discord.js");

const { join } = require('path');

const { joinVoiceChannel, createAudioPlayer, createAudioResource, NoSubscriberBehavior } = require('@discordjs/voice');

module.exports = class AmogUSCommand extends Command {
  constructor(...args) {
    super(...args, {
      id: "AmogUS",
    });
  }

  /**
   * @param {Message} message
   * @param {String[]} args
   */
  async do(message, args) {
    try { 
        if(!message.member.voice.channel) return message.reply({ content: `AMOGUS! Join voice channel you sussy human.` });
        const channel = message.member.voice.channel;
        
        const connection = joinVoiceChannel({
            channelId: channel.id,
          guildId: message.guild.id,
          adapterCreator: message.guild.voiceAdapterCreator,
      });

      const player = createAudioPlayer({
          behaviors: {
              noSubscriber: NoSubscriberBehavior.Pause,
          },
      });

      const resource = createAudioResource(join(__dirname, '../../../sound/AMOGUS Sound effect.m4a'));

      player.play(resource);
      message.reply({ content: `SUS SUS AMOGUS! I hope your not deafened sussy human.` })
        connection.subscribe(player);

        setTimeout(function() {
            try {
                connection.destroy();
            } catch (err) {
                return message.reply({ content: "Error!" });
            };
        }, 10000)
    } catch (err) {
      return message.channel.send({ content: err });
    }
  }
};
