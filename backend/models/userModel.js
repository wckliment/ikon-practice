const ikonDB = require("../config/db");

const User = {};

// ✅ Get all users
User.getAllUsers = (callback) => {
  const query = "SELECT id, name, dob, email, role, created_at FROM users";
  ikonDB.query(query, callback);
};

// ✅ Get user by ID
User.getUserById = (id, callback) => {
  const query = "SELECT id, name, dob, email, role, created_at FROM users WHERE id = ?";
  ikonDB.query(query, [id], callback);
};

// ✅ Find user by email (For Login)
User.findByEmail = (email, callback) => {
  const query = "SELECT * FROM users WHERE email = ?";
  ikonDB.query(query, [email.trim()], (err, results) => {
    if (err) {
      console.error("Database error in findByEmail:", err.sqlMessage);
      return callback(err, null);
    }
    callback(null, results);
  });
};

// ✅ Create new user with role & DOB
User.create = (name, dob, email, password, role, callback) => {
  // Ensure empty DOB is stored as NULL
  const formattedDob = dob ? dob : null;

  // Ensure role is always stored in lowercase
  const formattedRole = role ? role.trim().toLowerCase() : "staff"; // Default role if missing

  const query = "INSERT INTO users (name, dob, email, password, role) VALUES (?, ?, ?, ?, ?)";
  ikonDB.query(query, [name.trim(), formattedDob, email.trim(), password, formattedRole], callback);
};

module.exports = User;

