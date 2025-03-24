const User = require("../models/userModel");

// ✅ Get all users
exports.getAllUsers = (req, res) => {
  User.getAllUsers((err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
};

// ✅ Get a single user by ID
exports.getUserById = (req, res) => {
  const userId = req.params.id;

  User.getUserById(userId, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (results.length === 0) return res.status(404).json({ error: "User not found" });

    res.json(results[0]);
  });
};

// ✅ Update user's location
exports.updateUserLocation = (req, res) => {
  const userId = req.params.id;
  const { locationId } = req.body;

  if (locationId === undefined) {
    return res.status(400).json({ error: "Location ID is required" });
  }

  User.updateLocation(userId, locationId, (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (result.affectedRows === 0) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User location updated successfully" });
  });
};

// ✅ Get users by location
exports.getUsersByLocation = (req, res) => {
  const locationId = req.params.locationId;

  User.getUsersByLocation(locationId, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
};

// ✅ Get users without a location
exports.getUsersWithoutLocation = (req, res) => {
  User.getUsersWithoutLocation((err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
};

// ✅ Toggle pin status for a user
exports.togglePinStatus = (req, res) => {
  const targetUserId = req.params.id;
  const currentUserId = req.user.userId; // Get the current user's ID from the auth token
  const { isPinned } = req.body;

  // Validate request
  if (isPinned === undefined) {
    return res.status(400).json({ error: "isPinned value is required" });
  }

  User.togglePinStatus(currentUserId, targetUserId, isPinned, (err, result) => {
    if (err) {
      console.error("Error toggling pin status:", err);
      return res.status(500).json({ error: "Database error", details: err.message });
    }

    res.json({
      success: true,
      message: isPinned ? "User pinned successfully" : "User unpinned successfully",
      pinned: isPinned
    });
  });
};

exports.getUserLocations = (req, res) => {
  const userId = req.params.id;

  User.getUserLocations(userId, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
};


exports.getAllUsersWithPinStatus = (req, res) => {
  const currentUserId = req.user.userId;

  User.getAllUsersWithPinStatus(currentUserId, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
};
