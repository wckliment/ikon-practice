const ikonDB = require("../config/db");

const User = {};

// ✅ Function to get all users
User.getAllUsers = (callback) => {
  const query = "SELECT id, name, email, role, created_at FROM users";
  ikonDB.query(query, callback);
};

// ✅ Function to get a user by ID
User.getUserById = (id, callback) => {
  const query = "SELECT id, name, email, role, created_at FROM users WHERE id = ?";
  ikonDB.query(query, [id], callback);
};

// ✅ Function to find a user by email (For Login)
User.findByEmail = (email, callback) => {
  const query = "SELECT * FROM users WHERE email = ?";
  ikonDB.query(query, [email], (err, results) => {
    if (err) {
      console.error("Database error in findByEmail:", err);
      return callback(err, null);
    }
    callback(null, results);
  });
};

// ✅ Function to create a new user (For Registration)
User.create = (name, email, password, role, callback) => {
  const query = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
  ikonDB.query(query, [name, email, password, role], callback);
};

module.exports = User;
