const isAdminOrOwner = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'owner')) {
    return next();
  }
  return res.status(403).json({ error: "Access denied. Only admins and owners can perform this action." });
};

module.exports = { isAdminOrOwner };
