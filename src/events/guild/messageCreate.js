const { Message } = require('discord.js');

const Event = require('../../structures/event');

module.exports = class MessageEvent extends Event {
	constructor(...args) {
		super(...args, {
			once: false,
		});
	}

	/**
	 * @param {Message} message
	 */
	async do(message) {
		if (message.author.bot || message.author.id === message.client.user.id) {
			return;
		}

		const { config } = this.mongoose.models;
		const settings = await config.findOne({ guild: message.guild?.id });
		const prefix = settings?.prefix ?? this.client.config.prefix;
		const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

		// prettier-ignore
		const prefixREGEX = new RegExp(`^(${prefix ? `${escapeRegex(prefix)}|` : ''}<@!?${this.client.user.id}>|${escapeRegex(this.client.user.username.toLowerCase())})`, 'i', '(s+)?');
		let prefixUSED = message.content.toLowerCase().match(prefixREGEX);
		prefixUSED = prefixUSED && prefixUSED.length && prefixUSED[0];

		let args;
		let commandName; // Arguments|CommandName
		if (prefixUSED) {
			args = message.content.slice(prefixUSED.length).trim().split(/ +/g);
			commandName = args.shift().toLowerCase();
		} else if (message.mentions.users.first()?.id === message.client.user.id) {
			args = message.content.trim().split(/ +/g);
			commandName = args.shift().toLowerCase();
		}

		const command =
			this.client.commands.get(commandName) ||
			this.client.commands.find(
				(cmd) => cmd.aliases && cmd.aliases.includes(commandName)
			);
		if (command) {
			try {
				command.required(message, args);
				await command.do(message, args);
			} catch (error) {
				if (error?.message) {
					// Return log.error("Getting Command", `'${command.name}.js' => ${require("util").inspect(error, { depth: 3 })}`);

					const PrettyError = require('pretty-error');
					const pe = new PrettyError();
					pe.withoutColors();
					error = pe.render(error) ?? error;
					return message.channel.send({
						content: require('discord.js').Formatters.codeBlock('xl', error),
					});
				}

				const data = {};
				if (!error?.embed) {
					data.content = error.cnt;
				} else {
					data.embeds = [new Embed().setDescription(error.cnt)];
				}

				if (error?.dm) {
					return message.author
						.send(data)
						.then((msg) => {
							setTimeout(() => msg.delete(), error.timeout);
						})
						.catch(() => null);
				}

				return message.channel
					.send(data)
					.then((msg) => {
						setTimeout(() => msg.delete(), error.timeout);
					})
					.catch(() => null);
			} finally {
				log.success('Command Executed', command.name);
			}
		} else {
			if (
				!message.content.startsWith(`<@!${this.client.user.id}>`) ||
				message.mentions.users.first()?.id !== this.client.user.id
			) {
				return;
			}

			if (message.content === `<@!${this.client.user.id}>`) {
				return message.channel.send({
					content: prefix
						? `In this guild, my prefix is **${prefix}**`
						: "In this guild, I don't even have a prefix.",
				});
			}

			const ops = {
				prefix: 'm!',
				invite: 'https://dsc.gg/Michiaki-server',
				description: 'api for Michiaki.',
				city: 'Hyderabad',
				country: 'India',
			};
			const chat = await michiaki.chat(message, ops);
			if (chat.error) {
				throw new Error(chat.message);
			}

			return message.channel.send(chat.data);
		}
	}
};
