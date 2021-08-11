const Command = require("../../structures/command");
const cpuStat = require("cpu-stat");
const m = require("moment-duration-format");
const moment = require("moment");
const mongoose = require("mongoose");
const ms = require("ms");
const os = require("os");
const version1 = require("discord.js").version;
const { mem, cpu } = require("node-os-utils");
const { Message } = require("discord.js");
const { version } = require("../../../package.json");

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

        message.channel.send({
          content: `ℹ️About **${userclient}** | v${version}\`\`\`fix
Developer: HypsterOP#5687
Library: discord.js, version: ${version1}
Servers: ${guilds}
Users: ${users}
Latest Reboot: ${uptime} ago
RAM: ${totalMemMb}MB
Commands Loaded: ${commands}
Database Entries: ${totalEntries}
\`\`\`
      `
        });
      });
    } catch (err) {
      return message.channel.send({ content: err });
    }
  }
};
