const jwt = require("jsonwebtoken"); 
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");

// ✅ User Registration with Password Hashing
exports.register = (req, res) => {
  const { name, email, password, role } = req.body;

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

      User.create(name, email, hashedPassword, role, (err, result) => {
        if (err) {
          console.error("Error registering user:", err);
          return res.status(500).json({ error: "Server error" });
        }
        res.status(201).json({ message: "User registered successfully" });
      });
    });
  });
};

// ✅ User Login & JWT Token Generation
exports.login = (req, res) => {
  const { email, password } = req.body;

  User.findByEmail(email, (err, results) => {
    if (err) return res.status(500).json({ error: "Server error" });
    if (results.length === 0) return res.status(401).json({ error: "Invalid email or password" });

    const user = results[0];

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) return res.status(500).json({ error: "Server error" });
      if (!isMatch) return res.status(401).json({ error: "Invalid email or password" });

      // ✅ Generate JWT Token
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET,  // ✅ Ensure you have JWT_SECRET in your .env file
        { expiresIn: "1h" }
      );

      res.json({ message: "Login successful", token });
    });
  });
};
