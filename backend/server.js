const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();
const app = express();
const pollForCheckInUpdates = require('./polling/checkInWatcher');
const db = require('./config/db');

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// Import Routes
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const usersRoutes = require("./routes/usersRoutes");
app.use("/api/users", usersRoutes);

const messageRoutes = require("./routes/messageRoutes");
app.use("/api/messages", messageRoutes);

// Add the new location routes
const locationRoutes = require("./routes/locationRoutes");
app.use("/api/locations", locationRoutes);

const practiceRoutes = require("./routes/practiceRoutes");
app.use("/api/practice", practiceRoutes);

const appointmentRoutes = require("./routes/appointmentRoutes");
app.use("/api/appointments", appointmentRoutes);

const providerRoutes = require("./routes/providerRoutes");
app.use("/api/providers", providerRoutes);

const patientRoutes = require("./routes/patientRoutes");
app.use("/api/patients", patientRoutes);

const pollRoutes = require("./routes/pollRoutes");
app.use("/api/poll", pollRoutes);

// 🔁 Global background polling: runs every 30 seconds for all locations
setInterval(async () => {
  try {
    const [locations] = await db.query('SELECT id FROM locations');

    if (!locations.length) {
      console.warn('⚠️ No locations found for polling.');
      return;
    }

    for (const loc of locations) {
      const locationId = loc.id;
      console.log(`🛰️ Background polling: location ${locationId}`);
      await pollForCheckInUpdates(locationId);
    }
  } catch (err) {
    console.error('❌ Global polling loop failed:', err.message);
  }
}, 30000); // every 30 seconds


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
