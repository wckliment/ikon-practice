const ikonDB = require("../config/db");
const User = {};

// ✅ Get all users (active only)
User.getAllUsers = (callback) => {
  const query = "SELECT u.id, u.name, u.dob, u.email, u.role, u.created_at, l.name AS location_name, l.id AS location_id FROM users u LEFT JOIN locations l ON u.location_id = l.id WHERE u.active = TRUE OR u.active IS NULL";
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

// ✅ Get users by location (active only)
User.getUsersByLocation = (locationId, callback) => {
  const query = "SELECT id, name, dob, email, role, created_at FROM users WHERE location_id = ? AND (active = TRUE OR active IS NULL)";
  ikonDB.query(query, [locationId], callback);
};

// ✅ Get users without a location
User.getUsersWithoutLocation = (callback) => {
  const query = "SELECT id, name, dob, email, role, created_at FROM users WHERE location_id IS NULL";
  ikonDB.query(query, callback);
};

// ✅ Toggle pin status for a user
User.togglePinStatus = (currentUserId, targetUserId, isPinned, callback) => {
  // First check if we need to create a pinned_users table if it doesn't exist
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS pinned_users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      pinned_user_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_pin (user_id, pinned_user_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (pinned_user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `;

  ikonDB.query(createTableQuery, (tableErr) => {
    if (tableErr) {
      return callback(tableErr);
    }

    // Now handle pin/unpin based on isPinned value
    if (isPinned) {
      // Add the user to pinned users
      const pinQuery = `
        INSERT INTO pinned_users (user_id, pinned_user_id)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE created_at = CURRENT_TIMESTAMP
      `;

      ikonDB.query(pinQuery, [currentUserId, targetUserId], callback);
    } else {
      // Remove the user from pinned users
      const unpinQuery = `
        DELETE FROM pinned_users
        WHERE user_id = ? AND pinned_user_id = ?
      `;

      ikonDB.query(unpinQuery, [currentUserId, targetUserId], callback);
    }
  });
};

// Add this new method to your userModel.js file (don't modify the existing getAllUsers)
User.getAllUsersWithPinStatus = (currentUserId, callback) => {
  const query = `
    SELECT u.id, u.name, u.dob, u.email, u.role, u.created_at,
           l.name AS location_name, l.id AS location_id,
           (SELECT COUNT(*) > 0 FROM pinned_users p
            WHERE p.user_id = ? AND p.pinned_user_id = u.id) AS pinned
    FROM users u
    LEFT JOIN locations l ON u.location_id = l.id
  `;

  ikonDB.query(query, [currentUserId], callback);
};

// Get all users except the specified user ID
User.getAllExceptSender = (senderId, callback) => {
  const query = "SELECT * FROM users WHERE id != ?";
  ikonDB.query(query, [senderId], callback);
};

// Get locations associated with a user
User.getUserLocations = (userId, callback) => {
  // First, get the user's role and location_id
  const userQuery = `
    SELECT role, location_id
    FROM users
    WHERE id = ?
  `;

  ikonDB.query(userQuery, [userId], (err, userResults) => {
    if (err) return callback(err, null);

    // If no user found
    if (!userResults.length) return callback(null, []);

    const userLocationId = userResults[0].location_id;

    // All users, regardless of role, should only see locations they're associated with
    if (userLocationId) {
      const specificLocationQuery = "SELECT * FROM locations WHERE id = ?";
      ikonDB.query(specificLocationQuery, [userLocationId], callback);
    } else {
      callback(null, []); // User has no location assigned
    }
  });
};

// Update user
User.update = (id, userData, callback) => {
  const { name, email, role, dob, location_id } = userData;
  // Ensure empty DOB is stored as NULL
  const formattedDob = dob ? dob : null;
  // Ensure role is always stored in lowercase
  const formattedRole = role ? role.trim().toLowerCase() : "staff";
  // Allow null location_id
  const formattedLocationId = location_id || null;

  const query = "UPDATE users SET name = ?, email = ?, role = ?, dob = ?, location_id = ? WHERE id = ?";
  ikonDB.query(query, [name.trim(), email.trim(), formattedRole, formattedDob, formattedLocationId, id], callback);
};

User.delete = (id, callback) => {
  console.log(`Attempting soft delete for user ${id}`);
  const query = "UPDATE users SET active = FALSE WHERE id = ?";
  ikonDB.query(query, [id], (err, result) => {
    console.log("Soft delete result:", result);
    if (err) console.error("Soft delete error:", err);
    callback(err, result);
  });
};

module.exports = User;
