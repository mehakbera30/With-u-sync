const Report = require("../models/Report");
const User = require("../models/User");
const createNotification = require("../utils/createNotification");

// ============================================================
// CREATE REPORT
// ============================================================

const createReport = async (req, res, next) => {
  try {
    const {
      patientId,
      doctorId,
      name,
      type,
      date,
      findings = "",
      doctorNotes = "",
    } = req.body;

    // Uploaded file URL
    const fileUrl = req.file
      ? `/uploads/${req.file.filename}`
      : "";

    // Required fields
    if (!name || !type) {
      return res.status(400).json({
        success: false,
        message: "Please provide report name and type",
      });
    }

    // ==========================================================
    // FIND PATIENT
    // ==========================================================

    let targetPatientId;

    // Patient uploading their own report
    if (req.user.role === "patient") {
      targetPatientId = req.user._id;
    }

    // Doctor uploading report for a patient
    else if (req.user.role === "doctor") {
      targetPatientId = patientId;
    }

    if (!targetPatientId) {
      return res.status(400).json({
        success: false,
        message: "Patient ID is required",
      });
    }

    const patient = await User.findById(targetPatientId);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    // ==========================================================
    // DOCTOR UPLOAD VALIDATION
    // ==========================================================

    if (req.user.role === "doctor") {
      if (
        !patient.assignedDoctor ||
        patient.assignedDoctor.toString() !==
          req.user._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "This patient is not assigned to you",
        });
      }
    }

    // ==========================================================
    // FIND ASSIGNED DOCTOR
    // ==========================================================

    let assignedDoctorId = null;
    let doctorName = "";

    // ----------------------------------------------------------
    // DOCTOR UPLOADS REPORT
    // ----------------------------------------------------------

    if (req.user.role === "doctor") {
      assignedDoctorId = req.user._id;
      doctorName = req.user.name;
    }

    // ----------------------------------------------------------
    // PATIENT UPLOADS REPORT
    // ----------------------------------------------------------

    else if (req.user.role === "patient") {

      /*
        IMPORTANT FIX:

        The patient page does not need to send doctorId.

        We automatically take the patient's assigned doctor.
      */

      if (patient.assignedDoctor) {

        const doctor = await User.findOne({
          _id: patient.assignedDoctor,
          role: "doctor",
        });

        if (doctor) {
          assignedDoctorId = doctor._id;
          doctorName = doctor.name;
        }
      }

      // If doctorId was manually provided, use it only
      // when it matches the patient's assigned doctor.
      if (doctorId) {

        const doctor = await User.findOne({
          _id: doctorId,
          role: "doctor",
        });

        if (!doctor) {
          return res.status(404).json({
            success: false,
            message: "Doctor not found",
          });
        }

        if (
          !patient.assignedDoctor ||
          patient.assignedDoctor.toString() !==
            doctor._id.toString()
        ) {
          return res.status(403).json({
            success: false,
            message: "Please select your assigned doctor",
          });
        }

        assignedDoctorId = doctor._id;
        doctorName = doctor.name;
      }
    }

    // ==========================================================
    // CREATE REPORT
    // ==========================================================

    const report = await Report.create({
      patient: targetPatientId,
      patientName: patient.name,

      doctor: assignedDoctorId,
      doctorName: doctorName,

      name,
      type,

      date:
        date ||
        new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),

      status:
        req.user.role === "doctor" && findings
          ? "Reviewed"
          : "Pending Review",

      findings,
      doctorNotes,
      fileUrl,
    });

    // ==========================================================
    // NOTIFY DOCTOR
    // ==========================================================

    if (
      req.user.role === "patient" &&
      assignedDoctorId
    ) {
      await createNotification({
        userId: assignedDoctorId,
        title: "New Patient Report",
        message: `${patient.name} uploaded a new ${type} report for review.`,
        type: "report",
        link: "/doctor/reports",
      });
    }

    // ==========================================================
    // NOTIFY PATIENT
    // ==========================================================

    if (req.user.role === "doctor") {
      await createNotification({
        userId: targetPatientId,
        title: "New Medical Report",
        message: `${req.user.name} uploaded a new ${type} report for you.`,
        type: "report",
        link: "/patient/reports",
      });
    }

    // ==========================================================
    // RESPONSE
    // ==========================================================

    res.status(201).json({
      success: true,
      message: "Report uploaded successfully",
      report,
    });

  } catch (error) {
    next(error);
  }
};


// ============================================================
// GET REPORTS
// ============================================================

const getReports = async (req, res, next) => {
  try {

    const {
      patientId,
      type,
      status,
      search,
    } = req.query;

    let query = {};

    // ==========================================================
    // PATIENT
    // ==========================================================

    if (req.user.role === "patient") {

      query.patient = req.user._id;
    }

    // ==========================================================
    // DOCTOR
    // ==========================================================

    else if (req.user.role === "doctor") {

      /*
        IMPORTANT FIX:

        Doctor should see:

        1. Reports directly assigned to doctor
        OR
        2. Reports belonging to patients assigned to doctor

        This also makes OLD patient-uploaded reports visible.
      */

      const assignedPatients = await User.find({
        role: "patient",
        assignedDoctor: req.user._id,
      }).select("_id");

      const assignedPatientIds =
        assignedPatients.map(
          (patient) => patient._id
        );

      // --------------------------------------------------------
      // Particular patient selected
      // --------------------------------------------------------

      if (patientId) {

        const assignedPatient = await User.findOne({
          _id: patientId,
          role: "patient",
          assignedDoctor: req.user._id,
        });

        if (!assignedPatient) {
          return res.status(403).json({
            success: false,
            message: "This patient is not assigned to you",
          });
        }

        query.patient = patientId;
      }

      // --------------------------------------------------------
      // All doctor's reports
      // --------------------------------------------------------

      else {

        query.$or = [
          {
            doctor: req.user._id,
          },
          {
            patient: {
              $in: assignedPatientIds,
            },
          },
        ];
      }
    }

    // ==========================================================
    // TYPE FILTER
    // ==========================================================

    if (type) {
      query.type = type;
    }

    // ==========================================================
    // STATUS FILTER
    // ==========================================================

    if (status) {
      query.status = status;
    }

    // ==========================================================
    // SEARCH FILTER
    // ==========================================================

    if (search) {

      const searchCondition = {
        $or: [
          {
            name: new RegExp(search, "i"),
          },
          {
            patientName: new RegExp(search, "i"),
          },
          {
            type: new RegExp(search, "i"),
          },
        ],
      };

      /*
        If doctor already has an $or for assigned reports,
        combine both conditions using $and.
      */

      if (query.$or) {

        const doctorReportCondition = {
          $or: query.$or,
        };

        delete query.$or;

        query.$and = [
          doctorReportCondition,
          searchCondition,
        ];

      } else {

        query.$or = searchCondition.$or;
      }
    }

    // ==========================================================
    // FETCH REPORTS
    // ==========================================================

    const reports = await Report.find(query)
      .populate(
        "patient",
        "name email phone gender age bloodGroup"
      )
      .populate(
        "doctor",
        "name specialization"
      )
      .sort({
        createdAt: -1,
      });

    res.json({
      success: true,
      count: reports.length,
      reports,
    });

  } catch (error) {
    next(error);
  }
};


// ============================================================
// GET SINGLE REPORT
// ============================================================

const getReportById = async (req, res, next) => {
  try {

    const report = await Report.findById(req.params.id)
      .populate(
        "patient",
        "name email phone gender age bloodGroup allergies"
      )
      .populate(
        "doctor",
        "name specialization"
      );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    // ==========================================================
    // PATIENT ACCESS
    // ==========================================================

    if (
      req.user.role === "patient" &&
      report.patient._id.toString() !==
        req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this report",
      });
    }

    // ==========================================================
    // DOCTOR ACCESS
    // ==========================================================

    if (req.user.role === "doctor") {

      const assignedPatient = await User.findOne({
        _id: report.patient._id,
        role: "patient",
        assignedDoctor: req.user._id,
      });

      if (!assignedPatient) {
        return res.status(403).json({
          success: false,
          message: "This patient is not assigned to you",
        });
      }
    }

    res.json({
      success: true,
      report,
    });

  } catch (error) {
    next(error);
  }
};


// ============================================================
// DOCTOR REVIEW REPORT
// ============================================================

const reviewReport = async (req, res, next) => {
  try {

    const {
      findings,
      doctorNotes,
      status = "Reviewed",
    } = req.body;

    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    // ==========================================================
    // CHECK ASSIGNED PATIENT
    // ==========================================================

    if (req.user.role === "doctor") {

      const assignedPatient = await User.findOne({
        _id: report.patient,
        role: "patient",
        assignedDoctor: req.user._id,
      });

      if (!assignedPatient) {
        return res.status(403).json({
          success: false,
          message: "This patient is not assigned to you",
        });
      }
    }

    // ==========================================================
    // CHECK EXISTING DOCTOR
    // ==========================================================

    if (
      report.doctor &&
      report.doctor.toString() !==
        req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "This report is assigned to another doctor",
      });
    }

    // ==========================================================
    // ASSIGN DOCTOR
    // ==========================================================

    report.doctor = req.user._id;
    report.doctorName = req.user.name;

    // ==========================================================
    // UPDATE FINDINGS
    // ==========================================================

    if (findings !== undefined) {
      report.findings = findings;
    }

    // ==========================================================
    // UPDATE NOTES
    // ==========================================================

    if (doctorNotes !== undefined) {
      report.doctorNotes = doctorNotes;
    }

    // ==========================================================
    // UPDATE STATUS
    // ==========================================================

    report.status = status;

    await report.save();

    // ==========================================================
    // NOTIFY PATIENT
    // ==========================================================

    await createNotification({
      userId: report.patient,
      title: "Report Reviewed",
      message: `${req.user.name} reviewed your ${report.name}.`,
      type: "report",
      link: "/patient/reports",
    });

    res.json({
      success: true,
      message: "Report review saved successfully",
      report,
    });

  } catch (error) {
    next(error);
  }
};


// ============================================================
// DELETE REPORT
// ============================================================

const deleteReport = async (req, res, next) => {
  try {

    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    // ==========================================================
    // PATIENT DELETE
    // ==========================================================

    if (
      req.user.role === "patient" &&
      report.patient.toString() !==
        req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to remove this report",
      });
    }

    // ==========================================================
    // DOCTOR DELETE
    // ==========================================================

    if (
      req.user.role === "doctor" &&
      report.doctor &&
      report.doctor.toString() !==
        req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to remove this report",
      });
    }

    await report.deleteOne();

    res.json({
      success: true,
      message: "Report removed successfully",
    });

  } catch (error) {
    next(error);
  }
};


// ============================================================
// EXPORT
// ============================================================

module.exports = {
  createReport,
  getReports,
  getReportById,
  reviewReport,
  deleteReport,
};