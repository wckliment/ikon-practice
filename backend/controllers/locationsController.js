const Location = require("../models/locationModel");

// ✅ Get all locations
exports.getAllLocations = (req, res) => {
  Location.getAllLocations((err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
};

// ✅ Get a single location by ID
exports.getLocationById = (req, res) => {
  const locationId = req.params.id;
  Location.getLocationById(locationId, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length === 0) return res.status(404).json({ error: "Location not found" });
    res.json(results[0]);
  });
};

// ✅ Create new location
exports.createLocation = (req, res) => {
  const { name, address, city, state, zip, customer_key, developer_key } = req.body;

  // Validate required fields
  if (!name || !customer_key || !developer_key) {
    return res.status(400).json({ error: "Name, customer key, and developer key are required" });
  }

  Location.create(name, address, city, state, zip, customer_key, developer_key, (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.status(201).json({
      message: "Location created successfully",
      locationId: result.insertId
    });
  });
};

// ✅ Update location
exports.updateLocation = (req, res) => {
  const locationId = req.params.id;
  const locationData = req.body;

  // Validate required fields
  if (!locationData.name || !locationData.customer_key || !locationData.developer_key) {
    return res.status(400).json({ error: "Name, customer key, and developer key are required" });
  }

  Location.update(locationId, locationData, (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Location not found" });
    res.json({ message: "Location updated successfully" });
  });
};

// ✅ Delete location
exports.deleteLocation = (req, res) => {
  const locationId = req.params.id;

  Location.delete(locationId, (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (result.affectedRows === 0) return res.status(404).json({ error: "Location not found" });
    res.json({ message: "Location deleted successfully" });
  });
};

// ✅ Get users in a location
exports.getLocationUsers = (req, res) => {
  const locationId = req.params.id;

  Location.getLocationUsers(locationId, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
};
