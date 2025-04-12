const { getKeysFromLocation } = require("../utils/locationUtils");
const OpenDentalService = require("../services/openDentalService");

const getOperatories = async (req, res) => {
  const locationCode = req.query.locationCode;

  if (!locationCode) {
    return res.status(400).json({ message: "Missing locationCode parameter" });
  }

  try {
    const { devKey, custKey } = await getKeysFromLocation(locationCode);
    const odService = new OpenDentalService(devKey, custKey);

    const response = await odService.getOperatories(); // This is the new method we’ll add below
    res.status(200).json(response);
  } catch (error) {
    console.error("❌ Failed to fetch operatories:", error.message);
    res.status(500).json({ message: "Failed to retrieve operatories" });
  }
};

module.exports = {
  getOperatories
};
