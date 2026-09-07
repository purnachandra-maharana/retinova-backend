const { Pool } = require("pg");
require("dotenv").config();

const databaseUrl =
  process.env.RETINOVA_DATABASE_URL || process.env.DATABASE_URL;

const pool = new Pool({
  ...(databaseUrl
    ? {
        connectionString: databaseUrl,
        ssl: process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : undefined,
      }
    : {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      }),
});

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL error:", err);
});

module.exports = pool;