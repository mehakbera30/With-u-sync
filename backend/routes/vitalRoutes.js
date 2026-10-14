const express = require("express");

const router = express.Router();

const {
  getPatientVitals,
  createVital,
  updateVital,
  deleteVital,
} = require("../controllers/vitalController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");


// All vital routes require login
router.use(protect);


// Get patient's latest vitals
router.get(
  "/patient/:patientId",
  getPatientVitals
);


// Doctor/Admin can create vitals
router.post(
  "/",
  authorize("doctor", "admin"),
  createVital
);


// Doctor/Admin can update vitals
router.put(
  "/:id",
  authorize("doctor", "admin"),
  updateVital
);

// Doctor/Admin can delete a vital record
router.delete(
  "/:id",
  authorize("doctor", "admin"),
  deleteVital
);


module.exports = router;