const Practice = require("../models/practiceModel");
const ikonDB = require("../config/db");


exports.getPracticeInfo = (req, res) => {
  try {
    console.log('API: getPracticeInfo called, user:', req.user);

    // Get location ID from the query parameters instead of user object
    const locationId = req.query.locationId;
    console.log('API: Using location ID from query:', locationId);

    // Pass the location ID to the model
    Practice.getInfo(locationId, (err, results) => {
      if (err) {
        console.error('API: Error querying practice:', err);
        return res.status(500).json({ error: "Database error" });
      }

      console.log('API: Practice query results:', results);

      if (!results || results.length === 0) {
        console.log('API: No practices found');
        return res.json({
          name: "",
          phone: "",
          address: "",
          city: "",
          state: "",
          zip: "",
          website: "",
          tax_id: ""
        });
      }

      console.log('API: Returning practice:', results[0].name);
      res.json(results[0]);
    });
  } catch (error) {
    console.error('API: Unexpected error:', error);
    res.status(500).json({ error: "Server error" });
  }
};

// Update practice information
exports.updatePracticeInfo = (req, res) => {
  const practiceData = req.body;
  // Validate required fields
  if (!practiceData.name) {
    return res.status(400).json({ error: "Practice name is required" });
  }

  Practice.update(practiceData, (err, result) => {
    if (err) return res.status(500).json({ error: "Database error", details: err.message });

    // Return updated practice info - pass the location ID here
    Practice.getInfo(req.user?.location_id, (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json(results[0]);
    });
  });
};
