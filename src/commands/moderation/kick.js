const Command = require("../../structures/command");
const { Message, Permissions } = require("discord.js");

module.exports = class nameCommand extends Command {
  constructor(...args) {
    super(...args, {});
  }

  /**
   * @param {Message} message
   * @param {String[]} args
   */
  async do(message, args) {
    try {
      if (!message.member.permissions.has(Permissions.FLAGS.KICK_MEMBERS)) {
        return;
      }
      if (!message.guild.me.permissions.has(Permissions.FLAGS.KICK_MEMBERS)) {
        return message.channel.send({
          content: "I do not have the permissions `KICK_MEMBERS`"
        });
      }
      const user =
        message.mentions.members.first() ||
        message.guild.members.cache.get(args[0]) ||
        message.guild.members.cache.find((x) => x.user.username === args[0]) ||
        message.guild.members.cache.find((x) => x.nickname === args[0]);

      if (!user) {
        return message.channel.send({ content: "User not found." });
      }

      if (user.id === this.client.user.id) {
        return message.channel.send({ content: "Please don't kick me." });
      }

      if (user.id === message.author.id) {
        return message.channel.send({
          content: "Why do u want to kick your self?"
        });
      }

      if (user.id === message.guild.ownerId) {
        return message.channel.send({
          content: "You cannot kick the owner from their own server."
        });
      }

      if (
        message.member.roles.highest.position <= user.roles.highest.position
      ) {
        return message.channel.send({
          content: "You cannot kick this user due to role Hierarchy"
        });
      }

      const why = args.slice(1).join(" ");

      if (user.kickable) {
        user.kick({ reason: why }) &&
          message.channel.send({ content: `Kicked ${user.user.tag}.` });
      } else {
        message.channel.send({ content: "I am not able to kick this user." });
      }
    } catch (err) {
      return message.channel.send({ content: err });
    }
  }
};
