const Location = require("../models/locationModel");

// Get all locations
exports.getAllLocations = async (req, res) => {
  try {
    const locations = await Location.getAll();
    res.json(locations);
  } catch (err) {
    console.error("Error fetching locations:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
};

// Get a single location by ID
exports.getLocationById = async (req, res) => {
  const locationId = req.params.id;

  try {
    const results = await Location.getById(locationId);
    if (results.length === 0) {
      return res.status(404).json({ error: "Location not found" });
    }
    res.json(results[0]);
  } catch (err) {
    console.error("Error fetching location:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
};

// Create new location
exports.createLocation = async (req, res) => {
  const { name, address, city, state, zip, customer_key, developer_key } = req.body;

  if (!name || !customer_key || !developer_key) {
    return res.status(400).json({
      error: "Name, customer key, and developer key are required"
    });
  }

  try {
    const result = await Location.create({
      name,
      address,
      city,
      state,
      zip,
      customer_key,
      developer_key
    });

    res.status(201).json({
      message: "Location created successfully",
      locationId: result.insertId
    });
  } catch (err) {
    console.error("Error creating location:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
};

// Update location
exports.updateLocation = async (req, res) => {
  const locationId = req.params.id;
  const locationData = req.body;

  if (!locationData.name || !locationData.customer_key || !locationData.developer_key) {
    return res.status(400).json({
      error: "Name, customer key, and developer key are required"
    });
  }

  try {
    const result = await Location.update(locationId, locationData);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Location not found" });
    }

    res.json({ message: "Location updated successfully" });
  } catch (err) {
    console.error("Error updating location:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
};

// Delete location
exports.deleteLocation = async (req, res) => {
  const locationId = req.params.id;

  try {
    const result = await Location.delete(locationId);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Location not found" });
    }

    res.json({ message: "Location deleted successfully" });
  } catch (err) {
    console.error("Error deleting location:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
};

// Get users in a location
exports.getLocationUsers = async (req, res) => {
  const locationId = req.params.id;

  try {
    const users = await Location.getUsers(locationId);
    res.json(users);
  } catch (err) {
    console.error("Error fetching users in location:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
};
