const jwt = require("jsonwebtoken");

module.exports = async function authenticateFlexible(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  // ✅ Try to verify standard JWT token (used by staff/admin/ikonConnect)
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (err) {
      console.warn("⚠️ Token invalid or expired. Falling back to tablet mode.");
    }
  }

  // ✅ Tablet fallback: allow unauthenticated request if expected conditions exist
  const isTabletFlow =
    req.body?.submitted_by_ip || req.headers["x-tablet-mode"] === "true";

  if (isTabletFlow) {
    req.user = null; // explicit null for clarity
    return next();
  }

  // ❌ Neither valid JWT nor tablet-safe fallback
  return res.status(403).json({ error: "Unauthorized request." });
};
