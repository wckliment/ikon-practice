const ikonDB = require("../config/db");
const User = {};

// ✅ Get all users (active only)
User.getAllUsers = async () => {
  const query = `
    SELECT u.id, u.name, u.dob, u.email, u.role, u.created_at,
           l.name AS location_name, u.appointment_color, l.id AS location_id
    FROM users u
    LEFT JOIN locations l ON u.location_id = l.id
    WHERE u.active = TRUE OR u.active IS NULL
  `;
  const [rows] = await ikonDB.query(query);
  return rows;
};

// ✅ Get user by ID
User.getUserById = async (id) => {
  const query = `
    SELECT u.id, u.name, u.dob, u.email, u.role, u.created_at,
           l.name AS location_name, u.appointment_color, l.id AS location_id
    FROM users u
    LEFT JOIN locations l ON u.location_id = l.id
    WHERE u.id = ?
  `;
  const [rows] = await ikonDB.query(query, [id]);
  return rows;
};

// ✅ Find user by email (For Login)
User.findByEmail = async (email) => {
  const query = `
    SELECT u.*, l.name AS location_name, u.appointment_color, l.id AS location_id
    FROM users u
    LEFT JOIN locations l ON u.location_id = l.id
    WHERE u.email = ?
  `;
  const [rows] = await ikonDB.query(query, [email.trim()]);
  return rows;
};

// ✅ Create new user with role, DOB & location
User.create = async (name, dob, email, password, role, location_id) => {
  const formattedDob = dob || null;
  const formattedRole = role ? role.trim().toLowerCase() : "staff";
  const formattedLocationId = location_id || null;
  const query = `
    INSERT INTO users (name, dob, email, password, role, location_id, appointment_color)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const [result] = await ikonDB.query(query, [name.trim(), formattedDob, email.trim(), password, formattedRole, formattedLocationId, null]);
  return result;
};

// ✅ Get users by location
User.getUsersByLocation = async (locationId) => {
  const query = `
    SELECT u.id, u.name, u.dob, u.email, u.role, u.created_at,
           l.name AS location_name, u.appointment_color, l.id AS location_id, u.provider_id
    FROM users u
    LEFT JOIN locations l ON u.location_id = l.id
    WHERE u.location_id = ? AND (u.active = TRUE OR u.active IS NULL)
  `;
  const [rows] = await ikonDB.query(query, [locationId]);
  return rows;
};

// ✅ Get users without a location
User.getUsersWithoutLocation = async () => {
  const query = `
    SELECT id, name, dob, email, role, created_at, appointment_color
    FROM users
    WHERE location_id IS NULL
  `;
  const [rows] = await ikonDB.query(query);
  return rows;
};

// ✅ Toggle pin status for a user
User.togglePinStatus = async (currentUserId, targetUserId, isPinned) => {
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
  await ikonDB.query(createTableQuery);

  if (isPinned) {
    const pinQuery = `
      INSERT INTO pinned_users (user_id, pinned_user_id)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE created_at = CURRENT_TIMESTAMP
    `;
    const [result] = await ikonDB.query(pinQuery, [currentUserId, targetUserId]);
    return result;
  } else {
    const unpinQuery = `
      DELETE FROM pinned_users
      WHERE user_id = ? AND pinned_user_id = ?
    `;
    const [result] = await ikonDB.query(unpinQuery, [currentUserId, targetUserId]);
    return result;
  }
};

User.getAllUsersWithPinStatus = async (currentUserId) => {
  const query = `
    SELECT u.id, u.name, u.dob, u.email, u.role, u.created_at,
           l.name AS location_name, u.appointment_color, l.id AS location_id,
           (SELECT COUNT(*) > 0 FROM pinned_users p
            WHERE p.user_id = ? AND p.pinned_user_id = u.id) AS pinned
    FROM users u
    LEFT JOIN locations l ON u.location_id = l.id
  `;
  const [rows] = await ikonDB.query(query, [currentUserId]);
  return rows;
};

User.getAllExceptSender = async (senderId) => {
  const query = `SELECT * FROM users WHERE id != ?`;
  const [rows] = await ikonDB.query(query, [senderId]);
  return rows;
};

User.getUserLocations = async (userId) => {
  const query = `
    SELECT l.*, u.appointment_color
    FROM locations l
    JOIN users u ON u.location_id = l.id
    WHERE u.id = ?
  `;
  const [rows] = await ikonDB.query(query, [userId]);
  return rows;
};

User.update = async (id, userData) => {
  const { name, email, role, dob, location_id, appointmentColor } = userData;
  const formattedDob = dob || null;
  const formattedRole = role ? role.trim().toLowerCase() : "staff";
  const formattedLocationId = location_id || null;
  const query = `
    UPDATE users
    SET name = ?, email = ?, role = ?, dob = ?, location_id = ?, appointment_color = ?
    WHERE id = ?
  `;
  const [result] = await ikonDB.query(query, [
    name?.trim() || '',
    email?.trim() || '',
    formattedRole,
    formattedDob,
    formattedLocationId,
    appointmentColor || null,
    id
  ]);
  return result;
};

User.delete = async (id) => {
  const query = `UPDATE users SET active = FALSE WHERE id = ?`;
  const [result] = await ikonDB.query(query, [id]);
  return result;
};

module.exports = User;
