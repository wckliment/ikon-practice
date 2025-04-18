const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();
const http = require("http");

const socketManager = require("./socket");
const { ensureWatcherRunningForLocation } = require("./utils/watcherManager");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/usersRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/locations", require("./routes/locationRoutes"));
app.use("/api/practice", require("./routes/practiceRoutes"));
app.use("/api/appointments", require("./routes/appointmentRoutes"));
app.use("/api/providers", require("./routes/providerRoutes"));
app.use("/api/patients", require("./routes/patientRoutes"));
app.use("/api/poll", require("./routes/pollRoutes"));

// Initialize HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketManager.init(server);
app.set("io", io);

// Tablet routes with socket
app.use("/api/tablet", require("./routes/tabletRoutes")(io));
app.use("/api/operatories", require("./routes/operatoriesRoutes"));

// 🚀 Start confirmation watcher dynamically for your "relaxation" test location
ensureWatcherRunningForLocation("relaxation", io);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server + WebSockets running on port ${PORT}`);
});
