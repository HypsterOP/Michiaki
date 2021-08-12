const SlashCommand = require("../../structures/slash-command");
const { CommandInteraction } = require("discord.js");

module.exports = class CoinflipCommand extends SlashCommand {
  constructor(...args) {
    super(...args, {
      id: "Coinflip",
    });
  }

  /**
   * @param {CommandInteraction} interaction
   * @param {import('discord.js').CommandInteractionOption[]} args
   */
  async do(interaction, args) {
    const heads = Math.floor(Math.random() * 2);
    interaction.deferReply({ ephemeral: true });
    heads
      ? interaction.editReply({ content: "The coin landed on heads! :coin:" })
      : interaction.editReply({ content: "The coin landed on tails! :coin:" });
  }
};
