const Event = require('../../../structures/event');
const { connection } = require('mongoose');

module.exports = class MongoDBDisconnectedEvent extends Event {
	constructor(...args) {
		super(...args, {
			emitter: connection,
		});
	}

	async do(error) {
		log.error('Mongoose Database', error);
	}
};
