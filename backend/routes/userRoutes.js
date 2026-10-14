const express = require("express");
const router = express.Router();

const {
  getDoctors,
  getDoctorById,
  getPatients,
  getPatientById,
  updatePatientDetails,
  updateProfile,
  uploadAvatar,
} = require("../controllers/userController");

const { protect, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadmiddleware");

router.get("/doctors", getDoctors);
router.get("/doctors/:id", getDoctorById);

router.get(
  "/patients",
  protect,
  authorize("doctor", "admin"),
  getPatients
);

router.get(
  "/patients/:id",
  protect,
  authorize("patient", "doctor", "admin"),
  getPatientById
);

router.put(
  "/patients/:id",
  protect,
  authorize("doctor", "admin"),
  updatePatientDetails
);

router.put("/profile", protect, updateProfile);
router.post("/profile/avatar", protect, upload.single("avatar"), uploadAvatar);

module.exports = router;
