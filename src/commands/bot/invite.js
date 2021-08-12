const Command = require("../../structures/command");
const { Message, MessageButton, MessageActionRow, MessageEmbed } = require("discord.js");

module.exports = class InviteCommand extends Command {
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
      const defaultInvite = new MessageButton()
        .setStyle("LINK")
        .setLabel("Default Invite")
        .setURL(
          "https://discord.com/api/oauth2/authorize?client_id=872698132700495873&permissions=0&scope=bot%20applications.commands"
        );

    const recomendedInvite = new MessageButton()
      .setStyle("LINK")
      .setLabel(`Recommended Invite`)
      .setURL(
        `https://discord.com/api/oauth2/authorize?client_id=872698132700495873&permissions=8&scope=bot%20applications.commands`
      );

    const supportServerInvite = new MessageButton()
      .setStyle("LINK")
      .setLabel("Join the support server")
      .setURL("https://discord.gg/RHRgmAmYnf");

      let embed = new MessageEmbed()
      .setDescription(`Choose the link.`)
      .setColor(`#2f3136`)

      let rowe = new MessageActionRow()
      .addComponents(defaultInvite, recomendedInvite, supportServerInvite);

      message.channel.send({ embeds: embed, components: rowe })
    } catch (err) {
      return message.channel.send({ content: err });
    }
  }
};
