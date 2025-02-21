const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();


// Middleware
app.use(express.json());
app.use(cors());

// Routes
// Later, you can import from separate files, e.g.
// const patientRoutes = require("./routes/patientRoutes");
// app.use("/patients", patientRoutes);

const testRoutes = require("./routes/testRoutes");
app.use("/test", testRoutes);


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
