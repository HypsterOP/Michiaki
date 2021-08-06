const Command = require('../../structures/command');
const { Message } = require('discord.js');
const { version } = require('../../../package.json');
const { mem, cpu } = require('node-os-utils');
const mongoose = require('mongoose');
let m = require('moment-duration-format'),
	os = require('os'),
	cpuStat = require('cpu-stat'),
	ms = require('ms'),
	moment = require('moment');
const version1 = require('discord.js').version;

module.exports = class BotInfoCommand extends Command {
	constructor(...args) {
		super(...args, {});
	}

	/**
	 * @param {Message} message
	 * @param {String[]} args
	 */
	async do(message, args) {
		try {
			const { config } = this.mongoose.models;
			let userclient = this.client.user.username;
			let database = config.countDocuments({});
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

				message.channel.send({
					content: `ℹ️About **${userclient}** | v${version}\`\`\`fix
Developer: HypsterOP#5687
Library: discord.js, version: ${version1}
Servers: ${guilds}
Users: ${users}
Latest Reboot: ${uptime} ago
RAM: ${totalMemMb}MB
Commands Loaded: ${commands}
\`\`\`
      `,
				});
			});
		} catch (err) {
			return message.channel.send({ content: err });
		}
	}
};
