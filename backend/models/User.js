const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        "Please provide a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: String,
      enum: ["patient", "doctor", "admin"],
      default: "patient",
    },
    assignedDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    notificationsEnabled: {
      type: Boolean,
      default: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    phoneOtpHash: {
      type: String,
      default: "",
      select: false,
    },
    phoneOtpExpiresAt: {
      type: Date,
      default: null,
      select: false,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", ""],
      default: "",
    },
    age: {
      type: Number,
      default: null,
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", ""],
      default: "",
    },
    avatar: {
      type: String,
      default: "",
    },
    address: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      zipCode: { type: String, default: "" },
    },

    // Doctor specific fields
    specialization: {
      type: String,
      default: "",
    },
    qualifications: {
      type: String,
      default: "",
    },
    experience: {
      type: Number,
      default: 0,
    },
    clinicLocation: {
      type: String,
      default: "WithUSync Clinic",
    },
    consultationFee: {
      type: Number,
      default: 500,
    },
    about: {
      type: String,
      default: "",
    },
    availableDays: {
      type: [String],
      default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    },
    availableHours: {
      start: { type: String, default: "09:00 AM" },
      end: { type: String, default: "05:00 PM" },
    },

    // Patient specific fields
    condition: {
      type: String,
      default: "",
    },
    diagnosis: {
      type: String,
      default: "",
    },
    treatment: {
      type: String,
      default: "",
    },
    allergies: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
    emergencyContact: {
      name: { type: String, default: "" },
      phone: { type: String, default: "" },
      relationship: { type: String, default: "" },
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.phoneOtpHash;
  delete obj.phoneOtpExpiresAt;
  return obj;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
