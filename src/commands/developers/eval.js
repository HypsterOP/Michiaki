const Command = require('../../structures/command');
const { Formatters, Message, MessageAttachment } = require('discord.js');

const PrettyError = require('pretty-error');
const pe = new PrettyError();
pe.withoutColors();

module.exports = class EvalCommand extends Command {
	constructor(...args) {
		super(...args, {
			ownerOnly: true,
			usage: '<content>',
		});
	}

	/**
	 * @param {Message} message
	 * @param {String[]} args
	 */
	async do(message, args) {
		if (!args.length) {
			return message.channel.send({ content: 'I need some code to evaluate.' });
		}

		const content = args.join(' ').replace(/(^`{3}(\w+)?|`{3}$)/g, '');
		const { client } = this;
		// If (["347342453633712128"].some((x) => x.includes(message.author.id))) return message.channel.send({ content: "No, you cant use this eval anymore,.." });
		// if (["for (", "for(", "forEach"].some((x) => content.includes(x))) return message.channel.send({ content: "No, you cant use forloop" });
		// if (["process", "destroy", "leave", "database", "kick", "ban", "delete", "add", "remove", "set"].some((x) => content.includes(x)) && this.client.config.bot.contributors.some((owner) => owner !== message.author.id)) return message.channel.send({ content: "Nope, you can't do that." });
		const result = new Promise((resolve, reject) => resolve(eval(content)));

		return result
			.then((output) => {
				if (typeof output !== 'string') {
					output = require('util').inspect(output, { depth: 3 });
				}

				log.info('Command Evaluated', output);

				output = String(output);
				output = this.clean(output);

				if (output.length <= 2000) {
					return message.channel.send({
						content: Formatters.codeBlock('js', output),
					});
				}

				if (this.check(output, '/structures/')) {
					evaled +=
						'\n\n//Author: Nekoyasui#1100 (817238971255488533)\n//Join my server: https://discord.gg/n6EnQcQNxg';
				}

				return message.channel.send({
					files: [new MessageAttachment(Buffer.from(output), 'output.json')],
				});
			})
			.catch((err) => {
				err = pe.render(err) ?? err;
				err = this.clean(err);
				message.channel.send({ content: Formatters.codeBlock('xl', err) });
			});
	}

	check(script, value) {
		if (Array.isArray(value)) {
			return value.some((str) => String(script).toLowerCase().includes(str));
		}

		if (typeof value === 'string') {
			return String(script).toLowerCase().includes(value);
		}

		throw "You can't check an object type.";
	}

	read(filepath) {
		return require('fs').readFileSync(filepath, 'utf8');
	}

	clean(text) {
		if (typeof text === 'string') {
			const regex = new RegExp('/home/runner/miwa-v13/', 'g');
			text = text
				.replace(/`/g, `\`${String.fromCharCode(8203)}`)
				.replace(/@/g, `@${String.fromCharCode(8203)}`)
				// .replace(/([a-z]+):([0-9]+):([0-9]+)/g, "$1#L$2-L$3")
				.replace(regex, '')
				.replace(
					new RegExp(this.client.token, 'g'),
					this.client.token
						.split('.')
						.map((val, i) =>
							i > 1 ? (val = this.client.utils.generate(27)) : val
						)
						.join('.')
				);
		}

		return text;
	}
};
