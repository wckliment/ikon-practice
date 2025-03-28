const User = require("../models/userModel");

exports.getAllUsers = async (req, res) => {
  try {
    const currentUserLocationId = req.user.location_id;
    console.log("Fetching users for location ID:", currentUserLocationId);

    const results = await User.getUsersByLocation(currentUserLocationId);
    console.log(`Retrieved ${results.length} users for location ID: ${currentUserLocationId}`);

    const processedUsers = results.map(user => ({
      ...user,
      location_name: user.location_name || "No Location",
      location_id: user.location_id || null
    }));

    res.json(processedUsers);
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    res.status(500).json({ error: "Database error" });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const results = await User.getUserById(userId);
    if (results.length === 0) return res.status(404).json({ error: "User not found" });
    res.json(results[0]);
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
};

exports.updateUserLocation = async (req, res) => {
  try {
    const userId = req.params.id;
    const { locationId } = req.body;

    if (locationId === undefined) {
      return res.status(400).json({ error: "Location ID is required" });
    }

    const result = await User.updateLocation(userId, locationId);
    if (result.affectedRows === 0) return res.status(404).json({ error: "User not found" });

    res.json({ message: "User location updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
};

exports.getUsersByLocation = async (req, res) => {
  const locationId = req.params.locationId;
  console.log("Attempting to fetch users for location:", locationId);

  try {
    const results = await User.getUsersByLocation(locationId);
    res.json(results || []);
  } catch (error) {
    console.error("Error fetching users by location:", error);
    res.status(500).json({ error: "Database error", details: error.message });
  }
};

exports.getUsersWithoutLocation = async (req, res) => {
  try {
    const results = await User.getUsersWithoutLocation();
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
};

exports.togglePinStatus = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.userId;
    const { isPinned } = req.body;

    if (isPinned === undefined) {
      return res.status(400).json({ error: "isPinned value is required" });
    }

    await User.togglePinStatus(currentUserId, targetUserId, isPinned);
    res.json({
      success: true,
      message: isPinned ? "User pinned successfully" : "User unpinned successfully",
      pinned: isPinned
    });
  } catch (error) {
    console.error("Error toggling pin status:", error);
    res.status(500).json({ error: "Database error", details: error.message });
  }
};

exports.getUserLocations = async (req, res) => {
  const userId = req.params.id;
  console.log(`Controller: Fetching locations for user ID: ${userId}`);

  try {
    const results = await User.getUserLocations(userId);
    console.log("Controller location results:", results);
    res.json(results);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Database error" });
  }
};

exports.getAllUsersWithPinStatus = async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const results = await User.getAllUsersWithPinStatus(currentUserId);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const userData = req.body;

    const result = await User.update(userId, userData);
    if (result.affectedRows === 0) return res.status(404).json({ error: "User not found" });

    const updatedUser = await User.getUserById(userId);
    if (updatedUser.length === 0) return res.status(404).json({ error: "User not found" });

    res.json(updatedUser[0]);
  } catch (error) {
    res.status(500).json({ error: "Database error", details: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const result = await User.delete(userId);
    if (result.affectedRows === 0) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deactivated successfully", id: userId });
  } catch (error) {
    res.status(500).json({ error: "Database error", details: error.message });
  }
};
