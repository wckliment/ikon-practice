const ikonDB = require("../config/db");

const Location = {};

// Get all locations
Location.getAll = () => {
  const query = "SELECT * FROM locations";
  return ikonDB.query(query);
};

// Get location by ID
Location.getById = (id) => {
  const query = "SELECT * FROM locations WHERE id = ?";
  return ikonDB.query(query, [id]);
};

// Create new location
Location.create = ({ name, address, city, state, zip, customer_key, developer_key }) => {
  const query = `
    INSERT INTO locations (name, address, city, state, zip, customer_key, developer_key)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    name.trim(),
    address?.trim() || null,
    city?.trim() || null,
    state?.trim() || null,
    zip?.trim() || null,
    customer_key.trim(),
    developer_key.trim()
  ];
  return ikonDB.query(query, values);
};

// Update location
Location.update = (id, { name, address, city, state, zip, customer_key, developer_key }) => {
  const query = `
    UPDATE locations
    SET name = ?, address = ?, city = ?, state = ?, zip = ?, customer_key = ?, developer_key = ?
    WHERE id = ?
  `;
  const values = [
    name.trim(),
    address?.trim() || null,
    city?.trim() || null,
    state?.trim() || null,
    zip?.trim() || null,
    customer_key.trim(),
    developer_key.trim(),
    id
  ];
  return ikonDB.query(query, values);
};

// Delete location
Location.delete = (id) => {
  const query = "DELETE FROM locations WHERE id = ?";
  return ikonDB.query(query, [id]);
};

// Get users by location
Location.getUsers = (locationId) => {
  const query = "SELECT id, name, email, role FROM users WHERE location_id = ?";
  return ikonDB.query(query, [locationId]);
};

module.exports = Location;
