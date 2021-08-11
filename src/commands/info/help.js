/* eslint-disable no-continue */
/* eslint-disable class-methods-use-this */
const Command = require("../../structures/command");
const { Formatters, Message } = require("discord.js");

module.exports = class HelpCommand extends Command {
  constructor(...args) {
    super(...args, {
      usage: ""
    });
  }

  /**
   * @param {Message} message
   * @param {String[]} args
   */
  async do(message, args) {
    const [commandName] = args;
    const { config } = this.mongoose.models;
    const settings = await config.findOne({ guild: message.guild?.id });
    const prefix = settings?.prefix ?? this.client.config.prefix;
    const command =
      this.client.commands.get(commandName) ||
      this.client.commands.find(
        (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
      );
    if (command) {
      const embed = new Embed();
      embed.setTitle(this.capitalise(command.name));
      embed.setDescription(
        require("common-tags").stripIndents(`
        ${command.description}\n
          **❯ Aliases:** ${
  command.aliases.length ? command.aliases.map((alias) => `\`\`${alias}\`\``).join(", ") : "No alias provided"
}
          **❯ Usage:** ${
  command.usage.length ? `\`\`\`${command.usage}\`\`\`` : "No usage provided"
}
        `)
      );
      return message.channel.send({ embeds: [embed] });
    }

    const embeds = [];
    const info = new Embed();
    info.addBanner();
    info.setDescription(
      Formatters.codeBlock(
        "yaml",
        require("common-tags").stripIndents(`
				Prefix: ${prefix.length >= 4 ? `${prefix} ` : prefix}
				Parameters: <> = required, [] = optional
			`)
      )
    );
    embeds.push(info);
    const menu = {
      id: "selectnow",
      placeholder: "Select a category.",
      options: []
    };
    menu.options.push({
      id: "select_home",
      label: "Back to Home",
      emoji: "🏠",
      description: "Return to the main category."
    });

    const collection = this.client.commands.map(({ category }) => category);
    const removeDuplicates = (arr) => [...new Set(arr)];
    const categories = removeDuplicates(collection);

    for (const category of categories) {
      const commands = this.client.commands.filter(
        ({ category: { name } }) => name === category.name
      );
      if (
        category?.hide &&
        !this.client.config.bot.contributors.includes(message.author.id)
      ) {
        continue;
      }

      const embed = new Embed();
      embed.setTitle(`__${this.capitalise(category.name)} Commands__`);
      embed.setDescription(
        Formatters.blockQuote(
          `For additional info on a command, use \`${prefix}help <command>\``
        )
      );
      commands.forEach((command) => {
        if (
          command?.ownerOnly &&
          !this.client.config.bot.contributors.includes(message.author.id)
        ) {
          return;
        }

        embed.addField(`\`${command.name}\``, command.description, true);
      });
      embeds.push(embed);
      const select = {
        id: category.name.replace(/\s/g, "_"),
        label: this.capitalise(category?.name),
        emoji: category?.emoji,
        description:
          category?.description ??
          `Get commands from the ${category?.name} category.`
      };
      menu.options.push(select);
    }

    return michiaki.interaction.embed.menu({
      channel: message.channel,
      userID: message.author.id,
      embeds,
      menu
    });
  }

  capitalise(string) {
    return string
      .split(" ")
      .map((str) => str.slice(0, 1).toUpperCase() + str.slice(1))
      .join(" ");
  }
};
