const Command = require("../../structures/command");
const { Message } = require("discord.js");
const prem = require("../../structures/mongoose/models/premium")
const premKey = require("../../structures/mongoose/models/premiumKey");
const { prems } = require('../../../premiums');

module.exports = class PremiumCommand extends Command {
  constructor(...args) {
    super(...args, {
      id: "Premium",
      description: "Activate premium"
    });
  }

  /**
   * @param {Message} message
   * @param {String[]} args
   */
  async do(message, args) {
   const key = args[0];
    if (!key) return message.channel.send({content: "No key given"});
    if (key === "create") {
      if (message.author.id !== "800331322089537538")
        return message.channel.send({ content: "You cannot create keys" })
        new premKey({
           Key: Math.floor(Math.random() * 600000000000000),
         })

        .save()
        .then(() => {
          message.channel.send({content:  "Created key"});
        });
      return;
    }
     premKey.findOne({ Key: key }, async (err, data) => {
      if (!data)
        return message.channel.send(
          {content: "That key does not exist"}
        );
      prem.findOne({ Guild: message.guild.id }, async (err, data) => {
        if (!data) {
          new prem({
            Guild: message.guild.id,
          }).save();
          prems.set(message.guild.id, true);
          premKey.deleteOne({ Key: key }).exec();
          message.channel.send(
            {content: "This server is now premium. Enjoy!"}
          );
          (await message.guild.fetchOwner()).send({ content: `Your server ${message.guild.id} is now premium.` })
        } else
          return message.channel.send({content:
            "This server already has premium."
          });
      });
    })
  }
}
