const User = require("../models/userModel");

exports.getAllUsers = (req, res) => {
  // Get current user's location_id from JWT token
  const currentUserLocationId = req.user.location_id;

  console.log('Fetching users for location ID:', currentUserLocationId);

  // Call the location-specific method instead of getAllUsers
  User.getUsersByLocation(currentUserLocationId, (err, results) => {
    if (err) {
      console.error('Error in getAllUsers:', err);
      return res.status(500).json({ error: "Database error" });
    }

    // Log the results
    console.log(`Retrieved ${results.length} users for location ID: ${currentUserLocationId}`);

    // Transform results to ensure location info
    const processedUsers = results.map(user => ({
      ...user,
      location_name: user.location_name || 'No Location',
      location_id: user.location_id || null
    }));

    res.json(processedUsers);
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

  console.log('Attempting to fetch users for location:', locationId);

  // Ensure error handling is robust
  try {
    User.getUsersByLocation(locationId, (err, results) => {
      if (err) {
        console.error('Database error when fetching users by location:', err);
        return res.status(500).json({
          error: "Database error",
          details: err.message
        });
      }

      console.log('Users found for location:', results);

      // If no users found, return an empty array instead of an error
      res.json(results || []);
    });
  } catch (error) {
    console.error('Unexpected error in getUsersByLocation:', error);
    res.status(500).json({
      error: "Unexpected server error",
      details: error.message
    });
  }
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
  const userId = req.params.id; // Ensure this matches your route definition
  console.log(`Controller: Fetching locations for user ID: ${userId}`);

  User.getUserLocations(userId, (err, results) => {
    if (err) {
      console.error('Controller error:', err);
      return res.status(500).json({ error: "Database error" });
    }

    console.log('Controller location results:', results);
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

// Update user
exports.updateUser = (req, res) => {
  const userId = req.params.id;
  const userData = req.body;
  User.update(userId, userData, (err, result) => {
    if (err) return res.status(500).json({ error: "Database error", details: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: "User not found" });
    // Get the updated user to return
    User.getUserById(userId, (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (results.length === 0) return res.status(404).json({ error: "User not found" });
      res.json(results[0]);
    });
  });
};

// Soft Delete user
exports.deleteUser = (req, res) => {
  const userId = req.params.id;
  User.delete(userId, (err, result) => {
    if (err) return res.status(500).json({ error: "Database error", details: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: "User not found" });
    // For a soft delete, return a success message with the deactivated user ID
    res.json({ message: "User deactivated successfully", id: userId });
  });
};
