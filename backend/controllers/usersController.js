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
