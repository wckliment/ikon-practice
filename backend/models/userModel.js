const ikonDB = require("../config/db");
const User = {};

// ✅ Get all users
User.getAllUsers = (callback) => {
  const query = "SELECT u.id, u.name, u.dob, u.email, u.role, u.created_at, l.name AS location_name, l.id AS location_id FROM users u LEFT JOIN locations l ON u.location_id = l.id";
  ikonDB.query(query, callback);
};

// ✅ Get user by ID
User.getUserById = (id, callback) => {
  const query = "SELECT u.id, u.name, u.dob, u.email, u.role, u.created_at, l.name AS location_name, l.id AS location_id FROM users u LEFT JOIN locations l ON u.location_id = l.id WHERE u.id = ?";
  ikonDB.query(query, [id], callback);
};

// ✅ Find user by email (For Login)
User.findByEmail = (email, callback) => {
  const query = "SELECT u.*, l.name AS location_name, l.id AS location_id FROM users u LEFT JOIN locations l ON u.location_id = l.id WHERE u.email = ?";
  ikonDB.query(query, [email.trim()], (err, results) => {
    if (err) {
      console.error("Database error in findByEmail:", err.sqlMessage);
      return callback(err, null);
    }
    callback(null, results);
  });
};

// ✅ Create new user with role, DOB & location
User.create = (name, dob, email, password, role, location_id, callback) => {
  // Ensure empty DOB is stored as NULL
  const formattedDob = dob ? dob : null;
  // Ensure role is always stored in lowercase
  const formattedRole = role ? role.trim().toLowerCase() : "staff"; // Default role if missing
  // Allow null location_id
  const formattedLocationId = location_id || null;

  const query = "INSERT INTO users (name, dob, email, password, role, location_id) VALUES (?, ?, ?, ?, ?, ?)";
  ikonDB.query(query, [name.trim(), formattedDob, email.trim(), password, formattedRole, formattedLocationId], callback);
};

// ✅ Update user's location
User.updateLocation = (userId, locationId, callback) => {
  const query = "UPDATE users SET location_id = ? WHERE id = ?";
  ikonDB.query(query, [locationId, userId], callback);
};

// ✅ Get users by location
User.getUsersByLocation = (locationId, callback) => {
  const query = "SELECT id, name, dob, email, role, created_at FROM users WHERE location_id = ?";
  ikonDB.query(query, [locationId], callback);
};

// ✅ Get users without a location
User.getUsersWithoutLocation = (callback) => {
  const query = "SELECT id, name, dob, email, role, created_at FROM users WHERE location_id IS NULL";
  ikonDB.query(query, callback);
};

module.exports = User;
