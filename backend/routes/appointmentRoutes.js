const express = require("express");
const router = express.Router();
const {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
} = require("../controllers/appointmentController");
const { protect } = require("../middleware/authMiddleware");

// All appointment routes require authentication
router.use(protect);

router.route("/").post(createAppointment).get(getAppointments);

router.route("/:id").get(getAppointmentById).delete(cancelAppointment);

router.patch("/:id/status", updateAppointmentStatus);

module.exports = router;
