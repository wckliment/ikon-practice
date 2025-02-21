const mysql = require("mysql2");
require("dotenv").config(); // Load .env variables

// Create MySQL connection
const ikonDB = mysql.createConnection({
  host: process.env.IKON_DB_HOST,
  user: process.env.IKON_DB_USER,
  password: process.env.IKON_DB_PASS,
  database: process.env.IKON_DB_NAME,
  port: process.env.IKON_DB_PORT,
});

// Connect to MySQL
ikonDB.connect((err) => {
  if (err) {
    console.error("❌ Error connecting to MySQL:", err);
    return;
  }
  console.log("✅ Connected to ikon Practice Database");
});

module.exports = ikonDB;
