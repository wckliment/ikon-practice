exports.getAllPatients = (req, res) => {
  // Mock response (Later, connect this to the database)
  res.status(200).json([
    { id: 1, name: "Alice", dob: "1990-01-01" },
    { id: 2, name: "Bob", dob: "1992-06-15" }
  ]);
};

exports.createPatient = (req, res) => {
  const { name, dob } = req.body;

  // Mock response (Later, connect this to the database)
  res.status(201).json({
    message: "Patient created successfully",
    patient: { name, dob }
  });
};

