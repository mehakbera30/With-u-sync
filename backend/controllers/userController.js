const User = require("../models/User");

// @desc    Get all doctors
// @route   GET /api/users/doctors
// @access  Public
const getDoctors = async (req, res, next) => {
  try {
    const { search, specialization } = req.query;

    const query = { role: "doctor" };

    if (search || specialization) {
      query.$and = [];

      if (search) {
        query.$and.push({
          $or: [
            { name: new RegExp(search, "i") },
            { specialization: new RegExp(search, "i") },
          ],
        });
      }

      if (specialization) {
        query.$and.push({
          specialization: new RegExp(specialization, "i"),
        });
      }
    }

    const doctors = await User.find(query)
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

// @desc    Get doctor by ID
// @route   GET /api/users/doctors/:id
// @access  Public
const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await User.findOne({
      _id: req.params.id,
      role: "doctor",
    }).select("-password");

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    res.json({
      success: true,
      doctor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get patients
// Doctor sees only patients assigned to that doctor.
// Admin sees all patients.
// @route   GET /api/users/patients
// @access  Private (Doctor/Admin)
const getPatients = async (req, res, next) => {
  try {
    const { search } = req.query;

    const query = { role: "patient" };

    if (req.user.role === "doctor") {
      query.assignedDoctor = req.user._id;
    }

    if (search) {
      query.$or = [
        { name: new RegExp(search, "i") },
        { condition: new RegExp(search, "i") },
        { bloodGroup: new RegExp(search, "i") },
      ];
    }

    const patients = await User.find(query)
      .select("-password")
      .populate("assignedDoctor", "name email specialization")
      .sort({ name: 1 });

    res.json({
      success: true,
      count: patients.length,
      patients,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single patient
// @route   GET /api/users/patients/:id
// @access  Private
const getPatientById = async (req, res, next) => {
  try {
    const patient = await User.findOne({
      _id: req.params.id,
      role: "patient",
    })
      .select("-password")
      .populate("assignedDoctor", "name email specialization");

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    // Patient can see themselves.
    // Admin can see everyone.
    // Doctor can see only their assigned patients.
    if (
      req.user.role === "patient" &&
      patient._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this patient",
      });
    }

    if (
      req.user.role === "doctor" &&
      (!patient.assignedDoctor ||
        patient.assignedDoctor._id.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: "This patient is not assigned to you",
      });
    }

    res.json({
      success: true,
      patient,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Doctor updates assigned patient's clinical details
// @route   PUT /api/users/patients/:id
// @access  Private (Doctor/Admin)
const updatePatientDetails = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      gender,
      age,
      bloodGroup,
      address,
      condition,
      diagnosis,
      treatment,
      allergies,
      notes,
    } = req.body;

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

    if (name !== undefined) patient.name = String(name).trim();

    if (email !== undefined) {
      const normalizedEmail = String(email).toLowerCase().trim();

      const existingUser = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: patient._id },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email is already in use",
        });
      }

      patient.email = normalizedEmail;
    }

    if (phone !== undefined) patient.phone = phone;
    if (gender !== undefined) patient.gender = gender;
    if (age !== undefined) patient.age = age === "" ? null : age;
    if (bloodGroup !== undefined) patient.bloodGroup = bloodGroup;

    if (address !== undefined) {
      patient.address = {
        ...patient.address?.toObject?.(),
        ...address,
      };
    }

    if (condition !== undefined) patient.condition = condition;
    if (diagnosis !== undefined) patient.diagnosis = diagnosis;
    if (treatment !== undefined) patient.treatment = treatment;
    if (allergies !== undefined) patient.allergies = allergies;
    if (notes !== undefined) patient.notes = notes;

    const updatedPatient = await patient.save();

    res.json({
      success: true,
      message: "Patient details updated successfully",
      patient: updatedPatient,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user's profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const {
      name,
      email,
      phone,
      gender,
      age,
      bloodGroup,
      address,
      avatar,
      specialization,
      qualifications,
      experience,
      clinicLocation,
      about,
      emergencyContact,
      allergies,
      notificationsEnabled,
    } = req.body;

    if (name !== undefined) user.name = name;

    if (email !== undefined) {
      const normalizedEmail = email.toLowerCase().trim();

      const existingUser = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: user._id },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email is already in use",
        });
      }

      user.email = normalizedEmail;
    }

    if (phone !== undefined) user.phone = phone;
    if (gender !== undefined) user.gender = gender;
    if (age !== undefined) user.age = age;
    if (bloodGroup !== undefined) user.bloodGroup = bloodGroup;
    if (address !== undefined) {
      user.address = {
        ...user.address?.toObject?.(),
        ...address,
      };
    }
    if (avatar !== undefined) user.avatar = avatar;

    if (notificationsEnabled !== undefined) {
      user.notificationsEnabled = Boolean(notificationsEnabled);
    }

    if (user.role === "doctor") {
      if (specialization !== undefined) {
        user.specialization = specialization;
      }
      if (qualifications !== undefined) {
        user.qualifications = qualifications;
      }
      if (experience !== undefined) {
        user.experience = experience;
      }
      if (clinicLocation !== undefined) {
        user.clinicLocation = clinicLocation;
      }
      if (about !== undefined) {
        user.about = about;
      }
    }

    if (user.role === "patient") {
      if (emergencyContact !== undefined) {
        user.emergencyContact = {
          ...user.emergencyContact?.toObject?.(),
          ...emergencyContact,
        };
      }
      if (allergies !== undefined) user.allergies = allergies;
    }

    await user.save();

    const updatedUser = await User.findById(user._id).populate(
      "assignedDoctor",
      "name email specialization qualifications"
    );

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Upload current user's profile photo
// @route POST /api/users/profile/avatar
// @access Private
const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please select an image" });
    }

    const allowedPhotoTypes = ["image/jpeg", "image/jpg", "image/png"];

    if (!allowedPhotoTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Profile photo must be a JPG, JPEG or PNG image",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.avatar = `/uploads/${req.file.filename}`;
    await user.save();

    const updatedUser = await User.findById(user._id).populate(
      "assignedDoctor",
      "name email specialization qualifications"
    );

    res.json({
      success: true,
      message: "Profile photo updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDoctors,
  getDoctorById,
  getPatients,
  getPatientById,
  updatePatientDetails,
  updateProfile,
  uploadAvatar,
};
