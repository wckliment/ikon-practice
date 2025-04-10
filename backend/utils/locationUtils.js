const db = require("../config/db");

exports.getKeysFromLocation = async (locationCode) => {
  try {
    const [rows] = await db.query(
      "SELECT developer_key, customer_key FROM locations WHERE code = ? LIMIT 1",
      [locationCode]
    );

    if (!rows.length) {
      throw new Error(`No location found with code "${locationCode}"`);
    }

    const { developer_key, customer_key } = rows[0];

    if (!developer_key || !customer_key) {
      throw new Error("Missing API keys for location");
    }

    return {
      devKey: developer_key,
      custKey: customer_key,
    };
  } catch (err) {
    console.error("❌ Failed to get Open Dental keys from location:", err.message);
    throw err;
  }
};

exports.getLocationIdByCode = async (locationCode) => {
  try {
    const [rows] = await db.query(
      "SELECT id FROM locations WHERE code = ? LIMIT 1",
      [locationCode]
    );

    if (!rows.length) {
      throw new Error(`No location found with code "${locationCode}"`);
    }

    return rows[0].id;
  } catch (err) {
    console.error("❌ Failed to get location ID by code:", err.message);
    throw err;
  }
};
