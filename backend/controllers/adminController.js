const User = require("../models/User");
const Appointment = require("../models/Appointment");
const createNotification = require("../utils/createNotification");

// @desc    Admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Private Admin
const getStats = async (req, res, next) => {
  try {
    const [
      doctors,
      patients,
      unassignedPatients,
      appointments,
      pendingAppointments,
    ] = await Promise.all([
      User.countDocuments({ role: "doctor" }),
      User.countDocuments({ role: "patient" }),
      User.countDocuments({
        role: "patient",
        assignedDoctor: null,
      }),
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: "Pending" }),
    ]);

    res.json({
      success: true,
      stats: {
        doctors,
        patients,
        unassignedPatients,
        appointments,
        pendingAppointments,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all doctors for admin
// @route   GET /api/admin/doctors
const getDoctors = async (req, res, next) => {
  try {
    const doctors = await User.find({ role: "doctor" })
      .select("-password")
      .sort({ name: 1 });

    res.json({
      success: true,
      count: doctors.length,
      doctors,
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Create a doctor account
// @route   POST /api/admin/doctors
// @access  Private Admin
const createDoctor = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password = "password123",
      phone = "",
      gender = "",
      specialization = "General Physician",
      qualifications = "MBBS",
      experience = 0,
      clinicLocation = "WithUSync Clinic",
      consultationFee = 500,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "A user with this email already exists",
      });
    }

    const doctor = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: "doctor",
      phone,
      gender,
      specialization: specialization || "General Physician",
      qualifications: qualifications || "MBBS",
      experience: experience === "" ? 0 : Number(experience),
      clinicLocation: clinicLocation || "WithUSync Clinic",
      consultationFee: consultationFee === "" ? 500 : Number(consultationFee),
      notificationsEnabled: true,
    });

    res.status(201).json({
      success: true,
      message: "Doctor account created successfully",
      doctor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all patients for admin
// @route   GET /api/admin/patients
const getPatients = async (req, res, next) => {
  try {
    const patients = await User.find({ role: "patient" })
      .select("-password")
      .populate("assignedDoctor", "name email specialization")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: patients.length,
      patients,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a patient and assign a doctor
// @route   POST /api/admin/patients
const createPatient = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password = "password123",
      phone = "",
      gender = "",
      age = null,
      bloodGroup = "",
      assignedDoctor,
    } = req.body;

    if (!name || !email || !assignedDoctor) {
      return res.status(400).json({
        success: false,
        message: "Name, email and assigned doctor are required",
      });
    }

    const doctor = await User.findOne({
      _id: assignedDoctor,
      role: "doctor",
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Assigned doctor not found",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "A user with this email already exists",
      });
    }

    const patient = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password,
      role: "patient",
      phone,
      gender,
      age: age === "" ? null : age,
      bloodGroup,
      assignedDoctor: doctor._id,
    });

    await createNotification({
      userId: doctor._id,
      title: "New Patient Assigned",
      message: `${patient.name} has been assigned to you by the admin.`,
      type: "system",
      link: "/doctor/patients",
    });

    await createNotification({
      userId: patient._id,
      title: "Doctor Assigned",
      message: `${doctor.name} is now your assigned WithUSync doctor.`,
      type: "system",
      link: "/patient/appointments",
    });

    res.status(201).json({
      success: true,
      message: "Patient created and assigned successfully",
      patient,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign/reassign a patient to a doctor
// @route   PUT /api/admin/patients/:id/assign
const assignPatient = async (req, res, next) => {
  try {
    const { doctorId } = req.body;

    const patient = await User.findOne({
      _id: req.params.id,
      role: "patient",
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    let doctor = null;

    if (doctorId) {
      doctor = await User.findOne({
        _id: doctorId,
        role: "doctor",
      });

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: "Doctor not found",
        });
      }
    }

    const previousDoctorId = patient.assignedDoctor
      ? patient.assignedDoctor.toString()
      : null;

    if (
      previousDoctorId &&
      (!doctor || previousDoctorId !== doctor._id.toString())
    ) {
      const activeAppointments = await Appointment.find({
        patient: patient._id,
        doctor: previousDoctorId,
        status: { $in: ["Pending", "Confirmed"] },
      });

      if (activeAppointments.length > 0) {
        await Appointment.updateMany(
          {
            patient: patient._id,
            doctor: previousDoctorId,
            status: { $in: ["Pending", "Confirmed"] },
          },
          { $set: { status: "Cancelled" } }
        );

        await createNotification({
          userId: patient._id,
          title: "Appointment Cancelled",
          message: `Your active appointment${activeAppointments.length > 1 ? "s" : ""} with the previous doctor ${activeAppointments.length > 1 ? "were" : "was"} cancelled because your doctor assignment changed.`,
          type: "appointment",
          link: "/patient/appointments",
        });

        await createNotification({
          userId: previousDoctorId,
          title: "Patient Assignment Changed",
          message: `${patient.name} was reassigned by the admin and active appointment${activeAppointments.length > 1 ? "s" : ""} were cancelled.`,
          type: "appointment",
          link: "/doctor/appointments",
        });
      }
    }

    patient.assignedDoctor = doctor ? doctor._id : null;
    await patient.save();

    if (
      previousDoctorId &&
      (!doctor || previousDoctorId !== doctor._id.toString())
    ) {
      await createNotification({
        userId: previousDoctorId,
        title: "Patient Assignment Updated",
        message: `${patient.name} is no longer assigned to you.`,
        type: "system",
        link: "/doctor/patients",
      });
    }

    if (doctor) {
      await createNotification({
        userId: doctor._id,
        title: "Patient Assigned",
        message: `${patient.name} has been assigned to you by the admin.`,
        type: "system",
        link: "/doctor/patients",
      });

      await createNotification({
        userId: patient._id,
        title: "Doctor Assigned",
        message: `${doctor.name} is now your assigned WithUSync doctor.`,
        type: "system",
        link: "/patient/appointments",
      });
    }

    const updatedPatient = await User.findById(patient._id)
      .select("-password")
      .populate("assignedDoctor", "name email specialization");

    res.json({
      success: true,
      message: doctor
        ? "Patient assigned successfully"
        : "Patient unassigned successfully",
      patient: updatedPatient,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Delete a doctor account
// @route DELETE /api/admin/doctors/:id
const deleteDoctor = async (req, res, next) => {
  try {
    const doctor = await User.findOne({ _id: req.params.id, role: "doctor" });
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    const affectedPatients = await User.find({
      role: "patient",
      assignedDoctor: doctor._id,
    }).select("_id name");

    await User.updateMany(
      { role: "patient", assignedDoctor: doctor._id },
      { $set: { assignedDoctor: null } }
    );

    await Appointment.updateMany(
      {
        doctor: doctor._id,
        status: { $in: ["Pending", "Confirmed"] },
      },
      { $set: { status: "Cancelled" } }
    );

    for (const patient of affectedPatients) {
      await createNotification({
        userId: patient._id,
        title: "Doctor Removed",
        message: `${doctor.name} is no longer available on WithUSync. Please contact the admin to choose another doctor.`,
        type: "system",
        link: "/patient/appointments",
      });
    }

    await User.findByIdAndDelete(doctor._id);

    res.json({ success: true, message: "Doctor removed successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc Delete a patient account
// @route DELETE /api/admin/patients/:id
const deletePatient = async (req, res, next) => {
  try {
    const patient = await User.findOne({ _id: req.params.id, role: "patient" });
    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    await Appointment.updateMany(
      {
        patient: patient._id,
        status: { $in: ["Pending", "Confirmed"] },
      },
      { $set: { status: "Cancelled" } }
    );

    if (patient.assignedDoctor) {
      await createNotification({
        userId: patient.assignedDoctor,
        title: "Patient Removed",
        message: `${patient.name} has been removed from WithUSync by the admin.`,
        type: "system",
        link: "/doctor/patients",
      });
    }

    await User.findByIdAndDelete(patient._id);
    res.json({ success: true, message: "Patient removed successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all appointments for admin
// @route   GET /api/admin/appointments
const getAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find()
      .populate("patient", "name email")
      .populate("doctor", "name email specialization")
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
  getDoctors,
  createDoctor,
  deleteDoctor,
  getPatients,
  createPatient,
  deletePatient,
  assignPatient,
  getAppointments,
};
