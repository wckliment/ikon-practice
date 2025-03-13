const ikonDB = require("../config/db");
const Location = {};

// ✅ Get all locations
Location.getAllLocations = (callback) => {
  const query = "SELECT * FROM locations";
  ikonDB.query(query, callback);
};

// ✅ Get location by ID
Location.getLocationById = (id, callback) => {
  const query = "SELECT * FROM locations WHERE id = ?";
  ikonDB.query(query, [id], callback);
};

// ✅ Create new location
Location.create = (name, address, city, state, zip, customer_key, developer_key, callback) => {
  const query = "INSERT INTO locations (name, address, city, state, zip, customer_key, developer_key) VALUES (?, ?, ?, ?, ?, ?, ?)";
  ikonDB.query(
    query,
    [
      name.trim(),
      address ? address.trim() : null,
      city ? city.trim() : null,
      state ? state.trim() : null,
      zip ? zip.trim() : null,
      customer_key.trim(),
      developer_key.trim()
    ],
    callback
  );
};

// ✅ Update location
Location.update = (id, locationData, callback) => {
  const query = "UPDATE locations SET name = ?, address = ?, city = ?, state = ?, zip = ?, customer_key = ?, developer_key = ? WHERE id = ?";
  ikonDB.query(
    query,
    [
      locationData.name.trim(),
      locationData.address ? locationData.address.trim() : null,
      locationData.city ? locationData.city.trim() : null,
      locationData.state ? locationData.state.trim() : null,
      locationData.zip ? locationData.zip.trim() : null,
      locationData.customer_key.trim(),
      locationData.developer_key.trim(),
      id
    ],
    callback
  );
};

// ✅ Delete location
Location.delete = (id, callback) => {
  const query = "DELETE FROM locations WHERE id = ?";
  ikonDB.query(query, [id], callback);
};

// ✅ Get users by location
Location.getLocationUsers = (locationId, callback) => {
  const query = "SELECT id, name, email, role FROM users WHERE location_id = ?";
  ikonDB.query(query, [locationId], callback);
};

module.exports = Location;
