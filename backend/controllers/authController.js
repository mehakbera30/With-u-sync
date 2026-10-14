const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const PHONE_REGEX = /^\d{10}$/;

const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role = "patient",
      phone,
      gender,
      age,
      bloodGroup,
      specialization,
      qualifications,
      experience,
      clinicLocation,
      condition,
      allergies,
    } = req.body;

    const cleanName = String(name || "").trim();
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanPhone = String(phone || "").replace(/\D/g, "");

    if (!cleanName || !cleanEmail || !password || !cleanPhone) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password and phone number are required",
      });
    }

    if (cleanName.length < 2) {
      return res.status(400).json({ success: false, message: "Please enter a valid full name" });
    }

    if (!EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({ success: false, message: "Please provide a valid email address" });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    if (!PHONE_REGEX.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: "Phone number must contain exactly 10 digits",
      });
    }

    if (!["patient", "doctor"].includes(role)) {
      return res.status(403).json({
        success: false,
        message: "Admin accounts cannot be created through public registration",
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email: cleanEmail }, { phone: cleanPhone }],
    });

    if (existingUser && existingUser.phoneVerified !== false) {
      return res.status(400).json({
        success: false,
        message:
          existingUser.email === cleanEmail
            ? "An account with this email already exists"
            : "An account with this phone number already exists",
      });
    }

    let user;

    if (existingUser) {
      // Allow an incomplete/unverified registration to be safely retried.
      existingUser.name = cleanName;
      existingUser.email = cleanEmail;
      existingUser.password = password;
      existingUser.role = role;
      existingUser.phone = cleanPhone;
      existingUser.gender = gender || "";
      existingUser.age = age || null;
      existingUser.bloodGroup = bloodGroup || "";
      existingUser.phoneVerified = false;

      if (role === "doctor") {
        existingUser.specialization = specialization || "General Physician";
        existingUser.qualifications = qualifications || "MBBS";
        existingUser.experience = experience || 0;
        existingUser.clinicLocation = clinicLocation || "WithUSync Clinic";
      } else {
        existingUser.condition = condition || "";
        existingUser.allergies = allergies || "";
      }

      user = existingUser;
    } else {
      user = new User({
        name: cleanName,
        email: cleanEmail,
        password,
        role,
        phone: cleanPhone,
        gender: gender || "",
        age: age || null,
        bloodGroup: bloodGroup || "",
        notificationsEnabled: true,
        phoneVerified: false,
      });

      if (role === "doctor") {
        user.specialization = specialization || "General Physician";
        user.qualifications = qualifications || "MBBS";
        user.experience = experience || 0;
        user.clinicLocation = clinicLocation || "WithUSync Clinic";
      } else {
        user.condition = condition || "";
        user.allergies = allergies || "";
      }
    }

    user.phoneVerified = true;
    await user.save();

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please provide email and password" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    if (user.role === "admin" && process.env.ADMIN_EMAIL && user.email !== process.env.ADMIN_EMAIL.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: "This administrator account is not authorized.",
      });
    }

    const token = generateToken(user._id, user.role);
    res.json({ success: true, message: "Login successful", token, user });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "assignedDoctor",
      "name email specialization qualifications"
    );
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Please provide both current and new password" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ success: false, message: "Current password does not match" });
    }

    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ success: false, message: "Email and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    if (!user) {
      return res.status(404).json({ success: false, message: "No account found with this email" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: "Password reset successfully. You can now login with your new password." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updatePassword,
  forgotPassword,
};
