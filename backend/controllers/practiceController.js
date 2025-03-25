const Practice = require("../models/practiceModel");

// Get practice information
exports.getPracticeInfo = (req, res) => {
  Practice.getInfo((err, results) => {
    console.log('Database query results:', results);
    console.log('Error:', err);

    if (err) return res.status(500).json({ error: "Database error" });

    if (results.length === 0) {
      console.log('No practice info found, returning empty object');
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

    console.log('Sending practice info:', results[0]);
    res.json(results[0]);
  });
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

    // Return updated practice info
    Practice.getInfo((err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json(results[0]);
    });
  });
};
