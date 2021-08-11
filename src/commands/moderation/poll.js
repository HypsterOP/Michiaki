/* eslint-disable class-methods-use-this */
const Command = require("../../structures/command");
const {
  Message,
  Permissions,
  MessageCollector,
  MessageEmbed
} = require("discord.js");

module.exports = class PollCommand extends Command {
  constructor(...args) {
    super(...args, {
      guildOnly: true,
      ownerOnly: false
    });
  }

  /**
   * @param {Message} message
   * @param {String[]} args
   */
  async do(message, args) {
    try {
      if (!message.member.permissions.has(Permissions.FLAGS.MENTION_EVERYONE)) {
        return;
      }

      const q = args.join("");

      if (!q) {
        return message.channel.send({ content: "Please specify a question!" });
      }

      let mention = "";

      const msg = await message.channel.send({
        content: "Would you like to add a mention to your poll?\nSay `yes` or `no`"
      });

      const collector = new MessageCollector(
        message.channel,
        (m) => m.author.id === message.author.id,
        { time: 25000000 }
      );

      collector.on("collect", async (msgg) => {
        if (msgg.content.toLowerCase() === "no") {
          msgg.delete();
          msg.delete();
          collector.stop(true);
        }

        if (msgg.content.toLowerCase() === "yes") {
          msgg.delete();
          msg.delete();
          const msggg = await message.channel.send({
            content: "Type `everyone` to mention `@everyone` or `here` to mention `@here`!"
          });
          const c = new MessageCollector(
            message.channel,
            (m) => m.author.id === message.author.id,
            { time: 60000 }
          );
          c.on("collect", (ms) => {
            if (ms.content.toLowerCase() === "here") {
              mention = "@here";
              msggg.delete();
              ms.delete();
              collector.stop(true);
            } else if (ms.content.toLowerCase() === "everyone") {
              mention = "@everyone";
              msggg.delete();
              ms.delete();
              collector.stop(true);
              c.stop(true);
            }
          });
          c.on("end", (collected, reason) => {
            if (reason === "time") {
              return message.channel.send({
                content: "Time is up! Try again later."
              });
            }
          });
        }
      });

      collector.on("end", (collected, reason) => {
        if (reason === "time") {
          return message.channel.send({
            content: "Time is up! Try again later."
          });
        }

        const embed = new MessageEmbed()
          .setAuthor("📊 Poll:")
          .setColor("#2f3136")
          .addField(
            `Question: ${q}`,
            "React with <:success:873954814025924620> or <:error:873956081200693309>"
          );

        message.channel
          .send({ content: mention || "New Poll", embeds: [embed] })
          .then(async (bla) => {
            await bla.react("<:success:873954814025924620>");
            await bla.react("<:error:873956081200693309>");
          });
      });
    } catch (err) {
      return message.channel.send({ content: err });
    }
  }
};
