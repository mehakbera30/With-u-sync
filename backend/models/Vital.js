const mongoose = require("mongoose");

const vitalSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Patient ID is required"],
    },

    hemoglobin: {
      value: { type: Number, default: 13.8 },
      unit: { type: String, default: "g/dL" },
      status: { type: String, default: "Normal" },
    },

    bloodPressure: {
      systolic: { type: Number, default: 120 },
      diastolic: { type: Number, default: 80 },
      reading: { type: String, default: "120/80" },
      unit: { type: String, default: "mmHg" },
      status: { type: String, default: "Normal" },
    },

    bloodSugar: {
      value: { type: Number, default: 110 },
      unit: { type: String, default: "mg/dL" },
      status: { type: String, default: "Normal" },
    },

    heartRate: {
      value: { type: Number, default: 72 },
      unit: { type: String, default: "bpm" },
      status: { type: String, default: "Normal" },
    },

    temperature: {
      value: { type: Number, default: 98.4 },
      unit: { type: String, default: "°F" },
      status: { type: String, default: "Normal" },
    },

    oxygenSaturation: {
      value: { type: Number, default: null },
      unit: { type: String, default: "%" },
      status: { type: String, default: "Normal" },
    },

    weight: {
      value: { type: Number, default: null },
      unit: { type: String, default: "kg" },
    },

    height: {
      value: { type: Number, default: null },
      unit: { type: String, default: "cm" },
    },

    recordedAt: {
      type: Date,
      default: Date.now,
    },

    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Vital = mongoose.model("Vital", vitalSchema);

module.exports = Vital;