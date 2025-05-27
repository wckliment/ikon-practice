const OpenDentalService = require("../services/openDentalService");
const { getKeysFromLocation } = require("../utils/locationUtils");

exports.matchPatient = async (req, res) => {
  const { name, dob, locationCode } = req.query;

  console.log("📥 Incoming match request:");
  console.log("  name:", name);
  console.log("  dob:", dob);
  console.log("  locationCode:", locationCode);

  if (!name || !dob || !locationCode) {
    return res.status(400).json({ message: "Missing required parameters" });
  }

  try {
    const { devKey, custKey } = await getKeysFromLocation(locationCode);
    const odService = new OpenDentalService(devKey, custKey);

    const patients = await odService.getPatients();
    const [firstName, ...lastParts] = name.trim().split(" ");
    const lastName = lastParts.join(" ");

    const matched = patients.find(p =>
      p.FName?.toLowerCase() === firstName.toLowerCase() &&
      p.LName?.toLowerCase() === lastName.toLowerCase() &&
      p.Birthdate?.startsWith(dob) // Matches YYYY-MM-DD
    );

    if (matched) {
      console.log("✅ Match found:", matched.PatNum);
      return res.json({ patNum: matched.PatNum });
    } else {
      console.log("❌ No match found");
      return res.status(404).json({ message: "No match found" });
    }
  } catch (err) {
    console.error("❌ Failed to match patient:", err);
    res.status(500).json({ message: "Error matching patient" });
  }
};
