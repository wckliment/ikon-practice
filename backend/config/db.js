const mysql = require("mysql2/promise");
require("dotenv").config(); // Load .env variables

// Create MySQL connection pool
const ikonDB = mysql.createPool({
  host: process.env.IKON_DB_HOST,
  user: process.env.IKON_DB_USER,
  password: process.env.IKON_DB_PASS,
  database: process.env.IKON_DB_NAME,
  port: process.env.IKON_DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

console.log("✅ ikonDB pool created");

module.exports = ikonDB;
