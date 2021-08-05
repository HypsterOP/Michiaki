const { CommandInteraction } = require('discord.js');

const Client = require('./client');

module.exports = class SlashCommand {
	/**
	 * Creates an instance of SlashCommand.
	 * @param {Object} data
	 * @param {Client} [data.client]
	 * @param {String} [data.name]
	 * @param {String} [data.directory]
	 * @param {Object} slash
	 * @param {String} [slash.description]
	 * @param {Array} [slash.options]
	 * @param {String} [slash.category]
	 * @param {Boolean} [slash.ownerOnly]
	 * @param {Array} [slash.userPermissions]
	 * @param {Array} [slash.clientPermissions]
	 * @param {Number} [slash.ratelimit]
	 * @param {Boolean} [slash.nsfw]
	 * @param {Boolean} [slash.voice]
	 * @param {Boolean} [slash.sameVoice]
	 * @param {Boolean} [slash.premium]
	 * @memberof Command
	 */
	constructor(data, slash = {}) {
		const { client, name, directory } = data;
		const category = directory.split('/').pop();

		this.directory = directory;
		this.client = client;
		this.mongoose = client?.mongoose;
		this.name = slash?.name ?? name;
		this.description =
			slash?.description ?? 'There is no description for this slash command.';
		this.options = slash?.options ?? [];
		this.category = category ?? 'miscellaneous';
		this.ownerOnly = Boolean(slash?.ownerOnly ?? false);
		this.userPermissions = slash?.userPermissions ?? [];
		this.clientPermissions = slash?.clientPermissions ?? [];
		this.ratelimit = Number(slash?.ratelimit ?? 5);
		this.nsfw = Boolean(slash?.nsfw ?? false);
		this.voice = Boolean(slash?.voice ?? false);
		this.sameVoice = Boolean(slash?.sameVoice ?? false);
		this.premium = Boolean(slash?.premium ?? false);
	}

	/**
	 * @param {CommandInteraction} interaction
	 * @param {import("discord.js").CommandInteractionOption{}} args
	 */
	do(interaction, args) {
		throw new Error(
			`Slash Command ${this.name} doesn't have a default run method.`
		);
	}
};
