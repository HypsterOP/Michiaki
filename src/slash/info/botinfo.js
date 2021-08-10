const SlashCommand = require("../../structures/slash-command");
const { CommandInteraction } = require("discord.js");

module.exports = class BotInfoCommand extends SlashCommand {
  constructor(...args) {
    super(...args, {
    });
  }

  /**
   * @param {CommandInteraction} interaction 
   * @param {import('discord.js').CommandInteractionOption[]} args
   */
  async do(interaction, args) {
      await interaction.deferReply({ ephemeral: true })
      const { models } = require('mongoose');
			const Values = Object.values(models);

			const totalEntries = await Values.reduce(async (accumulator, model) => {
				const counts = await model.countDocuments();
				return (await accumulator) + counts;
			}, Promise.resolve(0));
			let userclient = this.client.user.username;
			const uptime = moment
				.duration(this.client.uptime)
				.format(`D [days] H [hrs] m [mins] s [seconds]`);

			const guilds = this.client.guilds.cache.size.toLocaleString();
			const users = this.client.users.cache.size.toLocaleString();
			const channels = this.client.channels.cache.size.toLocaleString();
			let commands = this.client.commands.size;
			cpuStat.usagePercent(async function (error, percent, seconds) {
				if (error) {
					return console.error(error);
				}
				const cores = os.cpus().length;
				const cpuModel = os.cpus()[0].model;
				const node = process.version;
				const CPU = percent.toFixed(2);
				const { totalMemMb, usedMemMb } = await mem.info();

				interaction.editReply({
					content: `ℹ️About **${userclient}** | v${version}\`\`\`fix
Developer: HypsterOP#5687
Library: discord.js, version: ${version1}
Servers: ${guilds}
Users: ${users}
Latest Reboot: ${uptime} ago
RAM: ${totalMemMb}MB
Commands Loaded: ${commands}
Database Entries: ${totalEntries}
\`\`\`
      `,
				});
			});
  }
};