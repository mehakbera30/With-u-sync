const Appointment = require("../models/Appointment");
const User = require("../models/User");
const createNotification = require("../utils/createNotification");
const { parseAppointmentDateTime } = require("../utils/dateUtils");

// @desc    Book a new appointment
// @route   POST /api/appointments
// @access  Private
const createAppointment = async (req, res, next) => {
  try {
    const {
      doctorId,
      doctorName,
      specialization,
      date,
      time,
      type = "General Consultation",
      location = "WithUSync Clinic",
      reason = "",
    } = req.body;

    if (!date || !time) {
      return res.status(400).json({
        success: false,
        message: "Please specify appointment date and time",
      });
    }

    const appointmentDateTime = parseAppointmentDateTime(date, time);

    if (!appointmentDateTime || Number.isNaN(appointmentDateTime.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid appointment date and time",
      });
    }

    if (appointmentDateTime < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Appointment date and time must be in the future",
      });
    }

    let doctor;

    if (doctorId) {
      doctor = await User.findOne({
        _id: doctorId,
        role: "doctor",
      });
    } else if (doctorName) {
      doctor = await User.findOne({
        name: doctorName,
        role: "doctor",
      });
    }

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found. Please select a valid doctor.",
      });
    }

    // A patient can be linked to one assigned doctor.
    // If the patient has no doctor yet, their first booked doctor becomes
    // their assigned doctor. Later bookings must use that assigned doctor.
    if (req.user.role === "patient") {
      const patient = await User.findById(req.user._id);

      if (
        patient.assignedDoctor &&
        patient.assignedDoctor.toString() !== doctor._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are already assigned to another doctor. Please contact the admin if you need to change your assigned doctor.",
        });
      }

      if (!patient.assignedDoctor) {
        patient.assignedDoctor = doctor._id;
        await patient.save();
      }
    }

    const appointment = await Appointment.create({
      patient: req.user._id,
      patientName: req.user.name,
      doctor: doctor._id,
      doctorName: doctor.name,
      specialization:
        specialization || doctor.specialization || "General",
      date,
      time,
      type,
      location,
      reason,
      status: "Pending",
    });

    // Create notification for doctor
    await createNotification({
      userId: doctor._id,
      title: "New Appointment Request",
      message: `${req.user.name} booked an appointment for ${date} at ${time}.`,
      type: "appointment",
      link: "/doctor/appointments",
    });

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      appointment,
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Get appointments for logged-in user
// @route   GET /api/appointments
// @access  Private
const getAppointments = async (req, res, next) => {
  try {
    let query = {};

    if (req.user.role === "patient") {
      query.patient = req.user._id;
    } else if (req.user.role === "doctor") {
      query.doctor = req.user._id;
    }

    const { status, date } = req.query;

    if (status) {
      query.status = status;
    }

    if (date) {
      query.date = date;
    }

    const appointments = await Appointment.find(query)
      .populate(
        "patient",
        "name email phone gender age bloodGroup condition"
      )
      .populate(
        "doctor",
        "name email phone specialization clinicLocation"
      )
      .sort({ createdAt: -1 });

    const now = new Date();
    const upcoming = [];
    const past = [];

    appointments.forEach((apt) => {
      const appointmentDateTime = parseAppointmentDateTime(apt.date, apt.time);

      if (
        apt.status === "Completed" ||
        apt.status === "Cancelled" ||
        (appointmentDateTime && appointmentDateTime < now)
      ) {
        past.push(apt);
      } else {
        upcoming.push(apt);
      }
    });

    const byDateTime = (a, b) => {
      const aDate = parseAppointmentDateTime(a.date, a.time)?.getTime() ?? 0;
      const bDate = parseAppointmentDateTime(b.date, b.time)?.getTime() ?? 0;
      return aDate - bDate;
    };

    upcoming.sort(byDateTime);
    past.sort((a, b) => byDateTime(b, a));

    res.json({
      success: true,
      count: appointments.length,
      appointments,
      upcoming,
      past,
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Get single appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate(
        "patient",
        "name email phone gender age bloodGroup condition allergies"
      )
      .populate(
        "doctor",
        "name email phone specialization clinicLocation qualifications"
      );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (
      req.user.role === "patient" &&
      appointment.patient._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this appointment",
      });
    }

    if (
      req.user.role === "doctor" &&
      appointment.doctor._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this appointment",
      });
    }

    res.json({
      success: true,
      appointment,
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Update appointment status
// @route   PATCH /api/appointments/:id/status
// @access  Private
const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status, doctorNotes } = req.body;

    const validStatuses = [
      "Pending",
      "Confirmed",
      "Completed",
      "Cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Only the assigned doctor can change appointment status.
    if (
      req.user.role !== "doctor" ||
      appointment.doctor.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Only the assigned doctor can update appointment status",
      });
    }

    appointment.status = status;

    if (doctorNotes !== undefined) {
      appointment.doctorNotes = doctorNotes;
    }

    await appointment.save();

    // Notify the other party
    const targetUserId =
      req.user.role === "doctor"
        ? appointment.patient
        : appointment.doctor;

    await createNotification({
      userId: targetUserId,
      title: `Appointment ${status}`,
      message: `Your appointment for ${appointment.date} at ${appointment.time} has been marked as ${status}.`,
      type: "appointment",
      link:
        req.user.role === "doctor"
          ? "/patient/appointments"
          : "/doctor/appointments",
    });

    res.json({
      success: true,
      message: `Appointment status updated to ${status}`,
      appointment,
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Cancel appointment
// @route   DELETE /api/appointments/:id
// @access  Private
const cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    const isPatient =
      req.user.role === "patient" &&
      appointment.patient.toString() === req.user._id.toString();

    const isDoctor =
      req.user.role === "doctor" &&
      appointment.doctor.toString() === req.user._id.toString();

    if (!isPatient && !isDoctor) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to cancel this appointment",
      });
    }

    if (appointment.status === "Completed") {
      return res.status(400).json({
        success: false,
        message: "Completed appointments cannot be cancelled",
      });
    }

    if (appointment.status === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "Appointment is already cancelled",
      });
    }

    appointment.status = "Cancelled";
    await appointment.save();

    const targetUserId = isPatient
      ? appointment.doctor
      : appointment.patient;

    await createNotification({
      userId: targetUserId,
      title: "Appointment Cancelled",
      message: `${req.user.name} cancelled the appointment scheduled for ${appointment.date} at ${appointment.time}.`,
      type: "appointment",
      link: isPatient ? "/doctor/appointments" : "/patient/appointments",
    });

    res.json({
      success: true,
      message: "Appointment cancelled successfully",
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
};