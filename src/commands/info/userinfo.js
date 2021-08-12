const Command = require("../../structures/command");
const { Message, MessageEmbed, Formatters } = require("discord.js");

module.exports = class UserinfoCommand extends Command {
  constructor(...args) {
    super(...args, {
      id: "Userinfo",
      aliases: ['ui', 'info']
    });
  }

  /**
   * @param {Message} message
   * @param {String[]} args
   */
  async do(message, args) {
    try {
      const user =
        message.mentions.members.first() ||
        message.guild.members.cache.get(args[0]) ||
        message.member;

        let userRoles = user.roles.cache
          .map((x) => x)
          .filter((z) => z.name !== "@everyone");

        if (userRoles.length > 100) {
          userRoles = "More than 100";
        }

        let userStatm;
        let userStat = user.presence.status;

        if (userStat === "online")
          userStatm = `Online <:Online:863277900543033414> `;
        if (userStat === "offline")
          userStatm = `Offline <:Offline:863278308644225036> `;
        if (userStat === "idle") userStatm = `Idle <:Idle:863278184896528384>`;
        if (userStat === "dnd")
          userStatm = `Do not disturb <:discorddnd:757485967266545704>`;

          let nitroBadge = user.user.avatarURL({ dynamic: true });
          let flags = user.user.flags.toArray().join(``);

          if (!flags) {
            flags = "None";
          }

        flags = flags.replace(
          "HOUSE_BRAVERY",
          "• <:brave:863279903049515018>`HypeSquad Bravery`"
        );
        flags = flags.replace(
          "EARLY_SUPPORTER",
          "• <a:nitro:740923343548579890> `Early Supporter`"
        );
        flags = flags.replace(
          "VERIFIED_DEVELOPER",
          "• <:discordbotdev:757489652214267904> `Verified Bot Developer`"
        );
        flags = flags.replace(
          "EARLY_VERIFIED_DEVELOPER",
          "• <:discordbotdev:757489652214267904> `Verified Bot Developer`"
        );
        flags = flags.replace(
          "HOUSE_BRILLIANCE",
          "• <:Brilliance:863282670679097377> `HypeSquad Brilliance`"
        );
        flags = flags.replace(
          "HOUSE_BALANCE",
          "• <:brave:863279903049515018>`HypeSquad Balance`"
        );
        flags = flags.replace(
          "DISCORD_PARTNER",
          "• <:Partner:863279621323096074> `Partner`"
        );
        flags = flags.replace(
          "HYPESQUAD_EVENTS",
          "• <:hypesquad_events:863280181170274304>`Hypesquad Events`"
        );
        flags = flags.replace(
          "DISCORD_CLASSIC",
          "• <a:Classic:863280475463221250>`Discord Classic`"
        );

        if (nitroBadge.includes("gif")) {
          flags =
            flags +
            `
      • <:NitroBoost:863280744818278400>  \`Nitro\``;
        }

        const embed = new MessageEmbed()
        .setAuthor(user.user.tag, user.user.displayAvatarURL({ dynamic: true }))
        .addField(`**User Info**`,
            `ID: ${user.user.id}
            Account Created On: ${Formatters.time(user.user.createdAt)}
            Avatar: [Link](${user.user.displayAvatarURL({ dynamic: true })})
            Badges: ${flags}
            `
        )
        .addField(`Precense`,
        `Status: ${userStat}`)

        .addField(`Sever Member Info`, 
        `Booster: ${user.premiumSince ? "Yes" : "No"}
        Nickname: ${user.nickname ? user.nickname : "No Nickname"}
        Joined server on: ${Formatters.time(user.joinedAt)}`
        )

        .setColor('RANDOM')

        message.channel.send({ embeds: [embed] })
    } catch (err) {
      return message.channel.send({ content: err });
    }
  }
};
