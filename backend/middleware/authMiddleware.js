const jwt = require("jsonwebtoken");

const authenticateUser = (req, res, next) => {
  // 🧪 Debug: log incoming headers
  console.log("🧪 Incoming headers:", req.headers);

  const token = req.header("Authorization");
  console.log("🧪 Raw Authorization header:", token);

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    // Remove 'Bearer ' prefix and trim whitespace
    const tokenValue = token.startsWith('Bearer ')
      ? token.replace("Bearer ", "").trim()
      : token.trim();

    const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET);
    console.log("✅ Decoded token:", decoded);

    if (!decoded.userId) {
      console.error("❌ Token missing user ID:", decoded);
      return res.status(403).json({ error: "Invalid token structure." });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error("❌ Token verification error:", error);
    return res.status(403).json({ error: "Invalid or expired token." });
  }
};

module.exports = authenticateUser;
