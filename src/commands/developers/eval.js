const Command = require("../../structures/command");
const { Formatters, Message, MessageAttachment } = require("discord.js");

const PrettyError = require("pretty-error");
const pe = new PrettyError();
pe.withoutColors();

const { inspect, promisify } = require("util");
const { writeFile, readFile } = require("fs");

// eslint-disable-next-line no-unused-vars
const write = promisify(writeFile);
// eslint-disable-next-line no-unused-vars
const read = promisify(readFile);

module.exports = class EvalCommand extends Command {
  constructor(...args) {
    super(...args, {
      ownerOnly: true,
      usage: "<content>",
    });
  }

  /**
   * @param {Message} message
   * @param {String[]} args
   */
  async do(message, args) {
    if (!args.length) {
      return message.channel.send({ content: "I need some code to evaluate." });
    }

    const content = args.join(" ").replace(/(^`{3}(\w+)?|`{3}$)/g, "");
    const { client } = this;
    const result = new Promise((resolve, reject) => resolve(eval(content)));

    return result
      .then((output) => {
        if (typeof output !== "string") {
          output = inspect(output, { depth: 3 });
        }

        log.info("Command Evaluated", output);

        output = String(output);
        output = this.clean(output);

        if (output.length <= 2000) {
          return message.channel.send({
            content: Formatters.codeBlock("js", output),
          });
        }

        return message.channel.send({
          files: [new MessageAttachment(Buffer.from(output), "output.js")],
        });
      })
      .catch((err) => {
        err = pe.render(err) || err;
        err = this.clean(err);
        message.channel.send({ content: Formatters.codeBlock("xl", err) });
      });
  }

  check(script, value) {
    if (Array.isArray(value)) {
      return value.some((str) => String(script).toLowerCase().includes(str));
    }

    if (typeof value === "string") {
      return String(script).toLowerCase().includes(value);
    }

    throw "You can't check an object type.";
  }

  read(filepath) {
    return require("fs").readFileSync(filepath, "utf8");
  }

  clean(text) {
    if (typeof text === "string") {
      const regex = new RegExp("/home/indiangaming3000/Michiaki/", "g");
      text = text
        .replace(/`/g, `\`${String.fromCharCode(8203)}`)
        .replace(/@/g, `@${String.fromCharCode(8203)}`)
        // .replace(/([a-z]+):([0-9]+):([0-9]+)/g, "$1#L$2-L$3")
        .replace(regex, "")
        .replace(
          new RegExp(this.client.token, "g"),
          this.client.token
            .split(".")
            .map((val, i) =>
              i > 1 ? (val = this.client.utils.generate(27)) : val
            )
            .join(".")
        );
    }

    return text;
  }
};
