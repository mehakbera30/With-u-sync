const User = require("../models/User");
const Appointment = require("../models/Appointment");
const Prescription = require("../models/Prescription");
const Report = require("../models/Report");
const Vital = require("../models/Vital");
const { parseAppointmentDateTime } = require("../utils/dateUtils");

// @desc    Get Patient Dashboard Overview
// @route   GET /api/dashboard/patient
// @access  Private (Patient)
const getPatientDashboard = async (req, res, next) => {
  try {
    const patientId = req.user._id;

    // Upcoming appointments
    const patientAppointments = await Appointment.find({
      patient: patientId,
      status: { $in: ["Pending", "Confirmed"] },
    }).sort({ createdAt: -1 });

    const now = new Date();
    const upcomingAppointments = patientAppointments
      .filter((appointment) => {
        const dateTime = parseAppointmentDateTime(
          appointment.date,
          appointment.time
        );
        return dateTime && dateTime >= now;
      })
      .sort(
        (a, b) =>
          parseAppointmentDateTime(a.date, a.time) -
          parseAppointmentDateTime(b.date, b.time)
      )
      .slice(0, 5);

    // Active prescriptions
    const activePrescriptions = await Prescription.find({
      patient: patientId,
      status: "Active",
    })
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent reports
    const recentReports = await Report.find({
      patient: patientId,
    })
      .sort({ createdAt: -1 })
      .limit(5);

    // Latest vitals
    const latestVitals = await Vital.findOne({
      patient: patientId,
    })
      .populate("recordedBy", "name role")
      .sort({ recordedAt: -1 });

    res.json({
      success: true,

      stats: {
        totalAppointments: await Appointment.countDocuments({
          patient: patientId,
        }),

        upcomingAppointmentsCount: upcomingAppointments.length,

        activePrescriptionsCount: await Prescription.countDocuments({
          patient: patientId,
          status: "Active",
        }),

        totalReportsCount: await Report.countDocuments({
          patient: patientId,
        }),
      },

      upcomingAppointments,
      activePrescriptions,
      recentReports,

      // null when the patient has no recorded vitals
      vitals: latestVitals || null,
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Get Doctor Dashboard Overview
// @route   GET /api/dashboard/doctor
// @access  Private (Doctor)
const getDoctorDashboard = async (req, res, next) => {
  try {
    const doctorId = req.user._id;

    // Total patients assigned to this doctor
    const totalPatients = await User.countDocuments({
      role: "patient",
      assignedDoctor: doctorId,
    });

    // Appointment statistics
    const totalAppointments = await Appointment.countDocuments({
      doctor: doctorId,
    });

    const pendingAppointments = await Appointment.countDocuments({
      doctor: doctorId,
      status: "Pending",
    });

    const confirmedAppointments = await Appointment.countDocuments({
      doctor: doctorId,
      status: "Confirmed",
    });

    const completedAppointments = await Appointment.countDocuments({
      doctor: doctorId,
      status: "Completed",
    });

    // Pending reports belonging to this doctor
    const pendingReports = await Report.countDocuments({
      doctor: doctorId,
      status: "Pending Review",
    });

    // Doctor's upcoming appointments
    const doctorAppointments = await Appointment.find({
      doctor: doctorId,
      status: { $in: ["Pending", "Confirmed"] },
    })
      .populate(
        "patient",
        "name gender age condition phone bloodGroup"
      )
      .sort({ createdAt: -1 });

    const now = new Date();
    const todayAppointments = doctorAppointments
      .filter((appointment) => {
        const dateTime = parseAppointmentDateTime(
          appointment.date,
          appointment.time
        );
        return dateTime && dateTime >= now;
      })
      .sort(
        (a, b) =>
          parseAppointmentDateTime(a.date, a.time) -
          parseAppointmentDateTime(b.date, b.time)
      )
      .slice(0, 6);

    res.json({
      success: true,

      stats: {
        totalPatients,
        totalAppointments,
        pendingAppointments,
        confirmedAppointments,
        completedAppointments,
        pendingReports,
      },

      todayAppointments,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPatientDashboard,
  getDoctorDashboard,
};