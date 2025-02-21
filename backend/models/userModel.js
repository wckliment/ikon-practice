const ikonDB = require("../config/db");

const User = {};

// Fetch all users
User.getAllUsers = (callback) => {
  ikonDB.query("SELECT id, name, email, role, created_at FROM users", callback);
};

// Fetch a user by ID
User.getUserById = (id, callback) => {
  ikonDB.query("SELECT id, name, email, role, created_at FROM users WHERE id = ?", [id], callback);
};

module.exports = User;
