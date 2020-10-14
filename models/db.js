const { Pool } = require("pg");
const connectionString =
  "postgressql://postgres:postgres@localhost:5432/Restaurant";
const pool = new Pool({
  connectionString: connectionString,
});

module.exports = pool;
