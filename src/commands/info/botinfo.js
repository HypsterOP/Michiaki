const Command = require("../../structures/command");
const cpuStat = require("cpu-stat");
const m = require("moment-duration-format");
const moment = require("moment");
const mongoose = require("mongoose");
const ms = require("ms");
const os = require("os");
const version1 = require("discord.js").version;
var osu = require("node-os-utils");
const { cpu, mem } = osu;
const { Message, MessageEmbed, Formatters } = require("discord.js");
const { version } = require("../../../package.json");
const { cpuUsage } = require("process");
const Meme = require("memer-api");

module.exports = class BotInfoCommand extends Command {
  constructor(...args) {
    super(...args, {});
  }

  /**
   * @param {Message} message
   * @param {String[]} args
   */
  async do(message, args) {
    try {
      const { models } = require("mongoose");
      const Values = Object.values(models);

      const totalEntries = await Values.reduce(async (accumulator, model) => {
        const counts = await model.countDocuments();
        return (await accumulator) + counts;
      }, Promise.resolve(0));
      const userclient = this.client.user.username;
      const uptime = moment
        .duration(this.client.uptime)
        .format("D [days] H [hrs] m [mins] s [seconds]");

      const guilds = this.client.guilds.cache.size.toLocaleString();
      const users = this.client.users.cache.size.toLocaleString();
      const channels = this.client.channels.cache.size.toLocaleString();
      const commands = this.client.commands.size;
      cpuStat.usagePercent(async (error, percent, seconds) => {
        if (error) {
          return console.error(error);
        }
        const cores = os.cpus().length;
        const cpuModel = os.cpus()[0].model;
        const node = process.version;
        const CPU = percent.toFixed(2);
        const { totalMemMb, usedMemMb } = await mem.info();

        const embed = new MessageEmbed()
          .setAuthor(
            `${this.client.user.username}'s Stats`,
            this.client.user.displayAvatarURL({ dynamic: true })
          )
          .addField(
            `*General Information*`,
            `\`\`\`Ping: ${this.client.ws.ping}ms
Uptime: ${uptime}
Version: ${version}
Library: Discord.js ${version1}
Language: NodeJS
Servers: ${this.client.guilds.cache.size}
Users: ${users}
Channels: ${channels}
Commands: ${this.client.commands.size}
\`\`\``,
            true
          )

          .addField(
            `*Team*`,
            `\`\`\`Developers:\n: !    HypsterOP ᴹᴳ#5687\n: Nekoyasui#1100
\`\`\``,
            true
          )

          .addField(
            `*Bot Stats*`,
            `\`\`\`Operating System: ${process.platform}
CPU: ${cpuModel}
Cores: ${cores}
RAM: ${totalMemMb}MB
\`\`\``,
            true
          )

          .setColor("AQUA");

        message.channel.send({ embeds: [embed] });
      });
    } catch (err) {
      return message.channel.send({ content: err });
    }
  }
};
