require('dotenv/config');
require('../utils/global');
const { Client, Collection } = require('discord.js');
const {
	loadEvent,
	loadCommand,
	loadSlash,
	loadMonitor,
} = require('../utils/handlers');
const { performance } = require('perf_hooks');

module.exports = class client extends Client {
	/**
	 * Creates an instance of client.
	 * @param { import ("discord.js").ClientOptions } props
	 * @memberof client
	 */
	constructor(props) {
		// Pass in any client configuration you want for the bot.
		// more client options can be found at
		// https://discord.js.org/#/docs/main/master/typedef/ClientOptions
		if (!props) {
			props = {};
		}

		props.intents = 32767; // Intents.ALL
		props.partials = ['USER', 'CHANNEL', 'GUILD_MEMBER', 'MESSAGE', 'REACTION'];
		props.allowedMentions = { parse: ['users'] };
		props.restTimeOffset = 0;
		props.restWsBridgeTimeout = 100;
		super(props);

		require('events').EventEmitter.defaultMaxListeners = 100;
		process.setMaxListeners(100);

		const memer = require('memer-api')

		this.memer = new memer(process.env.MEME)

		this.config = require('../config');

		this.utils = require('../utils');

		this.mongoose = require('./mongoose');

		this.events = new Collection();

		this.commands = new Collection();

		this.slashCommands = new Collection();

		this.ratelimits = new Collection();

		this.messages = { sent: 0, received: 0 };

		this.bootTime = null;

		super.on('messageCreate', (message) => {
			if (message.author.id === this.user.id) {
				return (this.messages.sent += 1);
			}

			return (this.messages.received += 1);
		});
		super.once('ready', () => {
			this.bootTime = Math.round(performance.now());
		});
	}

	init() {
		this.login()
			.then(() => log.success('Discord Token', 'your token is correct!'))
			.then(async () => {
				this.mongoose.init(this);
				loadMonitor(this);
				loadEvent(this);
				loadCommand(this);
				loadSlash(this);
			})
			.catch((err) => log.error('Discord Init', err.stack));
	}
};
