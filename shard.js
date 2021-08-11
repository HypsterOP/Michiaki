require("dotenv/config");
const { ShardingManager } = require("discord.js");

//call the file, where your old start file was usually its called index.js
const shards = new ShardingManager("./src/index.js", {
  execArgv: ["--trace-warnings"],
  mode: "process",
  respawn: "true",
  shardArgs: ["--ansi", "--color"],
  shardList: "auto",
  token: process.env.DISCORD_TOKEN,
  totalShards: "auto"
});
shards.on("shardCreate", (shard) => {
  console.log(
    `[${String(new Date()).split(" ", 5).join(" ")}] Spawned ${shard.id}`
  );
});

shards.spawn({ amount: shards.totalShards, delay: 5500, timeout: 30000 });
