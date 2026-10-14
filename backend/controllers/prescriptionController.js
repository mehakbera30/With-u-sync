const Prescription = require("../models/Prescription");
const User = require("../models/User");
const createNotification = require("../utils/createNotification");

// Create a new prescription
const createPrescription = async (req, res, next) => {
  try {
    const {
      patientId,
      diagnosis,
      medicines,
      date,
      status = "Active",
    } = req.body;

    // Check required fields
    if (!patientId || !medicines || medicines.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Patient and at least one medicine are required",
      });
    }

    // Find patient
    const patient = await User.findById(patientId);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    if (
      req.user.role === "doctor" &&
      (!patient.assignedDoctor ||
        patient.assignedDoctor.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: "This patient is not assigned to you",
      });
    }

    // Doctor is the logged-in user
    const doctor = await User.findById(req.user._id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Create prescription
    const prescription = await Prescription.create({
      patient: patient._id,
      doctor: doctor._id,

      patientName: patient.name,
      doctorName: doctor.name,

      date: date || new Date().toISOString().split("T")[0],

      diagnosis: diagnosis || "",

      medicines,

      status,
    });

    // Create notification for patient
    await createNotification({
      userId: patient._id,
      title: "New Prescription",
      message: `Dr. ${doctor.name} has added a new prescription for you.`,
      type: "prescription",
      link: "/patient/prescriptions",
    });

    res.status(201).json({
      success: true,
      message: "Prescription created successfully",
      prescription,
    });
  } catch (error) {
    next(error);
  }
};


// Get prescriptions
const getPrescriptions = async (req, res, next) => {
  try {
    let filter = {};

    // Patient can see only their prescriptions
    if (req.user.role === "patient") {
      filter.patient = req.user._id;
    }

    // Doctor can see prescriptions created by them
    if (req.user.role === "doctor") {
      filter.doctor = req.user._id;
    }

    // Admin can see all prescriptions

    const prescriptions = await Prescription.find(filter)
      .populate("patient", "name email")
      .populate(
        "doctor",
        "name email specialization qualifications"
      )
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: prescriptions.length,
      prescriptions,
    });
  } catch (error) {
    next(error);
  }
};


// Get one complete prescription
const getPrescriptionById = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate("patient", "name email")
      .populate(
        "doctor",
        "name email specialization qualifications"
      );

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    // Patient can only view their own prescription
    if (
      req.user.role === "patient" &&
      prescription.patient._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this prescription",
      });
    }

    // Doctor can only view prescriptions created by them
    if (
      req.user.role === "doctor" &&
      prescription.doctor._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this prescription",
      });
    }

    res.json({
      success: true,
      prescription,
    });
  } catch (error) {
    next(error);
  }
};


// Update prescription status
const updatePrescriptionStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    // Only the doctor who created it can update it
    if (
      req.user.role === "doctor" &&
      prescription.doctor.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this prescription",
      });
    }

    prescription.status = status;

    await prescription.save();

    res.json({
      success: true,
      message: "Prescription status updated successfully",
      prescription,
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  createPrescription,
  getPrescriptions,
  getPrescriptionById,
  updatePrescriptionStatus,
};