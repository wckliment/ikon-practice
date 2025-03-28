const Practice = require("../models/practiceModel");

exports.getPracticeInfo = async (req, res) => {
  try {
    const locationId = req.query.locationId;

    if (!locationId) {
      return res.status(400).json({ error: "Location ID is required" });
    }

    console.log("🧠 getPracticeInfo - locationId:", locationId);

    const [results] = await Practice.getInfo(locationId);

    if (!results || results.length === 0) {
      console.log("📭 No practice found for location");
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

    res.json(results[0]);
  } catch (error) {
    console.error("❌ getPracticeInfo error:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

exports.updatePracticeInfo = async (req, res) => {
  try {
    const practiceData = req.body;
    const locationId = req.user?.location_id;

    if (!practiceData.name) {
      return res.status(400).json({ error: "Practice name is required" });
    }

    console.log("🛠️ Updating practice info for location:", locationId);

    await Practice.update(practiceData);

    // Re-fetch updated info
    const [updatedResults] = await Practice.getInfo(locationId);

    res.json(updatedResults[0] || {});
  } catch (error) {
    console.error("❌ updatePracticeInfo error:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};
