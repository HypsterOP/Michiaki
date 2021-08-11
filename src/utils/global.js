const Michiaki = require("./Michiaki");
require("./prototype");
const chalk = require("chalk");
const moment = require("moment");
require("moment-timezone");
const time = moment().tz("Asia/Manila").format("MMMM Do YYYY, h:mm:ss A");
global.Embed = require("../structures/embed");
global.michiaki = new Michiaki(
  { oauth: process.env.MICHIAKI_USER_OAUTH },
  { oauth: process.env.MICHIAKI_ADMIN_OAUTH }
);
global.wait = require("util").promisify(setTimeout);
global.messageLink = (guildId, channelId, messageId) =>
  `https://discord.com/channels/${guildId}/${channelId}/${messageId}`;
global.ellipsis = (text, total) => {
  if (text.length <= total) {
    return text;
  }

  const keep = total - 3;
  if (keep < 1) {
    return text.slice(0, total);
  }

  return `${text.slice(0, keep)}...`;
};

global.send = (
  client,
  {
    guildID = "814117890701787157",
    channelID = "",
    content = "",
    embeds = [],
    db = "log"
  }
) => {
  const guild = client.guilds.cache.get(guildID);
  if (!guild) {
    return;
  }

  const channel = guild.channels.cache.get(
    channelID ??
			client.mongoose.database.get(`settings_${guild.id}`)?.channel[db]
  );
  if (!channel) {
    return;
  }

  return channel.send({ content, embeds }).catch(() => {});
};

global.log = {
  success: (title, content) =>
    console.log(chalk.green(`[${time}] | [SUCCESS][${title}]: ${content}`)),
  warn: (title, content) =>
    console.warn(chalk.yellow(`[${time}] | [WARNING][${title}]: ${content}`)),
  error: (title, content) =>
    console.error(chalk.red(`[${time}] | [ERROR][${title}]: ${content}`)),
  debug: (title, content) =>
    console.log(chalk.black(`[${time}] | [DEBUG][${title}]: ${content}`)),
  info: (title, content) =>
    console.log(`[${time}] | [INFO][${title}]: ${content}`)
};
