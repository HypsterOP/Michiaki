const { Client, Pool } = require("pg");

const database = new Pool({
  user: "postgres",
  password: process.env.PASSWORD,
  port: 5432,
  host: "localhost",
  database: "michiaki",
});

database.on("error", (err) => {
  log.error("Postgres error", err);
});

database.connect();

database.on("connect", () => {
  log.success("Database", "Connected to postgres");
});

module.exports = database;
