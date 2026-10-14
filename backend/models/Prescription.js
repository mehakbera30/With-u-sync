const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    patientName: {
      type: String,
      required: true,
    },

    doctorName: {
      type: String,
      required: true,
    },

    date: {
      type: String,
      required: true,
    },

    diagnosis: {
      type: String,
      default: "",
    },

    medicines: [
      {
        medicine: {
          type: String,
          required: true,
        },

        dosage: {
          type: String,
          required: true,
        },

        frequency: {
          type: String,
          required: true,
        },

        duration: {
          type: String,
          required: true,
        },

        instructions: {
          type: String,
          default: "",
        },
      },
    ],

    status: {
      type: String,
      enum: ["Active", "Completed", "Discontinued"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Prescription", prescriptionSchema);