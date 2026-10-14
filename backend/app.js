const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

// Route handlers
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const prescriptionRoutes = require("./routes/prescriptionRoutes");
const reportRoutes = require("./routes/reportRoutes");
const vitalRoutes = require("./routes/vitalRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminRoutes = require("./routes/adminRoutes");

// Error middlewares
const {
  notFound,
  errorHandler,
} = require("./middleware/errorMiddleware");

const app = express();

// =========================================================
// MIDDLEWARES
// =========================================================

app.use(
  cors({
    origin: "*",
    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =========================================================
// UPLOADED FILES
// =========================================================

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);

// =========================================================
// LOGGER
// =========================================================

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// =========================================================
// HEALTH CHECK
// =========================================================

app.get("/", (req, res) => {
  res.json({
    status: "online",
    message:
      "WithUSync Healthcare Portal Backend REST API is running",
    version: "1.0.0",
    documentation: "/api/health",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// =========================================================
// API ROUTES
// =========================================================

app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use(
  "/api/appointments",
  appointmentRoutes
);

app.use(
  "/api/prescriptions",
  prescriptionRoutes
);

app.use(
  "/api/reports",
  reportRoutes
);

app.use("/api/vitals", vitalRoutes);

app.use(
  "/api/dashboard",
  dashboardRoutes
);

app.use(
  "/api/notifications",
  notificationRoutes
);

app.use("/api/admin", adminRoutes);

// =========================================================
// ERROR HANDLING
// =========================================================

app.use(notFound);

app.use(errorHandler);

module.exports = app;