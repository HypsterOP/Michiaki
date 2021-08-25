const Command = require("../../structures/command");
const { Message } = require("discord.js");

const https = require("https");

module.exports = class ContributersCommand extends Command {
  constructor(...args) {
    super(...args, {
      id: "Contributers",
      description: "See the list of people contributing on github!",
    });
  }

  /**
   * @param {Message} message
   * @param {String[]} args
   */
  async do(message, args) {
    try {
      const list = new Promise((resolve, reject) => {
        https
          .get(
            {
              hostname: "api.github.com",
              path: "/repos/HypsterOP/Michiaki/contributors",
              headers: {
                "User-Agent": "HypsterOP",
                Accept: "application/vnd.github.v3+json",
                "Cache-Control": "no-store",
              },
            },
            (response) => {
              response.setEncoding("utf8");
              let body = "";

              response.on("data", (data) => (body += data));

              response.on("end", () => {
                try {
                  resolve(JSON.parse(body));
                } catch (error) {
                  reject(error);
                }
              });

              response.on("error", (error) => reject(error));
            }
          )
          .on("error", (error) => reject(error));
      });

      list.then((contributors) => {
        let listContri = "A list of People Contributing to Michiaki repo\n\n\n";

        contributors
          .filter(
            (contributor) =>
              !contributor.login.includes("[bot]") ||
              contributor.type === "User"
          )
          .map(
            (contributor) =>
              (listContri += ` *${contributor.login} - ${contributor.contributions} Contributions.*\n\n`)
          );

        message.channel.send({ content: listContri });
      });
    } catch (err) {
      return message.channel.send({ content: err });
    }
  }
};
