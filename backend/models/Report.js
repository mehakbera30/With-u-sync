const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Patient ID is required"],
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    patientName: {
      type: String,
      default: "",
    },
    doctorName: {
      type: String,
      default: "",
    },
    name: {
      type: String,
      required: [true, "Report name is required"],
    },
    type: {
      type: String,
      required: [true, "Report type is required"],
      enum: ["Blood Test", "ECG", "X-Ray", "Health Checkup", "MRI", "Ultrasound", "Other"],
      default: "Blood Test",
    },
    date: {
      type: String,
      default: () => new Date().toISOString().split("T")[0],
    },
    status: {
      type: String,
      enum: ["Pending Review", "Reviewed", "Available"],
      default: "Pending Review",
    },
    findings: {
      type: String,
      default: "",
    },
    doctorNotes: {
      type: String,
      default: "",
    },
    fileUrl: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Report = mongoose.model("Report", reportSchema);

module.exports = Report;
