const Event = require("../../structures/event");
const { CommandInteraction } = require("discord.js");

module.exports = class InteractionCreateEvent extends Event {
  constructor(...args) {
    super(...args, {
      once: false
    });
  }

  /**
   * @param {CommandInteraction} interaction
   **/
  async do(interaction) {
    if (!interaction.isCommand()) {
      return;
    }

    // Const args = interaction.options._options.map((x) => x.value);
    const args = this.transformInteraction([...interaction.options.data]);

    if (!interaction.guild) {
      return interaction.reply({
        content: "Slash commands must be in a server"
      });
    }

    const command = this.client.slashCommands.get(
      interaction.options._subcommand
    );
    if (!command) {
      return interaction.reply({ content: "Error..." });
    }

    try {
      await command.do(interaction, args);
    } catch (error) {
      return log.error(
        "Getting Slash Command",
        `'${command.name}.js' => ${require("util").inspect(error, {
          depth: 3
        })}`
      );
    }
  }

  transformInteraction(options) {
    const opts = {};
    for (const top of options) {
      if (top.type === "SUB_COMMAND" || top.type === "SUB_COMMAND_GROUP") {
        opts[top.name] = this.transformInteraction(
          top.options ? [...top.options] : []
        );
      } else if (top.type === "USER") {
        opts[top.name] = { user: top.user, member: top.member };
      } else if (top.type === "CHANNEL") {
        opts[top.name] = top.channel;
      } else if (top.type === "ROLE") {
        opts[top.name] = top.role;
      } else {
        opts[top.name] = top.value;
      }
    }

    return opts;
  }
};
