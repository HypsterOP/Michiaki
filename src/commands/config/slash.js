const Command = require('../../structures/command');
const { Message } = require('discord.js');

module.exports = class SlashCommand extends Command {
	constructor(...args) {
		super(...args, {
			usage: '<options[enable|disable|reload]>',
		});
	}

	/**
	 * @param {Message} message
	 * @param {String[]} args
	 */
	async do(message, [key]) {
		const removeDuplicates = (arr) => [...new Set(arr)];
		try {
			switch (key.toLowerCase()) {
				case 'enable': {
					return message.guild.commands.fetch().then((x) => {
						if (x.size) {
							return message.channel.send({
								content: 'Slash command are already enabled.',
							});
						}

						const categories = removeDuplicates(
							this.client.slashCommands.map((c) => c.category)
						);
						const slash = [];

						categories.forEach((category) => {
							slash.push({
								name: category,
								description: 'There is no description for this slash category',
								options: this.client.slashCommands
									.filter((c) => c.category === category)
									.map((x) => ({
										type: 1,
										name: x.name,
										description: x.description,
										options: x.options,
									})),
							});
						});
						message.guild.commands.set(slash);

						return message.channel.send({
							content: 'Slash command has been enabled.',
						});
					});
				}

				case 'disable': {
					return message.guild.commands.fetch().then((x) => {
						if (!x.size) {
							return message.channel.send({
								content: 'Slash command are already disabled.',
							});
						}

						message.guild.commands.set([]);
						return message.channel.send({
							content: 'Slash command has been disabled.',
						});
					});
				}

				case 'reload': {
					return message.guild.commands.fetch().then((x) => {
						if (!x.size) {
							return message.channel.send({
								content: 'Slash command is currently disabled.',
							});
						}

						const categories = removeDuplicates(
							this.client.slashCommands.map((c) => c.category)
						);
						const slash = [];

						categories.forEach((category) => {
							slash.push({
								name: category,
								description: 'There is no description for this slash category',
								options: this.client.slashCommands
									.filter((c) => c.category === category)
									.map((x) => ({
										type: 1,
										name: x.name,
										description: x.description,
										options: x.options,
									})),
							});
						});
						message.guild.commands.set(slash);

						return message.channel.send({
							content: 'Slash command has been reloaded.',
						});
					});
				}

				case 'reload-guilds': {
					this.client.guilds.cache.forEach((guild) => {
						if (!guild.me.permissions.has(['USE_APPLICATION_COMMANDS'])) {
							return;
						}

						guild.commands
							.fetch()
							.then((x) => {
								if (x.size) {
									const categories = removeDuplicates(
										this.client.slashCommands.map((c) => c.category)
									);
									const slash = [];

									categories.forEach((category) => {
										slash.push({
											name: category,
											description:
												'There is no description for this slash category',
											options: this.client.slashCommands
												.filter((c) => c.category === category)
												.map((x) => ({
													type: 1,
													name: x.name,
													description: x.description,
													options: x.options,
												})),
										});
									});
									return guild.commands
										.set(slash)
										.then(() =>
											log.success(
												'Discord Slash Command',
												`registered in ${guild.name}`
											)
										)
										.catch(() => {});
								}
							})
							.catch(() => {});
					});
					return message.channel.send({
						content: 'Slash Command has been reloaded to enabled guilds',
					});
				}

				default:
					return message.channel.send({
						content: 'wrong args! (enable|disable|reload).',
					});
			}
		} catch (_) {
			return message.channel.send({
				content: 'I do not have the permission to enable the slash commands.',
			});
		}
	}
};
