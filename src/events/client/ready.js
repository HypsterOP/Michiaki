const Event = require('../../structures/event');

module.exports = class ReadyEvent extends Event {
	constructor(...args) {
		super(...args);

		this.status = 0; // Here is the status array, so that u can changed the first status will gonna show up.
	}

	do() {
		const { status } = this.client.config.bot;
		this.client.shard
			? this.shardStatus({ status })
			: this.noshardStatus({ status });
		let i = 0;
		setInterval(() => {
			if (i > status.length - 1) {
				i = 0;
			}

			this.status = i;
			this.client.shard
				? this.shardStatus({ status })
				: this.noshardStatus({ status });
			i++;
		}, 15 * 1000);
	}

	noshardStatus({ status = null }) {
		if (!status) {
			return;
		}

		this.client.user.setPresence({
			activities: [
				{
					name: status[this.status].name
						.replace(/\{client\}/gi, this.client.user.username)
						.replace(/\{guilds\}/gi, this.client.guilds.cache.size)
						.replace(
							/\{users\}/gi,
							this.client.guilds.cache.reduce(
								(acc, value) => acc + value.memberCount,
								0
							)
						)
						.replace(/\{channels\}/gi, this.client.channels.cache.size),
					type: status[this.status].type,
				},
			],
			status: 'idle',
		});
	}

	shardStatus({ status = null }) {
		if (!status) {
			return;
		}

		try {
			const promises = [
				this.client.shard.fetchClientValues('guilds.cache.size'),
				this.client.shard.broadcastEval((c) =>
					c.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)
				),
			];
			return Promise.all(promises)
				.then(([guilds, members]) => {
					const totalGuilds = guilds.reduce(
						(acc, guildCount) => acc + guildCount,
						0
					);
					const totalMembers = members.reduce(
						(acc, memberCount) => acc + memberCount,
						0
					);
					console.log(totalMembers);
					for (const shard of this.client.shard.ids) {
						this.client.user.setPresence({
							activities: [
								{
									name: `#${shard} Shard | ${status[this.status].name
										.replace(/\{client\}/gi, this.client.user.username)
										.replace(/\{guilds\}/gi, totalGuilds)
										.replace(/\{users\}/gi, Math.ceil(totalMembers / 1000))
										.replace(
											/\{channels\}/gi,
											this.client.channels.cache.size
										)}`,
									type: status[this.status].type,
									shardID: shard,
								},
							],
							status: 'idle',
						});
					}
				})
				.catch(console.error);
		} catch (e) {
			this.noshardStatus({ status });
		}
	}
};