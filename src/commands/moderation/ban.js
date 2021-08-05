const Command = require('../../structures/command');
const { Message, Permissions } = require('discord.js');

module.exports = class nameCommand extends Command {
	constructor(...args) {
		super(...args, {});
	}

	/**
	 * @param {Message} message
	 * @param {String[]} args
	 */
	async do(message, args) {
		try {
			if (!message.member.permissions.has(Permissions.FLAGS.BAN_MEMBERS))
				return;
			if (!message.guild.me.permissions.has(Permissions.FLAGS.BAN_MEMBERS))
				return message.channel.send({
					content: `I do not have the permissions \`BAN_MEMBERS\``,
				});
			let user =
				message.mentions.members.first() ||
				message.guild.members.cache.get(args[0]) ||
				message.guild.members.cache.find((x) => x.user.username === args[0]) ||
				message.guild.members.cache.find((x) => x.nickname === args[0]);

			if (!user) return message.channel.send({ content: 'User not found.' });

			if (user.id === this.client.user.id)
				return message.channel.send({ content: `Please don't ban me.` });

			if (user.id === message.author.id)
				return message.channel.send({
					content: `Why do u want to ban your self?`,
				});

			if (user.id === message.guild.ownerId)
				return message.channel.send({
					content: `You cannot ban the owner from their own server.`,
				});

			if (
				message.member.roles.highest.position <= user.roles.highest.position
			) {
				return message.channel.send({
					content: `You cannot Ban this user due to role Hierarchy`,
				});
			}

			let why = args.slice(1).join(' ');

			if (user.bannable) {
				user.ban({ reason: why }) &&
					message.channel.send({ content: `Banned ${user.user.tag}.` });
			} else {
				message.channel.send({ content: `I am not able to Ban this user.` });
			}
		} catch (err) {
			return message.channel.send({ content: err });
		}
	}
};
