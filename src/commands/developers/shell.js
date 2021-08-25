/* eslint-disable class-methods-use-this */
const Command = require("../../structures/command");
const { Formatters, Message, MessageAttachment } = require("discord.js");

module.exports = class ShellCommand extends Command {
  constructor(...args) {
    super(...args, {
      ownerOnly: true,
    });
  }

  /**
   * @param {Message} message
   * @param {String[]} args
   */
  async do(message, args) {
    const exec = require("util").promisify(require("child_process").exec);
    const { error, stdout, stderr } = await exec(args.join(" "));

    if (error) {
      return message.channel.send({
        content: Formatters.codeBlock("bash", error),
      });
    }

    if (stdout.length <= 2000) {
      return message.channel.send({
        content: Formatters.codeBlock("bash", stdout),
      });
    }

    return message.channel.send({
      files: [new MessageAttachment(Buffer.from(stdout), "output.sh")],
    });
  }
};
