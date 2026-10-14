const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Patient ID is required"],
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Doctor ID is required"],
    },
    patientName: {
      type: String,
      default: "",
    },
    doctorName: {
      type: String,
      default: "",
    },
    specialization: {
      type: String,
      default: "General",
    },
    date: {
      type: String,
      required: [true, "Appointment date is required"],
    },
    time: {
      type: String,
      required: [true, "Appointment time is required"],
    },
    type: {
      type: String,
      default: "General Consultation",
    },
    location: {
      type: String,
      default: "WithUSync Clinic",
    },
    reason: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Completed", "Cancelled"],
      default: "Pending",
    },
    doctorNotes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);

module.exports = Appointment;
