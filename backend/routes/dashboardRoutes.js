const express = require("express");
const router = express.Router();
const {
  getPatientDashboard,
  getDoctorDashboard,
} = require("../controllers/dashboardController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/patient", authorize("patient", "admin"), getPatientDashboard);
router.get("/doctor", authorize("doctor", "admin"), getDoctorDashboard);

module.exports = router;
