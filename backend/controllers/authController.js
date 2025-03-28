const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");

// ✅ User Registration with Role, DOB, and Location
exports.register = async (req, res) => {
  try {
    const { name, dob, email, password, role, location_id } = req.body;

    if (!name || !dob || !email || !password || !role) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUsers = await User.findByEmail(email);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: "Email is already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create(name, dob, email, hashedPassword, role.toLowerCase(), location_id);

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("❌ Error in register:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

// ✅ Updated User Login Function with Refresh Token
exports.login = async (req, res) => {
  console.log("✅ [LOGIN] Request received with:", req.body);

  const { email, password } = req.body;

  try {
    const users = await User.findByEmail(email);

    if (users.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const payload = {
      userId: user.id,
      role: user.role,
      location_id: user.location_id
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
    const refreshToken = jwt.sign(
      payload,
      process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET + "_refresh",
      { expiresIn: "7d" }
    );

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
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

// ✅ Refresh Token Endpoint
exports.refreshToken = (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: "Refresh token is required" });
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET + "_refresh"
    );

    if (!decoded.userId || !decoded.role) {
      return res.status(403).json({ error: "Invalid token structure" });
    }

    const newToken = jwt.sign(
      {
        userId: decoded.userId,
        role: decoded.role,
        location_id: decoded.location_id
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Token refreshed successfully",
      token: newToken
    });
  } catch (error) {
    console.error("❌ Refresh token error:", error);
    res.status(403).json({ error: "Invalid or expired refresh token" });
  }
};

// ✅ Validate Token Endpoint
exports.validateToken = (req, res) => {
  res.json({ valid: true });
};
