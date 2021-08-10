const fetch = require('node-fetch');
const _ = require('lodash');
const {
	Collection,
	Message,
	MessageActionRow,
	MessageButton,
	MessageSelectMenu,
	TextChannel,
} = require('discord.js');
const styles = ['PRIMARY', 'SECONDARY', 'SUCCESS', 'DANGER'];

module.exports = class Michiaki {
	/**
	 * @param {Object} user required in chat/translate method
	 * @param {String} [user.oauth] to get the auth token, join in the server: https://discord.gg/n6EnQcQNxg
	 * @param {Object} admin to access the admin method
	 * @param {String} [admin.oauth]
	 */
	constructor(user = {}, admin = {}) {
		this.user = user;
		this.dev = admin;
	}

	post(url, body = {}, admin = false) {
		if (this.user?.oauth == null)
			throw new Error("'Michiaki' => this.user.oauth cannot be null.");
		let oauth = this.user?.oauth;
		if (admin) oauth = this.dev?.oauth;
		return fetch(url, {
			method: 'POST',
			body: JSON.stringify(body),
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + oauth,
			},
		})
			.then((res) => res.json())
			.then((data) => {
				return data;
			})
			.catch((err) => {
				throw err;
			});
	}

	get(data = {}) {
		let { type, endpoint, body = {}, isAdmin = false } = data;
		let oauth = this.user?.oauth ?? '';
		const query = new URLSearchParams(body);
		const types = ['canvas', 'json', 'text'];

		if (isAdmin) oauth = this.dev?.oauth;
		if (this.user?.oauth)
			throw new Error("'Michiaki.get' => this.user.oauth cannot be null.");
		if (!(type || endpoint))
			throw new Error("'Michiaki.get' => type|endpoint cannot be null.");
		if (!types.includes(type))
			throw new Error(`'Michiaki.get' => type must be an ${types.join('|')}`);

		return fetch(`${this.root}/${type}/${endpoint}?${query}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + oauth,
			},
		})
			.then((res) => {
				if (res?.status !== 201) return res.json();
				else if (type === 'canvas') return res.buffer();
				else return res.json();
			})
			.then((data) => data)
			.catch((err) => {
				throw err;
			});
	}

	/**
	 * @param {Object} ops
	 * @param {String} [ops.url]
	 * @param {Number} [ops.width]
	 * @param {Number} [ops.height]
	 * @return {Promise<Michiaki.screenshot>}
	 */
	async screenshot(ops = {}) {
		const {
			url = 'https://github.com/hypsterop',
			width = 1920,
			height = 1080,
		} = ops;
		let browser = null;

		const puppeteer = require('puppeteer-extra');
		const StealthPlugin = require('puppeteer-extra-plugin-stealth');
		const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
		puppeteer.use(StealthPlugin());
		puppeteer.use(AdblockerPlugin({ blockTrackers: true }));
		try {
			browser = await puppeteer.launch({
				args: [
					'--no-sandbox',
					'--disable-setuid-sandbox',
					'--disable-infobars',
					'--window-position=0,0',
					'--window-size=1600,900',
				],
				defaultViewport: null,
				ignoreHTTPSErrors: true,
				headless: false,
			});
			const page = await browser.newPage();
			await page.setViewport({ width, height });
			await page.goto(url);
			return { base64: await page.screenshot({ encoding: 'base64' }) };
		} catch (err) {
			console.log(`❌ Error: ${err.message}`);
		} finally {
			await browser.close();
			console.log('\n🎉 screenshots captured.');
		}
	}

	/**
	 * @param {String} content
	 * @param {Object} language
	 * @param {String} [language.from]
	 * @param {String} [language.to]
	 * @return {Promise<Michiaki.translate>}
	 */
	translate(content, language = {}) {
		const translate = {
			content,
			language,
		};
		return this.post(
			'https://miwa-api-new.xdhhteubanjsfum.repl.co/json/translate',
			translate
		);
	}

	/**
	 * @param {Object} message
	 * @param {Object} ops
	 * @param {String} [ops.prefix]
	 * @param {String} [ops.invite]
	 * @param {String} [ops.description]
	 * @param {String} [ops.country]
	 * @param {String} [ops.city]
	 * @param {Object} [ops.id]
	 * @param {String} [ops.id.author]
	 * @param {String} [ops.id.bot]
	 * @param {String} [ops.id.owner]
	 * @return {Promise<Michiaki.chat>}
	 */
	chat(message, ops = {}) {
		if (!(message instanceof Message))
			throw new Error(
				"'Michiaki.chat' => message doesnt instanceOf the Message."
			);
		if (message.channel.type !== 'DM') {
			let id = ops?.id ?? {};
			const cache = {
				user: message.client.users.cache,
				member: message.guild.members.cache,
			};

			const author = {
				...cache.member.get(id.author || message.author.id).toJSON(),
				user: cache.user.get(id.author || message.author.id).toJSON(),
			};
			const bot = {
				...cache.member.get(id.bot || message.client.user.id).toJSON(),
				//user: cache.user.get(id.bot || message.client.user.id).toJSON()
			};
			const owner = {
				...cache.member.get(id.owner || '800331322089537538').toJSON(),
				user: cache.user.get(id.owner || '800331322089537538').toJSON(),
			};

			ops.content = ops?.content ?? message.content;
			const chat = {
				...ops,
				author,
				bot,
				owner,
			};
			return this.get(
				'https://miwa-api-new.xdhhteubanjsfum.repl.co/json/chat',
				chat
			);
		} else {
			return this.get(
				'"https://miwa-api-new.xdhhteubanjsfum.repl.co/json/chat',
				{
					content: message.toString(),
				}
			);
		}
	}
	interaction = {
		/**
		 * @param {Array} buttons
		 * @param {Object} row
		 * @param {Number} [row.limit]
		 */
		button: (buttons = [], row = {}) => {
			if (!Array.isArray(buttons))
				throw new SyntaxError("'Michiaki' => buttons must be an Array typeof.");
			if (!row?.limit || row.limit >= 5) row.limit = 5;
			var Buttons = {};
			Buttons.enabled = [];
			Buttons.disabled = [];
			Buttons.url = [];
			Buttons.check = [];

			for (var i = 0; i < buttons.length; i++) {
				if (
					buttons[i] &&
					!(buttons[i].style.toUpperCase() === 'LINK' || buttons[i].url)
				)
					continue;
				if (typeof buttons[i] !== 'object')
					throw new Error(
						`'Michiaki' => buttons[${i}] must be an Object typeof.`
					);
				if (!(buttons[i]?.label || buttons[i]?.emoji))
					throw new Error(
						`'Michiaki' => buttons[${i}] Please provide label|emoji.`
					);
				//check
				const check = Object.assign(buttons[i], {
					id: 'LINK_' + i,
					isUrl: true,
				});
				Buttons.check.push(check);

				//url
				const url = new MessageButton();
				url.setStyle('LINK');
				url.setURL(buttons[i].url);
				if (buttons[i].label) url.setLabel(buttons[i].label);
				if (buttons[i].emoji) url.setEmoji(buttons[i].emoji);
				Buttons.url.push(url);
			}

			for (var i = 0; i < buttons.length; i++) {
				if (
					buttons[i] &&
					(buttons[i].style.toUpperCase() === 'LINK' || buttons[i].url)
				)
					continue;
				if (typeof buttons[i] !== 'object')
					throw new Error(
						`'Michiaki' => buttons[${i}] must be an Object typeof.`
					);
				if (!(buttons[i]?.label || buttons[i]?.emoji))
					throw new Error(
						`'Michiaki' => buttons[${i}] Please provide label|emoji.`
					);
				if (!buttons[i]?.id)
					throw new Error("'Michiaki' => Please provide ID.");
				//check
				const check = Object.assign(buttons[i], { isUrl: false });
				Buttons.check.push(check);

				//enabled
				const enabled = new MessageButton();
				if (styles.some((style) => style === buttons[i].style.toUpperCase())) {
					enabled.setStyle(buttons[i].style);
				} else {
					enabled.setStyle('SECONDARY');
				}
				if (buttons[i].label) enabled.setLabel(buttons[i].label);
				if (buttons[i].emoji) enabled.setEmoji(buttons[i].emoji);
				enabled.setCustomId(buttons[i].id);
				Buttons.enabled.push(enabled);
			}

			for (let i = 0; i < buttons.length; i++) {
				if (
					buttons[i] &&
					(buttons[i].style.toUpperCase() === 'LINK' || buttons[i].url)
				)
					continue;
				if (typeof buttons[i] !== 'object')
					throw new Error(
						`'Michiaki' => buttons[${i}] must be an Object typeof.`
					);
				if (!(buttons[i]?.label || buttons[i]?.emoji))
					throw new Error(
						`'Michiaki' => buttons[${i}] Please provide label|emoji.`
					);
				if (!buttons[i]?.id)
					throw new Error("'Michiaki' => Please provide ID.");

				//disabled
				const disabled = new MessageButton();
				if (styles.some((style) => style === buttons[i].style.toUpperCase())) {
					disabled.setStyle(buttons[i].style);
				} else {
					disabled.setStyle('SECONDARY');
				}
				if (buttons[i]?.label) disabled.setLabel(buttons[i]?.label);
				if (buttons[i]?.emoji) disabled.setEmoji(buttons[i]?.emoji);
				disabled.setCustomId(`${buttons[i]?.id}_disabled`);
				disabled.setDisabled(true);
				Buttons.disabled.push(disabled);
			}

			let Row = {
				Disabled: [],
				Enabled: [],
				URL: [],
			};
			let Comp = {
				Enabled: _.chunk(Buttons.enabled, Number(row.limit)),
				Disabled: _.chunk(Buttons.disabled, Number(row.limit)),
			};

			for (let i = 0; i < Comp.Enabled.length; i++) {
				const enabled = new MessageActionRow().addComponents(Comp.Enabled[i]);
				Row.Enabled = [...Row.Enabled, enabled];
			}

			for (let i = 0; i < Comp.Disabled.length; i++) {
				const disabled = new MessageActionRow().addComponents(Comp.Disabled[i]);
				Row.Disabled = [...Row.Disabled, disabled];
			}

			if (Buttons.url.length > 0) {
				Comp.URL = _.chunk(Buttons.url, Number(row.limit));
				for (let i = 0; i < Comp.URL.length; i++) {
					const rows = new MessageActionRow().addComponents(Comp.URL[i]);
					Row.Enabled = [...Row.Enabled, rows];
					Row.Disabled = [...Row.Disabled, rows];
					Row.URL = [rows];
				}
			}
			return {
				check: _.sortBy(Buttons.check, { isUrl: true }),
				row: Row,
			};
		},
		/**
		 * @param {Object} menu
		 * @param {String} [menu.id]
		 * @param {String} [menu.placeholder]
		 * @param {Object} [menu.values]
		 * @param {Number} [menu.values.min]
		 * @param {Number} [menu.values.max]
		 * @param {Object[]} [menu.options]
		 * @param {String} [menu.options[].value]
		 * @param {String} [menu.options[].emoji]
		 * @param {String} [menu.options[].label]
		 * @param {String} [menu.options[].description]
		 */
		menu: (menu) => {
			if (!menu.id) throw new Error("'Michiaki' => menu.id Please provide ID.");
			if (!Array.isArray(menu.options))
				throw new SyntaxError(
					"'Michiaki' => menu.options must be an Array typeof."
				);

			let Menu = {
				check: {
					id: menu?.id ?? 'select',
					placeholder: menu?.placeholder ?? 'Select any option.',
					values: {
						min: menu?.values?.min ?? 1,
						max: menu?.values?.max ?? 1,
					},
					options: [],
				},
			};
			for (var i = 0; i < menu.options.length; i++) {
				if (typeof menu?.options[i] !== 'object')
					throw new Error(
						`'Michiaki' => menu.options[${i}] must be an Object typeof.`
					);
				if (!(menu.options[i].label || menu.options[i].emoji))
					throw new Error(
						`'Michiaki' => menu.options[${i}] Please provide label|emoji.`
					);
				if (!(menu.options[i].id || menu.options[i].value))
					throw new Error(
						`'Michiaki' => menu.options[${i}] Please provide value.`
					);

				const id = menu.options[i].id ?? menu.options[i].value;
				const value = id ?? `option_${i}`;
				const label = menu.options[i].label ?? 'Selection';
				const description = menu.options[i].description ?? 'No description';
				let check = {
					value,
					label,
					description,
				};
				if (menu.options[i]?.emoji) check.emoji = menu.options[i]?.emoji;
				Menu.check.options.push(check);
			}
			const component = new MessageSelectMenu();
			component.setCustomId(Menu.check.id + Math.floor(Math.random() * 100));
			component.setPlaceholder(Menu.check.placeholder);
			component.setMinValues(Menu.check.values.min);
			component.setMaxValues(Menu.check.values.max);
			component.addOptions(Menu.check.options);

			const Row = [new MessageActionRow().addComponents(component)];
			return {
				...Menu,
				row: Row,
			};
		},

		embed: {
			/**
			 * @param {Object} ops
			 * @param {TextChannel} [ops.channel]
			 * @param {Array<MessageEmbed>} [ops.embeds]
			 * @param {Array} [ops.buttons]
			 * @param {String} [ops.userID]
			 * @param {Boolean} [ops.disable]
			 * @param {Boolean} [ops.onlyURL]
			 * @param {Number} [ops.timeout]
			 */
			button: (ops) => {
				const {
					channel,
					embeds,
					buttons,
					userID = null,
					disable = true,
					onlyURL = true,
					timeout = 30000,
				} = ops;
				const { check, row } = this.interaction.button(buttons);
				return channel
					.send({ embeds: [embeds[0]], components: row.Enabled })
					.then((message) => {
						const btn = (interaction) => {
							const result = check.findIndex(
								(x) => x.id === interaction.customId
							);
							if (!embeds[result])
								throw new Error(
									`'Michiaki' => ops.buttons[${result}] please provide embed for you option.`
								);
							return interaction.message.edit({ embeds: [embeds[result]] });
						};

						const filter = (interaction) => {
							interaction.deferUpdate();
							if (!userID) return true;
							return interaction.user.id === userID;
						};
						const collector = message.createMessageComponentCollector({
							filter,
							componentType: 'BUTTON',
							time: timeout,
						});
						collector.on('collect', btn);
						collector.on('end', () =>
							message.edit({
								embeds: [embeds[0]],
								components: disable ? (onlyURL ? row.URL : row.Disabled) : null,
							})
						);
					});
			},
			/**
			 * @param {Object} ops
			 * @param {TextChannel} [ops.channel]
			 * @param {Array<MessageEmbed>} [ops.embeds]
			 * @param {Object} [ops.menu]
			 * @param {String} [ops.userID]
			 * @param {Number} [ops.timeout]
			 */
			menu: (ops) => {
				const { channel, embeds, menu, userID = null, timeout = 30000 } = ops;
				const { row } = this.interaction.menu(menu);
				let selected = new Collection();
				return channel
					.send({ embeds: [embeds[0]], components: row })
					.then((message) => {
						const selection = (interaction) => {
							if (row[0].components[0].customId !== interaction.customId)
								return;
							const index = row[0].components[0].options.findIndex(
								(x) => x.value === interaction.values[0]
							);
							if (!embeds[index])
								throw new Error(
									`'Michiaki' => ops.menu.options[${index}] please provide embed for you option.`
								);
							if (selected.has(row[0].components[0].customId))
								row[0].components[0].options[
									selected.get(row[0].components[0].customId)
								].default = false;
							selected.set(row[0].components[0].customId, index);
							row[0].components[0].options[index].default = true;
							return interaction.message.edit({
								embeds: [embeds[index]],
								components: row,
							});
						};

						const filter = (interaction) => {
							interaction.deferUpdate();
							if (!userID) return true;
							return interaction.user.id === userID;
						};
						const collector = message.createMessageComponentCollector({
							filter,
							componentType: 'SELECT_MENU',
							time: timeout,
						});
						collector.on('collect', selection);
						collector.on('end', () => {
							if (selected.has(row[0].components[0].customId))
								row[0].components[0].options[
									selected.get(row[0].components[0].customId)
								].default = false;
							row[0].components[0].options[0].default = true;
							row[0].components[0].disabled = true;
							selected.delete(row[0].components[0].customId);
							return message.edit({ embeds: [embeds[0]], components: row });
						});
					});
			},
		},
	};
	prompt = {
		/**
		 * @param {Object} ops
		 * @param {TextChannel} [ops.channel]
		 * @param {String[]} [ops.content]
		 * @param {String[]} [ops.userID]
		 * @param {String[]} [ops.includesOf]
		 * @param {String[]} [ops.includesAll]
		 * @param {String[]} [ops.startsWith]
		 * @param {String[]} [ops.endsWith]
		 * @param {String} [ops.stringType] number|word
		 * @param {Number} [ops.timeout]
		 */
		reply: (ops = {}) => {
			const reply = (chn, question) => {
				const filter = (m) => {
					const content = m.content.trim().toLowerCase();
					const userID = () => {
						const str = ops?.userID ?? null;
						if (str) {
							if (Array.isArray(str))
								return str.some((x) => x.trim().toLowerCase() === m.author.id);
							else
								return [str].some(
									(x) => x.trim().toLowerCase() === m.author.id
								);
						} else return !m.author.bot;
					};
					const includesOf = () => {
						const str = ops?.includesOf ?? null;
						if (str) {
							if (Array.isArray(str))
								return str.some((x) =>
									content.includes(x.trim().toLowerCase())
								);
							else
								return [str].some((x) =>
									content.includes(x.trim().toLowerCase())
								);
						} else return true;
					};
					const includesAll = () => {
						const str = ops?.includesAll ?? null;
						if (str) {
							if (Array.isArray(str))
								return str.every((x) =>
									content.includes(x.trim().toLowerCase())
								);
							else
								return [str].every((x) =>
									content.includes(x.trim().toLowerCase())
								);
						} else return true;
					};
					const startsWith = () => {
						const str = ops?.startsWith ?? null;
						if (str) {
							if (Array.isArray(str))
								return str.some((x) =>
									content.startsWith(x.trim().toLowerCase())
								);
							else
								return [str].some((x) =>
									content.startsWith(x.trim().toLowerCase())
								);
						} else return true;
					};
					const endsWith = () => {
						const str = ops?.endsWith ?? null;
						if (str) {
							if (Array.isArray(str))
								return str.some((x) =>
									content.endsWith(x.trim().toLowerCase())
								);
							else
								return [str].some((x) =>
									content.endsWith(x.trim().toLowerCase())
								);
						} else return true;
					};
					const stringType = () => {
						const str = ops?.stringType ?? null;
						if (str) {
							if (!['number', 'word'].some((x) => x.includes(String(str))))
								throw new Error(
									"'Michiaki.prompt.reply' => stringType must be number|word"
								);
							else {
								if (String(str) === 'number') return /^(\d+)$/gi.test(content);
								else if (String(str) === 'word')
									return /^((?=.+[a-zA-Z])[a-zA-Z]+)$/gi.test(content);
								else return true;
							}
						} else return true;
					};
					return (
						userID() &&
						includesOf() &&
						includesAll() &&
						startsWith() &&
						endsWith() &&
						stringType()
					);
				};
				return chn.send({ content: question }).then((msg) =>
					msg.channel.awaitMessages({
						filter,
						max: 1,
						time: ops?.timeout ?? 60000,
					})
				);
			};

			const channel = ops?.channel ?? null;
			let content = ops?.content ?? [];
			if (!Array.isArray(content)) content = [content];
			if (!(channel instanceof TextChannel))
				throw new Error(
					"'Michiaki.prompt.reply' => channel doesnt instanceOf the TextChannel."
				);
			if (!content?.length)
				throw new Error("'Michiaki.prompt.reply' => content cannot be null.");
			return new Promise(async (resolve, reject) => {
				const collected = [];
				for (let i = 0; i < content.length; i += 1) {
					const collect = await reply(channel, content[i]);
					if (collect?.first()?.content) {
						await wait(1000);
						collected.push(collect?.first().content);
						continue;
					} else {
						collected.push('');
						break;
					}
				}
				resolve(collected);
			});
		},
	};
	admin = {
		list: {
			/**
			 * @return {Promise<Michiaki.admin.list.user>}
			 */
			user: () => {
				return this.get('https://api.miwa.gq/admin/user', true);
			},
			/**
			 * @return {Promise<Michiaki.admin.list.banned>}
			 */
			banned: () => {
				return this.get('https://api.miwa.gq/admin/banned', true);
			},
		},
		/**
		 * @param {String} id
		 * @return {Promise<Michiaki.admin.delete>}
		 */
		delete: (id) => {
			if (!id) throw new Error("'Michiaki' => id cannot be null.");
			if (this.dev?.oauth == null)
				throw new Error("'Michiaki' => this.dev.oauth cannot be null.");
			return this.post(
				'https://api.miwa.gq/admin/delete',
				{
					id,
				},
				true
			);
		},
		/**
		 * @param {String} id
		 * @return {Promise<Michiaki.admin.ban>}
		 */
		ban: (id) => {
			if (!id) throw new Error("'Michiaki' => id cannot be null.");
			if (this.dev?.oauth == null)
				throw new Error("'Michiaki' => this.dev.oauth cannot be null.");
			return this.post(
				'https://api.miwa.gq/admin/ban',
				{
					id,
				},
				true
			);
		},
		/**
		 * @param {String} id
		 * @return {Promise<Michiaki.admin.unban>}
		 */
		unban: (id) => {
			if (!id) throw new Error("'Michiaki' => id cannot be null.");
			if (this.dev?.oauth == null)
				throw new Error("'Michiaki' => this.dev.oauth cannot be null.");
			return this.post(
				'https://api.miwa.gq/admin/unban',
				{
					id,
				},
				true
			);
		},
		/**
		 * @return {Promise<Michiaki.admin.token>}
		 */
		token: (id) => {
			if (!id) throw new Error("'Michiaki' => id cannot be null.");
			if (this.dev?.oauth == null)
				throw new Error("'Michiaki' => this.dev.oauth cannot be null.");
			const generate = { id: id };
			return this.post('https://api.miwa.gq/admin/gen', generate, true);
		},
	};

	search = {
		/**
		 * @param {Message} message
		 * @param {String} query
		 * @param {Object} ops
		 * @param {Boolean} [ops.current]
		 * @return {Promise<Michiaki.search.user>}
		 */
		user: async (message, query) => {
			if (!message)
				throw new ReferenceError(
					"'Michiaki.search.user' => 'message' must be passed down as param!"
				);
			if (!query || query.length === 0)
				throw new ReferenceError(
					"'Michiaki.search.user' => 'query' must be passed down as param!"
				);
			if (query && typeof query !== 'string')
				throw new SyntaxError(
					"'Michiaki.search.user' => 'query' must be passed down as string!"
				);

			let final;
			let cache = message.client.users.cache;

			// Discord Mention\
			if (query.match(/^(?:<@!?)?(\d{16,22})>/gi)) {
				let regex = new RegExp(/^(?:<@!?)?(\d{17,19})>/gi),
					result = await cache.get(regex.exec(query)[1]);
				final = result;
			}
			// Discord ID
			else if (query.match(/\d{16,22}$/gi)) {
				let result = await cache.get(query);
				final = result;
			}
			// Username
			else if (query.match(/^.{1,32}$/gi)) {
				let mappingUsername = await cache
					.map((x) => x.username)
					.filter((x) => x !== null);
				let combineMapping = mappingUsername;
				let similarFound = findMatch(query, combineMapping);
				let finale = await cache.find((x) => x.username === similarFound);
				final = finale;
			}
			// Unknown
			else if (!final) {
				console.log("I could'nt find the user.");
				return undefined;
			}
			// Final
			return final;
		},

		/**
		 * @param {Message} message
		 * @param {String} query
		 * @param {Object} ops
		 * @param {Boolean} [ops.current]
		 * @return {Promise<Michiaki.search.member>}
		 */
		member: async (message, query, ops = {}) => {
			if (!message)
				throw new ReferenceError(
					"'Michiaki.search.member' => 'message' must be passed down as param!"
				);
			if (ops.current && typeof ops?.current !== 'boolean')
				throw new SyntaxError(
					"'Michiaki.search.member' => 'current' must be passed down as boolean!"
				);
			if (!query && ops?.current) query = message.author.id;
			if (!query || query.length === 0) return undefined;

			let final;
			let cache = message.guild.members.cache;

			// Discord Mention\
			if (query.match(/^(?:<@!?)?(\d{16,22})>/gi)) {
				let regex = new RegExp(/^(?:<@!?)?(\d{17,19})>/gi),
					result = await cache.get(regex.exec(query)[1]);
				final = result;
			}
			// Discord If there is "^" on a message
			/**else if(query.match(/\^/g)){
				const checkLength = (text, search) => {
					let count = 0;
					text.split("").map((l) => ((l) === search ? count++ : ""));
					return count === 0 ? undefined : count;
				};
				let result = await message.channel.messages.cache.array.sort((a, b) => b.createdTimestamp - a.createdTimestamp)[checkLength(query, "^")]
				final = result;
			}*/
			// Discord ID
			else if (query.match(/\d{16,22}$/gi)) {
				let result = await cache.get(query);
				final = result;
			}
			//Discord Join Position
			else if (query.match(/\d{1,7}$/gi)) {
				const position = await cache
					.sort((a, b) => a.joinedTimestamp - b.joinedTimestamp)
					.array();
				let result = await position[parseInt(query)];
				final = result;
			}
			// Discord Tag
			else if (query.match(/^.{1,32}(#)+\d{4}$/gim)) {
				let finale = await cache.find((x) => x.user.tag === query);
				final = finale;
			}
			// Username/Nickname
			else if (query.match(/^.{1,32}$/gi)) {
				let mappingNickname = await cache
					.map((x) => x.nickname)
					.filter((x) => x !== null);
				let mappingUsername = await cache
					.map((x) => x.user.username)
					.filter((x) => x !== null);
				let combineMapping =
					mappingNickname.length >= 1
						? mappingUsername.concat(mappingNickname)
						: mappingUsername;
				let similarFound = findMatch(query, combineMapping);
				let finale = await cache.find(
					(x) => x.user.username === similarFound || x.nickname === similarFound
				);
				final = finale;
			}
			// Unknown
			else if (!final) {
				console.log("I could'nt find the user.");
				return undefined;
			}
			// Final
			return final;
		},

		/**
		 * @param {Message} message
		 * @param {String} query
		 * @param {Object} ops
		 * @param {Boolean} [ops.current]
		 * @return {Promise<Michiaki.search.channel>}
		 */
		channel: async (message, query, ops = {}) => {
			if (!message)
				throw new ReferenceError(
					"'Michiaki.search.channel' => 'message' must be passed down as param!"
				);
			if (ops.current && typeof ops?.current !== 'boolean')
				throw new SyntaxError(
					"'Michiaki.search.channel' => 'current' must be passed down as boolean!"
				);
			if (!query && ops?.current) query = message.channel.id;
			if (!query || query.length === 0) return undefined;

			let final;
			let cache = message.guild.channels.cache;

			// Discord Mention
			if (query.match(/^(?:<#?)?(\d{16,22})>$/gi)) {
				let regex = new RegExp(/^(?:<#?)?(\d{17,19})>$/gi),
					result = await cache.get(regex.exec(query)[1]);
				final = result;
			}
			// Discord ID
			else if (query.match(/\d{16,22}$/gi)) {
				let result = await cache.get(query);
				final = result;
			}
			// Query only
			else if (query.match(/^.{1,100}$/gi)) {
				let mappingChannel = await cache
					.map((x) => x.name)
					.filter((x) => x !== null);
				let similarFound = findMatch(query, mappingChannel);
				let finale = await cache.find((x) => x.name === similarFound);
				final = finale;
			}
			// Unknown
			else if (!final) {
				console.log("I could'nt find the channel.");
				return undefined;
			}
			// Final
			return final;
		},

		/**
		 * @param {Message} message
		 * @param {String} query
		 * @return {Promise<Michiaki.search.role>}
		 */
		role: async (message, query) => {
			if (!message)
				throw new ReferenceError(
					"'Michiaki.search.role' => 'message' must be passed down as param!"
				);
			if (!query || query.length === 0) return undefined;

			let final;
			let cache = message.guild.roles.cache;

			// Discord Mention
			if (query.match(/^(?:<@&?)?(\d{16,22})>$/gi)) {
				let regex = new RegExp(/^(?:<@&?)?(\d{17,19})>$/gi),
					result = await cache.get(regex.exec(query)[1]);
				final = result;
			}
			// Discord ID
			else if (query.match(/\d{16,22}$/gi)) {
				let result = await cache.get(query);
				final = result;
			}
			// Query only
			else if (query.match(/^.{1,50}$/gi)) {
				let mappingRoles = await cache
					.map((x) => x.name)
					.filter((x) => x !== `@everyone`)
					.filter((x) => x !== null);
				let similarFound = findMatch(query, mappingRoles);
				let finale = await cache.find((x) => x.name === similarFound);
				final = finale;
			}
			// Unknown
			else if (!final) {
				console.log("I could'nt find the role.");
				return undefined;
			}
			// Final
			return final;
		},

		/**
		 * @param {Message} message
		 * @param {String} query
		 * @return {Promise<Michiaki.search.emoji>}
		 */
		emoji: async (message, query) => {
			if (!message)
				throw new ReferenceError(
					"'Michiaki.search.emoji' => 'message' must be passed down as param!"
				);
			if (!query || query.length === 0) return undefined;

			let final;
			let cache = message.guild.emojis.cache;

			// Discord Mention
			if (query.match(/^(?:<:(?![\n])[()#$@-\w]+:?)?(\d{16,22})>$/gi)) {
				let regex = new RegExp(/^(?:<:(?![\n])[()#$@-\w]+:?)?(\d{16,22})>$/gi),
					result = await cache.get(regex.exec(query)[1]);
				final = result;
			}
			// Discord ID
			else if (query.match(/\d{16,22}$/gi)) {
				let result = await cache.get(query);
				final = result;
			}
			// Query only
			else if (query.match(/^.{1,50}$/gi)) {
				let mappingEmojis = await cache
					.map((x) => x.name)
					.filter((x) => x !== null);
				let similarFound = findMatch(query, mappingEmojis);
				let finale = await cache.find((x) => x.name === similarFound);
				final = finale;
			}
			// Unknown
			else if (!final) {
				console.log("I could'nt find the emoji.");
				return undefined;
			}
			// Final
			return final;
		},
	};
};

const valid = (main, target) => {
	if (typeof main !== 'string') return false;
	if (!Array.isArray(target)) return false;
	if (!target.length) return false;
	if (target.find((x) => typeof x !== 'string')) return false;
	return true;
};

function findMatch(first, second) {
	if (!valid(first, second))
		throw new Error(
			"'Michiaki.findMatch' => first must be string and second must be array."
		);
	let target = second.filter((target) =>
		target.toLowerCase().includes(first.toLowerCase())
	);
	if (target.length >= 2) {
		const leven = require('leven');
		const ratings = [];
		for (const x of target) {
			ratings.push({
				target: x,
				rate: leven(first, x),
			});
		}
		const best = ratings.sort((a, b) => a.rate - b.rate);
		return target.find((x) => x === best[0].target);
	} else return target[0];
}
