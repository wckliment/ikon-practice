// Fetch a single patient by ID
exports.getPatientById = async (req, res) => {
  const { id } = req.params;

  try {
    const patient = await req.openDentalService.getPatient(id);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json(patient);
  } catch (error) {
    console.error(`❌ Failed to fetch patient ${id}:`, error.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.searchPatients = async (req, res) => {
  const { search } = req.query;

  if (!search) {
    return res.status(400).json({ message: "Search term is required" });
  }

  console.log(`Searching for patients with term: ${search}`); // Log the search term

  try {
    const patients = await req.openDentalService.searchPatients(search); // Call searchPatients from OpenDentalService
    if (!patients || patients.length === 0) {
      return res.status(404).json({ message: "No patients found" });
    }

    res.json(patients); // Send the list of patients found
  } catch (error) {
    console.error("❌ Error searching for patients:", error.message);
    res.status(500).json({ message: "Failed to search patients", error: error.message });
  }
};

// 🔄 Batch fetch patients by an array of PatNums
exports.getPatientsByIds = async (req, res) => {
  const { patNums } = req.body;

  if (!Array.isArray(patNums) || patNums.length === 0) {
    return res.status(400).json({ message: "Invalid or missing patNums" });
  }

  try {
    const patients = await req.openDentalService.getMultiplePatients(patNums); // We'll add this next
    res.json(patients);
  } catch (error) {
    console.error("❌ Failed to batch fetch patients:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// In backend/controllers/patientsController.js

exports.createPatient = async (req, res) => {
  try {
    const { FName, LName, Phone, Email, Birthdate, Gender } = req.body;

    if (!FName || !LName || !Phone || !Email) {
      return res.status(400).json({ error: "Missing required patient fields" });
    }

    // Insert the new patient via your Open Dental integration
    const result = await req.openDentalService.createPatient({
      FName,
      LName,
      Phone,
      Email,
      Birthdate,
      Gender,
    });

    res.status(201).json(result);
  } catch (error) {
  console.error("❌ Failed to create patient:", error.message);

  // If Open Dental responded with an error body, print it
  if (error.response) {
    console.error('🔴 Open Dental Error Response:', error.response.data);
  }

  res.status(500).json({ error: "Failed to create patient", details: error.response?.data || error.message });
}
};
