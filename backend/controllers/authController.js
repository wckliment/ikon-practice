const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");

// ✅ User Registration with Role, DOB, and Location
exports.register = (req, res) => {
  const { name, dob, email, password, role, location_id } = req.body;
  if (!name || !dob || !email || !password || !role) {
    return res.status(400).json({ error: "All fields are required" });
  }
  User.findByEmail(email, (err, results) => {
    if (err) return res.status(500).json({ error: "Server error" });
    if (results.length > 0) {
      return res.status(400).json({ error: "Email is already in use" });
    }
    // ✅ Hash password before storing
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        console.error("Error hashing password:", err);
        return res.status(500).json({ error: "Error hashing password" });
      }
      User.create(name, dob, email, hashedPassword, role.toLowerCase(), location_id, (err, result) => {
        if (err) {
          console.error("Error registering user:", err);
          return res.status(500).json({ error: "Server error" });
        }
        res.status(201).json({ message: "User registered successfully" });
      });
    });
  });
};

// ✅ Updated User Login Function with Refresh Token
exports.login = (req, res) => {
  const { email, password } = req.body;
  User.findByEmail(email, (err, results) => {
    if (err) return res.status(500).json({ error: "Server error" });
    if (results.length === 0) return res.status(401).json({ error: "Invalid email or password" });

    const user = results[0];
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) return res.status(500).json({ error: "Server error" });
      if (!isMatch) return res.status(401).json({ error: "Invalid email or password" });

      // Create payload for tokens
      const payload = {
        userId: user.id,
        role: user.role,
        location_id: user.location_id
      };

      // ✅ Generate access JWT Token (short-lived)
      const token = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      // ✅ Generate refresh token (long-lived)
      const refreshToken = jwt.sign(
        payload,
        process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET + "_refresh",
        { expiresIn: "7d" }
      );

      // ✅ Return user data with both tokens
      res.json({
        message: "Login successful",
        token,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          location_id: user.location_id,
          location_name: user.location_name
        }
      });
    });
  });
};

// ✅ New Refresh Token Endpoint
exports.refreshToken = (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: "Refresh token is required" });
  }

  try {
    // Verify the refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET + "_refresh"
    );

    // Check if we have all needed user data
    if (!decoded.userId || !decoded.role) {
      return res.status(403).json({ error: "Invalid token structure" });
    }

    // Generate a new access token
    const token = jwt.sign(
      {
        userId: decoded.userId,
        role: decoded.role,
        location_id: decoded.location_id
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Return new access token
    res.json({
      message: "Token refreshed successfully",
      token
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(403).json({ error: "Invalid or expired refresh token" });
  }
};

// Optional: Token validation endpoint for frontend to check token status
exports.validateToken = (req, res) => {
  // This function doesn't need to do anything special
  // The authenticateUser middleware already validated the token
  // Just return success since if we got here, the token is valid
  res.json({ valid: true });
};
