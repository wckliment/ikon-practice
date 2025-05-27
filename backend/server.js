const express = require("express");
const db = require("./config/db");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();
const http = require("http");
const socketManager = require("./socket");
const { ensureWatcherRunningForLocation } = require("./utils/watcherManager");
const appointmentRequestRoutes = require("./routes/appointmentRequestRoutes");
const notesRoutes = require("./routes/notesRoutes");
const formsRoutes = require("./routes/formsRoutes");
const publicFormsRoutes = require("./routes/publicFormsRoutes");
const formTemplatesRoutes = require("./routes/formTemplatesRoutes");
const formSubmissionRoutes = require("./routes/formSubmissionRoutes");
const customFormSubmissionRoutes = require("./routes/customFormSubmissionRoutes");
const formAdminRoutes = require("./routes/formAdminRoutes");
const OpenDentalService = require("./services/openDentalService");
const patientMatchRoutes = require("./routes/patientMatchRoutes");


const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: ['http://127.0.0.1:5500', 'http://localhost:5500', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT'],
  credentials: true // 🔑 allow cookies/auth headers if needed
}));
app.use(helmet());
app.use(morgan("dev"));

app.use(async (req, res, next) => {
  const locationId = req.user?.location_id || 6;

  try {
    const [[location]] = await db.query(
      `SELECT developer_key, customer_key FROM locations WHERE id = ?`,
      [locationId]
    );

    if (!location || !location.developer_key || !location.customer_key) {
      console.warn(`⚠️ Missing Open Dental API keys for location ${locationId}`);
      req.openDentalService = null;
    } else {
      req.openDentalService = new OpenDentalService(location.developer_key, location.customer_key);
    }
  } catch (err) {
    console.error("❌ Failed to initialize OpenDentalService:", err);
    req.openDentalService = null;
  }

  next();
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/usersRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/locations", require("./routes/locationRoutes"));
app.use("/api/practice", require("./routes/practiceRoutes"));
app.use("/api/appointments", require("./routes/appointmentRoutes"));
app.use("/api/providers", require("./routes/providerRoutes"));
app.use("/api/patients", require("./routes/patientRoutes"));
app.use("/api/patient-match", patientMatchRoutes);
app.use("/api/poll", require("./routes/pollRoutes"));
app.use("/api/messages/hidden", require("./routes/hiddenMessagesRoutes"));
app.use("/api/appointment-requests", appointmentRequestRoutes);
app.use("/api/notes", notesRoutes);
// 👇 Handles /api/forms (form template management like GET /api/forms/:id)
app.use("/api/forms", formTemplatesRoutes);
// 👇 Handles /api/forms/:formId/submissions (staff submission routes
app.use("/api/forms/:formId/submissions", formSubmissionRoutes);
// 👇 Handles /api/custom-form-submissions/linked, /unlinked, etc.
app.use("/api/custom-form-submissions", formSubmissionRoutes);
// 👇 Handles /api/forms/submissions (public submission via token)
app.use("/api/form-submissions", formSubmissionRoutes);
app.use("/api/forms/submissions", formSubmissionRoutes);
app.use("/api/public-forms", publicFormsRoutes);
app.use("/api/reconcilliation", require("./routes/reconcilliationRoutes"));
app.use("/api/form-admin", formAdminRoutes);







// Initialize HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketManager.init(server);
app.set("io", io);

// ✅ Add this AFTER io is initialized
const customFormTokenRoutes = require("./routes/customFormTokenRoutes")(io);
app.use("/api/custom-form-tokens", customFormTokenRoutes);

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
