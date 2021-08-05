const Event = require('../../../structures/event');
const { connection } = require('mongoose');

module.exports = class MongoDBDisconnectedEvent extends Event {
	constructor(...args) {
		super(...args, {
			emitter: connection,
		});
	}

	async do() {
		log.warn('Mongoose Database', 'disconnected from the database');
	}
};
