const SlashCommand = require('../../structures/slash-command');
const { CommandInteraction } = require('discord.js');

module.exports = class PingCommand extends SlashCommand {
	constructor(...args) {
		super(...args, {
			description: 'Health check',
		});
	}

	/**
	 * @param {CommandInteraction} interaction
	 * @param {import("discord.js").CommandInteractionOption{}} args
	 */
	async do(interaction, args) {
		await interaction.deferReply({ ephemeral: true });
		const embed = new Embed();
		embed.setTitle('Ping');
		embed.setDescription(`**\`${this.client.ws.ping}\`** ms`);

		return interaction.editReply({ embeds: [embed] });
	}
};
