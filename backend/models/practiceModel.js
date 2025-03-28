const ikonDB = require("../config/db");

const Practice = {};

// Get practice info by location ID (or fallback)
Practice.getInfo = async (locationId) => {
  console.log("📌 Model: Fetching practice info for locationId:", locationId);

  let query;
  let params = [];

  // Map known location IDs to practice names
  const locationToPracticeMap = {
    5: "Longhorn Dental",
    6: "Relaxation Dental"
  };

  const practiceName = locationToPracticeMap[locationId];

  if (practiceName) {
    console.log(`🔁 Model: Matched locationId ${locationId} to practice "${practiceName}"`);
    query = "SELECT * FROM practice WHERE name = ?";
    params = [practiceName];
  } else {
    console.log("⚠️ Model: No matching location ID. Using fallback query.");
    query = "SELECT * FROM practice LIMIT 1";
  }

  try {
    const [results] = await ikonDB.query(query, params);

    if (!results || results.length === 0) {
      console.log("📭 Model: No matching practice found. Returning fallback.");
      const [fallback] = await ikonDB.query("SELECT * FROM practice LIMIT 1");
      return [fallback];
    }

    return [results];
  } catch (error) {
    console.error("❌ Model: Error fetching practice info:", error);
    throw error;
  }
};

// Update or insert practice info
Practice.update = async (practiceData) => {
  const {
    name,
    phone,
    address,
    city,
    state,
    zip,
    website,
    tax_id
  } = practiceData;

  try {
    const [existingResults] = await ikonDB.query("SELECT * FROM practice LIMIT 1");

    if (!existingResults || existingResults.length === 0) {
      // Insert new practice
      const insertQuery = `
        INSERT INTO practice (name, phone, address, city, state, zip, website, tax_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      return await ikonDB.query(insertQuery, [
        name,
        phone,
        address,
        city,
        state,
        zip,
        website,
        tax_id
      ]);
    } else {
      // Update existing practice
      const updateQuery = `
        UPDATE practice
        SET name = ?, phone = ?, address = ?, city = ?, state = ?, zip = ?, website = ?, tax_id = ?
        WHERE id = ?
      `;

      return await ikonDB.query(updateQuery, [
        name,
        phone,
        address,
        city,
        state,
        zip,
        website,
        tax_id,
        existingResults[0].id
      ]);
    }
  } catch (error) {
    console.error("❌ Model: Error updating practice:", error);
    throw error;
  }
};

module.exports = Practice;
