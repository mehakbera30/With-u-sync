const express = require("express");

const router = express.Router();

const {
  createReport,
  getReports,
  getReportById,
  reviewReport,
  deleteReport,
} = require("../controllers/reportController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");

router.use(protect);

router
  .route("/")
  .post(
    upload.single("reportFile"),
    createReport
  )
  .get(getReports);

router
  .route("/:id")
  .get(getReportById);

router.put(
  "/:id/review",
  authorize("doctor", "admin"),
  reviewReport
);

router.delete(
  "/:id",
  deleteReport
);

module.exports = router;