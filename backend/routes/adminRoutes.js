const express = require("express");

const {
  getStats,
  getDoctors,
  createDoctor,
  deleteDoctor,
  getPatients,
  createPatient,
  deletePatient,
  assignPatient,
  getAppointments,
} = require("../controllers/adminController");

const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/stats", getStats);
router.get("/doctors", getDoctors);
router.post("/doctors", createDoctor);
router.delete("/doctors/:id", deleteDoctor);
router.get("/patients", getPatients);
router.post("/patients", createPatient);
router.delete("/patients/:id", deletePatient);
router.put("/patients/:id/assign", assignPatient);
router.get("/appointments", getAppointments);

module.exports = router;
