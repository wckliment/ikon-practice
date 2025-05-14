const OpenDentalService = require("../services/openDentalService");
const {
  getLocationCodeById,
  getKeysFromLocation,
} = require("../utils/locationUtils");

const ensureOpenDental = async (req, res, next) => {
  const locationId = req.user?.location_id;

  if (!locationId) {
    return res.status(401).json({ error: "No location_id found on user." });
  }

  try {
    const code = await getLocationCodeById(locationId);
    const { devKey, custKey } = await getKeysFromLocation(code);

    req.openDentalService = new OpenDentalService(devKey, custKey);
    next();
  } catch (err) {
    console.error("❌ Failed to initialize OpenDentalService:", err.message);
    return res.status(500).json({ error: "Failed to connect to Open Dental API." });
  }
};

module.exports = ensureOpenDental;
