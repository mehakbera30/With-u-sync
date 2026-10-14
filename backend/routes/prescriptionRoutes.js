const express = require("express");
const router = express.Router();

const {
  createPrescription,
  getPrescriptions,
  getPrescriptionById,
  updatePrescriptionStatus,
} = require("../controllers/prescriptionController");

const { protect, authorize } = require("../middleware/authMiddleware");


// All prescription routes require login
router.use(protect);


// Create prescription
// Only doctor/admin can create
router.post(
  "/",
  authorize("doctor", "admin"),
  createPrescription
);


// Get prescriptions
// Patient gets their own
// Doctor gets prescriptions created by them
// Admin gets all
router.get(
  "/",
  getPrescriptions
);


// Get one complete prescription
router.get(
  "/:id",
  getPrescriptionById
);


// Update prescription status
router.patch(
  "/:id/status",
  authorize("doctor", "admin"),
  updatePrescriptionStatus
);


module.exports = router;