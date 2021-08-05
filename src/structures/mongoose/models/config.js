const mongoose = require('mongoose');

const channels = new mongoose.Schema(
	{
		name: { type: String, default: null },
		id: { type: String, default: null },
		enable: { type: Boolean, default: false },
		date: { type: Date, default: Date.now },
	},
	{ _id: false }
);

const antis = new mongoose.Schema(
	{
		name: { type: String, default: null },
		enable: { type: Boolean, default: false },
		date: { type: Date, default: Date.now },
	},
	{ _id: false }
);

const messages = new mongoose.Schema(
	{
		name: { type: String, default: null },
		content: { type: String, default: null },
		date: { type: Date, default: Date.now },
	},
	{ _id: false }
);

module.exports.config = mongoose.model(
	'config',
	new mongoose.Schema({
		guild: String,
		prefix: { type: String, default: 'm!' },
		language: { type: String, default: 'english' },
		channel: [channels],
		anti: [antis],
		message: [messages],
	})
);
