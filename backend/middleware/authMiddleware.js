const jwt = require("jsonwebtoken");

const authenticateUser = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    // Remove 'Bearer ' prefix if present
    const tokenValue = token.startsWith('Bearer ') ? token.replace("Bearer ", "") : token;

    // Verify the token
    const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET);

    // Log the decoded token for debugging
    console.log("DEBUG - Decoded token:", decoded);

    // Make sure we have a user ID (changed from decoded.id to decoded.userId)
    if (!decoded.userId) {
      console.error("Token missing user ID:", decoded);
      return res.status(403).json({ error: "Invalid token structure." });
    }

    // Attach user data to request
    req.user = decoded;
    next(); // Move to the next middleware or route handler
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(403).json({ error: "Invalid or expired token." });
  }
};

module.exports = authenticateUser;
