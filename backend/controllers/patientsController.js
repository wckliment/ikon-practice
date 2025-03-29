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
