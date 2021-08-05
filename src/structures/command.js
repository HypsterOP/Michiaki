const { Message, Collection } = require('discord.js');

const Client = require('./client');
const ms = require('pretty-ms');

module.exports = class Command {
	/**
	 * Creates an instance of Command.
	 * @param {Object} data
	 * @param {Client} [data.client]
	 * @param {String} [data.name]
	 * @param {String} [data.directory]
	 * @param {Object} command
	 * @param {String} [command.id]
	 * @param {String} [command.description]
	 * @param {Array} [command.aliases]
	 * @param {Array} [command.usage]
	 * @param {Array} [command.examples]
	 * @param {String} [command.category]
	 * @param {Boolean} [command.guildOnly]
	 * @param {Boolean} [command.ownerOnly]
	 * @param {Array} [command.this.userPermissions]
	 * @param {Array} [command.this.clientPermissions]
	 * @param {Number} [command.ratelimit]
	 * @param {Boolean} [command.nsfw]
	 * @param {Boolean} [command.voice]
	 * @param {Boolean} [command.sameVoice]
	 * @param {Boolean} [command.premium]
	 * @param {Number} [command.used]
	 * @Memberof Command
	 */
	constructor(data, command = {}) {
		const { client, name, directory } = data;
		const category = require(`${directory}/module.json`);

		this.directory = directory;
		this.client = client;
		this.mongoose = client?.mongoose;
		this.name = command?.name ?? name;
		this.description =
			command?.description ?? 'There is no description for this command.';
		this.usage = command?.usage ?? [];
		this.aliases = command?.aliases ?? [];
		this.examples = command?.examples ?? [];
		this.category = Object.assign(category, {
			name: directory.split('/').pop(),
		});
		this.guildOnly = Boolean(command?.guildOnly ?? true);
		this.ownerOnly = Boolean(command?.ownerOnly ?? false);
		this.userPermissions = command?.userPermissions ?? [];
		this.clientPermissions = command?.clientPermissions ?? [];
		this.ratelimit = Number(command?.ratelimit ?? 5);
		this.nsfw = Boolean(command?.nsfw ?? false);
		this.voice = Boolean(command?.voice ?? false);
		this.sameVoice = Boolean(command?.sameVoice ?? false);
		this.premium = Boolean(command?.premium ?? false);
		this.usage = command?.usage ?? '';
	}

	get usages() {
		const regex = /([\w.*+?^${}()|\\]+)(?:\[|)([\w.*+?^${}()|\\]+|)/g;
		const matches = regex.execAll(this.usage);
		const res = [];
		for (const [_, req, opt] of matches) {
			const data = {};
			if (req) {
				data.req = req.toLowerCase();
			}

			if (opt) {
				data.opt = opt.trim();
			}

			res.push(data);
		}

		return res;
	}

	/**
	 * @param {Message} message
	 * @param {String[]} args
	 */
	do(message, args) {
		throw new Error(`Command ${this.name} doesn't have a default run method.`);
	}

	/**
	 * @param {Message} message
	 * @param {String[]} args
	 */
	required(message, args) {
		const canReact =
			(message.channel.type !== 'DM' &&
				message.channel
					.permissionsFor(this.client.user)
					.has(['ADD_REACTIONS', 'READ_MESSAGE_HISTORY'])) ??
			message.channel.type !== 'DM';
		const missingPermissions = [];
		const isOwner = (id) => this.client.config.bot.contributors.includes(id);
		const formatArray = (array, type = 'conjunction') =>
			new Intl.ListFormat('en-GB', { style: 'short', type }).format(array);
		const formatPermissions = (permissions) =>
			permissions
				.toLowerCase()
				.replace(/(^|"|_)(\S)/g, (string) => string.toUpperCase())
				.replace(/_/g, ' ')
				.replace(/Guild/g, 'Server')
				.replace(/Use Vad/g, 'Use Voice Acitvity');

		// Send Message Perm
		if (
			message.channel.type !== 'DM' &&
			!message.channel.permissionsFor(message.guild.me).has('SEND_MESSAGES')
		) {
			if (canReact) {
				message.react('🚫');
			}

			throw {
				dm: true,
				timeout: 10000,
				cnt: "`🚫` It seems like I can't send messages in that channel!",
			};
		} // NSFW
		else if (
			message.channel.type !== 'DM' &&
			this.nsfw &&
			!message.channel.nsfw
		) {
			if (canReact) {
				message.react('🚫');
			}

			throw {
				dm: false,
				timeout: 10000,
				cnt: '`🔞` This command can only be run in a nsfw message.channel.',
			};
		} // Voice Channel Only
		else if (
			message.channel.type !== 'DM' &&
			(this.voice ?? this.sameVoice) &&
			!message.member.voice.channel
		) {
			if (canReact) {
				message.react('🚫');
			}

			throw {
				dm: false,
				timeout: 10000,
				cnt: '`🚫` You must be in a voice channel to use this command.',
			};
		} else if (
			message.channel.type !== 'DM' &&
			(this.voice ?? this.sameVoice) &&
			!message.guild.me.voice.channel
		) {
			if (canReact) {
				message.react('🚫');
			}

			throw {
				dm: false,
				timeout: 10000,
				cnt: '`🚫` I must be in a voice channel to use this command.',
			};
		} else if (
			message.channel.type !== 'DM' &&
			this.sameVoice &&
			message.member.voice.channel.id !== message.guild.me.voice.channel?.id
		) {
			if (canReact) {
				message.react('🚫');
			}

			throw {
				dm: false,
				timeout: 10000,
				cnt: '`🚫` You need to be in the same voice channel as mine to use this command.',
			};
		} // Guild Only
		else if (this.guildOnly && message.channel.type === 'DM') {
			if (canReact) {
				message.react('🚫');
			}

			throw {
				dm: true,
				timeout: 10000,
				cnt: '`⚠️` This command cannot be executed on DM message.channel.',
			};
		} // Owner Only
		else if (
			this.ownerOnly &&
			this.client.config.bot.contributors.some(
				(owner) => owner !== message.author.id
			)
		) {
			if (canReact) {
				message.react('🚫');
			}

			throw {
				dm: false,
				timeout: 10000,
				cnt: '`♨️` This command can only be used by the developer of the bot.',
			};
		} // User Permissions
		else if (
			message.channel.type !== 'DM' &&
			this.userPermissions.length &&
			!this.client.config.bot.contributors.includes(message.author.id)
		) {
			const missingPermissions = message.channel
				.permissionsFor(message.member)
				.missing(this.userPermissions);
			if (missingPermissions.length) {
				if (canReact) {
					message.react('🚫');
				}

				throw {
					dm: false,
					timeout: 10000,
					cnt: `\`📛\` Your missing these required permissions: ${formatArray(
						missingPermissions.map((x) => formatPermissions(x))
					)}`,
				};
			}
		} // Client Permissions
		else if (message.channel.type !== 'DM' && this.clientPermissions.length) {
			const missingPermissions = message.channel
				.permissionsFor(this.client.user)
				.missing(this.clientPermissions);
			if (missingPermissions.length) {
				if (canReact) {
					message.react('🚫');
				}

				throw {
					dm: false,
					timeout: 10000,
					cnt: `\`📛\` I'm missing these required permissions: ${formatArray(
						missingPermissions.map((x) => formatPermissions(x))
					)}`,
				};
			}
		} else if (this.usages.length) {
			for (let i = 0; i < this.usages.length; i++) {
				if (!args[i] && this.usages[i].req) {
					throw {
						embed: true,
						dm: false,
						timeout: 10000,
						cnt: require('common-tags').stripIndents(`
					\`📛\` Missing arguments: \`\`${this.usages[i].req}\`\`${
							this.usages[i].opt
								? `\n\`⚙️\` Optional arguments: ${
										this.usages[i].opt.includes('|')
											? this.usages[i].opt
													.split('|')
													.map((x) => `\`\`${x}\`\``)
													.join(' ')
											: `\`\`${this.usages[i].opt}\`\``
								  }`
								: ''
						}
					\`📖\` Example: \`\`${this.name} ${this.usage}\`\`
					`),
					};
				}
			}
		} else {
			// Do nothing
		}

		if (!this.client.ratelimits.has(this.name)) {
			this.client.ratelimits.set(this.name, new Collection());
		}

		const now = Date.now();

		const ratelimit = this.client.ratelimits.get(this.name);
		const cooldown = this.ratelimit * 1000;

		if (ratelimit.has(message.author.id)) {
			const expire = ratelimit.get(message.author.id) + cooldown;
			if (now < expire) {
				const remaining = expire - now;
				if (canReact) {
					message.react('🚫');
				}

				throw {
					dm: false,
					timeout: remaining,
					cnt: `\`🛑\` Please wait **${ms(remaining, {
						verbose: true,
					})}** before attempting to use the \`${this.name}\` command again.`,
				};
			}
		} else if (canReact) {
			message.react('🆗');
		}

		ratelimit.set(message.author.id, now);
		setTimeout(() => ratelimit.delete(message.author.id), cooldown);
	}
};
