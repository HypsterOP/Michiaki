const SlashCommand = require("../../structures/slash-command");
const { CommandInteraction } = require("discord.js");

module.exports = class AchievementCommand extends SlashCommand {
  constructor(...args) {
    super(...args, {
      options: [
        {
          name: "word",
          type: "STRING",
          description: "The text to put in the image",
          required: true
        }
      ]
    });
  }

  /**
   * @param {CommandInteraction} interaction
   * @param {import('discord.js').CommandInteractionOption[]} args
   */
  async do(interaction, args) {
    const word = interaction.options.getString("word");
    const image = await this.client.alexflipnote.image.achievement({ text: word });
    interaction.followUp({ files: [image], ephemeral: true })
  }
};
