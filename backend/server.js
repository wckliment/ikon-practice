const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const http = require("http");
const socketManager = require("./socket");


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


// ✅ Create HTTP server and wrap Express app
const server = http.createServer(app);

// ✅ Initialize and configure Socket.IO from your socket.js module
const io = socketManager.init(server); // Exposes io and sets up listeners
app.set("io", io); // Optional if you want access via req.app.get('io')

// // 🔁 Global background polling: runs every 30 seconds for all locations
// setInterval(async () => {
//   try {
//     const [locations] = await db.query('SELECT id FROM locations');

//     if (!locations.length) {
//       console.warn('⚠️ No locations found for polling.');
//       return;
//     }

//     for (const loc of locations) {
//       const locationId = loc.id;
//       console.log(`🛰️ Background polling: location ${locationId}`);
//       await pollForCheckInUpdates(locationId);
//     }
//   } catch (err) {
//     console.error('❌ Global polling loop failed:', err.message);
//   }
// }, 30000);

const tabletRoutes = require("./routes/tabletRoutes");
app.use("/api/tablet", tabletRoutes);

const operatoriesRoutes = require("./routes/operatoriesRoutes");
app.use("/api/operatories", operatoriesRoutes);

// ✅ Start server with HTTP + WebSocket support
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server + WebSockets running on port ${PORT}`);
});
