const ikonDB = require("../config/db");
const Practice = {};

Practice.getInfo = (locationId, callback) => {
  console.log("DETAILED Model: Getting practice info for location ID:", locationId);
  console.log("DETAILED Model: locationId type:", typeof locationId);

  // No location ID provided
  if (!locationId) {
    console.log("DETAILED Model: No location ID provided, returning default practice");
    const query = "SELECT * FROM practice LIMIT 1";
    return ikonDB.query(query, callback);
  }

  // Map location IDs directly to practice names
  let practiceName;

  // Location ID 5 = Longhorn Dental, Location ID 6 = Relaxation Dental
  if (locationId == 5) {
    practiceName = "Longhorn Dental";
    console.log("DETAILED Model: Mapped to Longhorn Dental");
  } else if (locationId == 6) {
    practiceName = "Relaxation Dental";
    console.log("DETAILED Model: Mapped to Relaxation Dental");
  } else {
    // Unknown location ID, fall back to default
    console.log("DETAILED Model: Unknown location ID:", locationId);
    const query = "SELECT * FROM practice LIMIT 1";
    return ikonDB.query(query, callback);
  }

  console.log("DETAILED Model: Using practice name:", practiceName);

  // Get practice by name
  const query = "SELECT * FROM practice WHERE name = ?";
  console.log("DETAILED Model: Executing query:", query, "with param:", practiceName);

  ikonDB.query(query, [practiceName], (err, results) => {
    console.log("DETAILED Model: Query results:", results);
    console.log("DETAILED Model: Error (if any):", err);

    if (err || !results || results.length === 0) {
      console.log("DETAILED Model: Error or no results for practice name:", practiceName);
      // Fall back to first practice
      const fallbackQuery = "SELECT * FROM practice LIMIT 1";
      console.log("DETAILED Model: Using fallback query:", fallbackQuery);
      return ikonDB.query(fallbackQuery, callback);
    }

    console.log("DETAILED Model: Found practice:", results[0].name, "for location ID:", locationId);
    callback(null, results);
  });
};

Practice.update = (practiceData, callback) => {
  // The problem is here - we're calling getInfo with no parameters
  Practice.getInfo(null, (err, results) => {
    if (err) return callback(err, null);
    const { name, phone, address, city, state, zip, website, tax_id } = practiceData;

    if (results.length === 0) {
      // Insert new record if none exists
      const insertQuery = `
        INSERT INTO practice (name, phone, address, city, state, zip, website, tax_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      ikonDB.query(
        insertQuery,
        [name, phone, address, city, state, zip, website, tax_id],
        callback
      );
    } else {
      // Update existing record
      const updateQuery = `
        UPDATE practice
        SET name = ?, phone = ?, address = ?, city = ?, state = ?, zip = ?,
        website = ?, tax_id = ?
        WHERE id = ?
      `;
      ikonDB.query(
        updateQuery,
        [name, phone, address, city, state, zip, website, tax_id, results[0].id],
        callback
      );
    }
  });
};

module.exports = Practice;
