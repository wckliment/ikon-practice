const ikonDB = require("../config/db");
const Practice = {};

// Get practice information
Practice.getInfo = (callback) => {
  const query = "SELECT * FROM practice LIMIT 1";
  ikonDB.query(query, callback);
};

// Update practice information
Practice.update = (practiceData, callback) => {
  // Check if practice info already exists
  Practice.getInfo((err, results) => {
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
