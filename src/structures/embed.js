const { MessageEmbed, User } = require('discord.js');

const colorString = require('color-string');
const normalize = (data) => {
	if (typeof data === 'string') {
		return data;
	}

	if (Array.isArray(data)) {
		return data.join('\n');
	}

	return String(data);
};

const ellipsis = (text, total) => {
	if (text.length <= total) {
		return text;
	}

	const keep = total - 3;
	if (keep < 1) {
		return text.slice(0, total);
	}

	return `${text.slice(0, keep)}...`;
};

const limit = {
	TITLE: 256,
	DESCRIPTION: 4096,
	FOOTER: 2048,
	AUTHOR_NAME: 256,
	FIELD: 25,
	FIELD_NAME: 256,
	FILE_VALUE: 1024,
};
/**
 * @extends {MessageEmbed}
 */
module.exports = class Embed extends MessageEmbed {
	/**
	 * @param {User} [user]
	 * @param {object} [data]
	 */
	constructor(user, data = {}) {
		super(data);
		// This.setTimestamp();
		this.setColor('#46494d');
		if (user) {
			this.setFooter(
				ellipsis(user.tag, limit.AUTHOR_NAME),
				user.displayAvatarURL({ format: 'png' })
			);
			// This.setAuthor(user.username, user.displayAvatarURL({ format: "png" }));
		}
	}

	setColorrr(color) {
		const rgb = colorString.get.rgb(color);
		if (!rgb) {
			color = '#46494d';
		} else {
			color = colorString.to.hex(rgb);
		}

		this.color = color;
		return this;
	}

	setDescription(description) {
		this.description = ellipsis(normalize(description), limit.DESCRIPTION);
		return this;
	}

	setFooter(text, iconURL) {
		this.footer = {
			text: ellipsis(normalize(text), limit.FOOTER),
			iconURL,
		};
		return this;
	}

	setTitle(title) {
		this.title = ellipsis(normalize(title), limit.TITLE);
		return this;
	}

	setAuthor(name, iconURL, url) {
		this.author = {
			name: ellipsis(normalize(name), limit.AUTHOR_NAME),
			iconURL,
			url,
		};
		return this;
	}

	addBanner(url = 'https://i.imgur.com/JO2QgJR.png') {
		return (this.image = { url });
	}

	addField(name, value, inline = false) {
		return this.addFields({
			name: ellipsis(normalize(name), limit.FIELD_NAME),
			value: ellipsis(normalize(value), limit.FILE_VALUE),
			inline,
		});
	}

	addBlankField({ name = '\u200b', value = '\u200b', inline = false } = {}) {
		return this.addFields({
			name: ellipsis(normalize(name), limit.FIELD_NAME),
			value: ellipsis(normalize(value), limit.FILE_VALUE),
			inline,
		});
	}

	/**
	 * @static
	 * @param {*} name
	 * @param {*} value
	 * @param {boolean} [inline=false]
	 * @return {*}
	 */
	static normalizeField(name, value, inline = false) {
		return {
			name: normalize(name),
			value: normalize(value),
			inline,
		};
	}
};
