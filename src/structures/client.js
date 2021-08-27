/* eslint-disable no-param-reassign */
require("dotenv/config");
require("../utils/global");
const { MessageEmbed } = require("discord.js");
const {
  loadEvent,
  loadCommand,
  loadSlash,
  loadMonitor,
} = require("../utils/handlers");
const DisTube = require("distube");
const { Client, Collection } = require("discord.js");
const { performance } = require("perf_hooks");

module.exports = class client extends Client {
  /**
   * Creates an instance of client.
   * @param { import ("discord.js").ClientOptions } props
   * @memberof client
   */
  constructor(props) {
    // Pass in any client configuration you want for the bot.
    // more client options can be found at
    // https://discord.js.org/#/docs/main/master/typedef/ClientOptions
    if (!props) {
      props = {};
    }

    props.intents = 32767; // Intents.ALL
    props.partials = ["USER", "CHANNEL", "GUILD_MEMBER", "MESSAGE", "REACTION"];
    props.allowedMentions = { parse: ["users"] };
    props.restTimeOffset = 0;
    props.restWsBridgeTimeout = 100;
    super(props);

    require("events").EventEmitter.defaultMaxListeners = 100;
    process.setMaxListeners(100);

    const memer = require("memer-api");

    const alexclient = require("alexflipnote.js");

    this.memer = new memer(process.env.MEME);

    this.alexflipnote = new alexclient(process.env.ALEXFLIPNOTE);

    this.config = require("../config");

    this.distube = new DisTube.DisTube(this, {
      searchSongs: 4,
      emitNewSongOnly: false,
      leaveOnEmpty: true,
      leaveOnFinish: true,
      leaveOnStop: true,
      youtubeCookie: process.env.COOKIE,
      youtubeDL: true,
      customFilters: {
        clear: "dynaudnorm=f=200",
        lowbass: "bass=g=6,dynaudnorm=f=200",
        bassboost: "bass=g=20,dynaudnorm=f=200",
        purebass: "bass=g=20,dynaudnorm=f=200,asubboost,apulsator=hz=0.08",
        "8D": "apulsator=hz=0.08",
        vaporwave: "aresample=48000,asetrate=48000*0.8",
        nightcore: "aresample=48000,asetrate=48000*1.25",
        phaser: "aphaser=in_gain=0.4",
        tremolo: "tremolo",
        vibrato: "vibrato=f=6.5",
        reverse: "areverse",
        treble: "treble=g=5",
        normalizer: "dynaudnorm=f=200",
        surrounding: "surround",
        pulsator: "apulsator=hz=1",
        subboost: "asubboost",
        karaoke: "stereotools=mlev=0.03",
        flanger: "flanger",
        gate: "agate",
        haas: "haas",
        mcompand: "mcompand",
      },
    });

    const status = (queue) =>
      `volume: \`${queue.volume}%\` | filter: \`${
        queue.filter || "Off"
      }\` | loop: \`${
        queue.repeatMode
          ? queue.repeatMode == 2
            ? "All Queue"
            : "This Song"
          : "Off"
      }\` | autoplay: \`${queue.autoplay ? "On" : "Off"}\``;

    this.distube
      .on("playSong", (queue, song) =>
        queue.textChannel.send({
          embeds: [
            new MessageEmbed()
              .setTitle("Playing :notes: " + song.name)
              .setURL(song.url)
              .setColor("RANDOM")
              .addField("duration", `\`${song.formattedDuration}\``)
              .addField("queue status", status(queue))
              .setThumbnail(song.thumbnail)
              .setFooter(
                `Requested by: ${song.user.tag}`,
                song.user.displayAvatarURL({ dynamic: true })
              ),
          ],
        })
      )

      .on("addSong", (queue, song) =>
        queue.textChannel.send({
          embeds: [
            new MessageEmbed()
              .setTitle("Added :thumbsup: ")
              .setURL(song.url)
              .setColor("RANDOM")
              .addField(
                `${queue.songs.length} Songs in the Queue`,
                `Duration: \`${format(queue.duration * 1000)}\``
              )
              .addField("Duration", `\`${song.formattedDuration}\``)
              .setThumbnail(song.thumbnail)
              .setFooter(
                `Requested by: ${song.user.tag}`,
                song.user.displayAvatarURL({ dynamic: true })
              ),
          ],
        })
      )

      .on("addList", (queue, playlist) =>
        queue.textChannel.send({
          embeds: [
            new MessageEmbed()
              .setTitle(
                "Added Playlist :thumbsup: " +
                  playlist.name +
                  ` - \`[${playlist.songs.length} songs]\``
              )
              .setURL(playlist.url)
              .setColor("RANDOM")
              .addField("Duration", `\`${playlist.formattedDuration}\``)
              .addField(
                `${queue.songs.length} Songs in the Queue`,
                `Duration: \`${format(queue.duration * 1000)}\``
              )
              .setThumbnail(playlist.thumbnail.url)
              .setFooter(
                `Requested by: ${message.author.tag}`,
                message.author.displayAvatarURL({ dynamic: true })
              ),
          ],
        })
      )

      .on("searchResult", (message, result) =>
        message.channel.send({
          embeds: [
            new MessageEmbed()
              .setTitle("**Choose an option from below**")
              .setURL(song.url)
              .setColor("RANDOM")
              .setDescription(
                `${result
                  .map(
                    (song, i) =>
                      `**${++i}**. ${song.name} - \`${song.formattedDuration}\``
                  )
                  .join(
                    "\n"
                  )}\n\n*Enter anything else or wait 60 seconds to cancel*`
              ),
          ],
        })
      )
      .on("searchCancel", (message) =>
        message.channel.send({
          embeds: [
            new MessageEmbed().setColor("RANDOM").setTitle(`Search Cancelled`),
          ],
        })
      )

      .on("error", (message, e) => {
        console.log(String(e.stack).bgRed);
        message.send({
          embeds: [
            new MessageEmbed()
              .setColor("RED")
              .setTitle(`An error occurred`)
              .setDescription(`\`\`\`${e.stack}\`\`\``),
          ],
        });
      })
      .on("initQueue", (queue) => {
        queue.autoplay = false;
        queue.volume = 75;
        queue.filter = "lowbass";
      });

    this.utils = require("../utils");

    this.mongoose = require("./mongoose");

    this.events = new Collection();

    this.commands = new Collection();

    this.slashCommands = new Collection();

    this.ratelimits = new Collection();

    this.messages = { sent: 0, received: 0 };

    this.bootTime = null;

    super.on("messageCreate", (message) => {
      if (message.author.id === this.user.id) {
        return (this.messages.sent += 1);
      }

      return (this.messages.received += 1);
    });
    super.once("ready", () => {
      this.bootTime = Math.round(performance.now());
    });
  }

  init() {
    this.login()
      .then(() => log.success("Discord Token", "your token is correct!"))
      .then(async () => {
        this.mongoose.init(this);
        loadMonitor(this);
        loadEvent(this);
        loadCommand(this);
        loadSlash(this);
      })
      .catch((err) => log.error("Discord Init", err.stack));
  }
};

// functions //

async function format(millis) {
  try {
    var h = Math.floor(millis / 3600000),
      m = Math.floor(millis / 60000),
      s = ((millis % 60000) / 1000).toFixed(0);
    if (h < 1)
      return (
        (m < 10 ? "0" : "") +
        m +
        ":" +
        (s < 10 ? "0" : "") +
        s +
        " | " +
        Math.floor(millis / 1000) +
        " Seconds"
      );
    else
      return (
        (h < 10 ? "0" : "") +
        h +
        ":" +
        (m < 10 ? "0" : "") +
        m +
        ":" +
        (s < 10 ? "0" : "") +
        s +
        " | " +
        Math.floor(millis / 1000) +
        " Seconds"
      );
  } catch (e) {
    console.log(String(e.stack));
  }
}
