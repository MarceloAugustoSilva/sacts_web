require("dotenv").config();

// Fallback de JWT_SECRET para rodar localmente sem .env configurado.
// Em produção, defina a variável real (Vercel → Environment Variables).
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "sacts_dev_secret_local_only";
}

const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("../src/config/db");
const authRoutes = require("../src/routes/authRoutes");
const patientRoutes = require("../src/routes/patientRoutes");
const driverRoutes = require("../src/routes/driverRoutes");
const vehicleRoutes = require("../src/routes/vehicleRoutes");
const appointmentRoutes = require("../src/routes/appointmentRoutes");
const reportsRoutes = require("../src/routes/reportsRoutes");
const seedRoutes = require("../src/routes/seedRoutes");
const { protect } = require("../src/middlewares/authMiddleware");
const errorHandler = require("../src/middlewares/errorMiddleware");

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "1mb" }));

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "SACTS API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/seed", seedRoutes);
app.use("/api/patients", protect, patientRoutes);
app.use("/api/drivers", protect, driverRoutes);
app.use("/api/vehicles", protect, vehicleRoutes);
app.use("/api/appointments", protect, appointmentRoutes);
app.use("/api/reports", protect, reportsRoutes);

if (process.env.VERCEL !== "1") {
  app.use(express.static(path.join(__dirname, "../public")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/index.html"));
  });
}

app.use(errorHandler);

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`SACTS rodando na porta ${port}`));
}

module.exports = app;
