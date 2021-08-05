const Client = require('./client');

module.exports = class Event {
	/**
	 * Creates an instance of Event.
	 * @param {Object} data
	 * @param {Client} [data.client]
	 * @param {String} [data.name]
	 * @param {String} [data.directory]
	 * @param {Object} event
	 * @param {Boolean} [event.once]
	 * @param {String} [event.emitter]
	 * @param {Boolean} [event.enable]
	 * @memberof Event
	 */
	constructor(data, event = {}) {
		const { client, name, directory } = data;

		this.directory = directory;
		this.client = client;
		this.name = name;
		this.mongoose = client?.mongoose;
		this.category = { name: directory.split('/').pop() };
		this.type = event?.once ? 'once' : 'on';
		this.emitter =
			(typeof event?.emitter === 'string'
				? this.client[event.emitter]
				: event.emitter) || this.client;
		this.enable = Boolean(event?.enable ?? true);
	}

	/**
	 * @param {*} args
	 * @memberof Event
	 */
	do(...args) {
		throw new Error(`Event ${this.name} doesn't have a default run method.`);
	}
};
