const Command = require('../structures/command');
const Event = require('../structures/event');
const PrettyError = require('pretty-error');
const pe = new PrettyError();
pe.withoutColors();

const SlashCommand = require('../structures/slash-command');
const { resolve, parse } = require('path');
const { sync } = require('glob');

module.exports.loadEvent = (client) => {
	const eventFiles = sync(resolve('./src/events/**/*.js'));
	if (!eventFiles.length) {
		return log.warn('Discord Event', 'There is no events found.');
	}

	eventFiles.forEach((filepath) => {
		delete require.cache[require.resolve(filepath)];
		const File = require(filepath);
		const { name, dir: directory } = parse(filepath);
		if (
			!(
				typeof File &&
				'function' &&
				typeof File.prototype === 'object' &&
				File.toString().substring(0, 5) === 'class'
			)
		) {
			return log.error(
				'Discord Event',
				`Event ${name} doesn"t export a class.`
			);
		}

		if (!(File.prototype instanceof Event)) {
			return log.error('Discord Event', `${name} doesn"t instanceOf the Event`);
		}

		const event = new File({ client, name, directory });
		if (!event.enable) {
			return;
		}

		if (!event.name) {
			throw new Error(`${filepath} > Missing "event.name"`);
		}

		log.success('Discord Event', `${event.name} was registered`);
		client.events.set(event.name, event);
		event.emitter[event.type](event.name, (...args) => event.do(...args));
	});
};

module.exports.loadCommand = (client) => {
	const commandFiles = sync(resolve('./src/commands/**/*.js'));
	if (!commandFiles.length) {
		return log.warn('Discord Command', 'There is no commands found.');
	}

	commandFiles.forEach((filepath) => {
		delete require.cache[require.resolve(filepath)];
		const File = require(filepath);
		const { name, dir: directory } = parse(filepath);
		if (
			!(
				typeof File &&
				'function' &&
				typeof File.prototype === 'object' &&
				File.toString().substring(0, 5) === 'class'
			)
		) {
			return log.error(
				'Discord Command',
				`Command ${name} doesn"t export a class.`
			);
		}

		if (!(File.prototype instanceof Command)) {
			return log.error(
				'Discord Command',
				`${name} doesn"t instanceOf the Command`
			);
		}

		const command = new File({ client, name: name.toLowerCase(), directory });
		log.success('Discord Command', `${command.name} was registered`);
		client.commands.set(command.name, command);
	});
};

module.exports.loadSlash = (client) => {
	const slashFiles = sync(resolve('./src/slash/**/*.js'));
	if (!slashFiles.length) {
		return log.warn(
			'Discord Slash Command',
			'There is no slash commands found.'
		);
	}

	slashFiles.forEach((filepath) => {
		delete require.cache[require.resolve(filepath)];
		const File = require(filepath);
		const { name, dir: directory } = parse(filepath);
		if (
			!(
				typeof File &&
				'function' &&
				typeof File.prototype === 'object' &&
				File.toString().substring(0, 5) === 'class'
			)
		) {
			return log.error(
				'Discord Command',
				`Command ${name} doesn"t export a class.`
			);
		}

		if (!(File.prototype instanceof SlashCommand)) {
			return log.error(
				'Discord Slash Command',
				`${name} doesn't instanceOf the Slash Command`
			);
		}

		const slash = new File({ client, name, directory });
		log.success('Discord Slash Command', `${slash.name} was registered`);
		client.slashCommands.set(slash.name, slash);
	});

	const registered = () => {
		client.guilds.cache.forEach((guild) => {
			guild.commands
				.fetch()
				.then((x) => {
					if (x.size) {
						log.success('Discord Slash Command', `registered in ${guild.name}`);
					}
				})
				.catch(() => {});
		});
	};

	client.on('ready', () => registered());
};

module.exports.loadMonitor = (client) => {
	process.on('uncaughtException', (error) => {
		log.error('uncaughtException', pe.render(error));

		send(client, { content: error.toString() });
	});
	process.on('unhandledRejection', (listener) => {
		log.warn('unhandledRejection', pe.render(listener));
		// Send(client, { content: listener });
	});
	process.on('rejectionHandled', (listener) => {
		log.warn('rejectionHandled', listener);
		// Send(client, { content: listener.toString() });
	});
	/** Process.on("SIGTERM", (listener) => {
		log.warn("SIGTERM", listener);
		hook.logs.send(client, { content: listener.toString() });
	}); */
	process.on('warning', (warning) => {
		log.warn('Warning', warning);
		send(client, { content: warning.toString() });
	});
};
