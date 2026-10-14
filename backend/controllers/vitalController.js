const Vital = require("../models/Vital");
const User = require("../models/User");
const Appointment = require("../models/Appointment");

const doctorCanAccessPatient = async (doctorId, patient) => {
  if (!patient) return false;
  if (patient.assignedDoctor?.toString() === doctorId.toString()) return true;

  const appointment = await Appointment.findOne({
    patient: patient._id,
    doctor: doctorId,
  });

  return Boolean(appointment);
};

const getPatientVitals = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const patient = await User.findOne({ _id: patientId, role: "patient" });

    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    if (req.user.role === "doctor" && !(await doctorCanAccessPatient(req.user._id, patient))) {
      return res.status(403).json({ success: false, message: "You are not authorized to view this patient's vitals" });
    }

    if (req.user.role === "patient" && patient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "You are not authorized to view these vitals" });
    }

    const vitals = await Vital.find({ patient: patientId })
      .populate("recordedBy", "name role")
      .sort({ recordedAt: -1, createdAt: -1 });

    res.json({ success: true, vitals });
  } catch (error) {
    next(error);
  }
};

const normalizeNumber = (value) => {
  if (value === "" || value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isNaN(number) ? null : number;
};

const createVital = async (req, res, next) => {
  try {
    const {
      patientId,
      hemoglobin,
      bloodPressure,
      bloodSugar,
      heartRate,
      temperature,
      oxygenSaturation,
      weight,
      height,
      notes,
    } = req.body;

    if (!patientId) {
      return res.status(400).json({ success: false, message: "Patient ID is required" });
    }

    const patient = await User.findOne({ _id: patientId, role: "patient" });
    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    if (req.user.role === "doctor" && !(await doctorCanAccessPatient(req.user._id, patient))) {
      return res.status(403).json({ success: false, message: "You are not authorized to record vitals for this patient" });
    }

    const vital = await Vital.create({
      patient: patientId,
      hemoglobin: { value: normalizeNumber(hemoglobin?.value ?? hemoglobin), unit: hemoglobin?.unit || "g/dL", status: hemoglobin?.status || "Normal" },
      bloodPressure: {
        systolic: normalizeNumber(bloodPressure?.systolic),
        diastolic: normalizeNumber(bloodPressure?.diastolic),
        reading: bloodPressure?.reading || (typeof bloodPressure === "string" ? bloodPressure : ""),
        unit: bloodPressure?.unit || "mmHg",
        status: bloodPressure?.status || "Normal",
      },
      bloodSugar: { value: normalizeNumber(bloodSugar?.value ?? bloodSugar), unit: bloodSugar?.unit || "mg/dL", status: bloodSugar?.status || "Normal" },
      heartRate: { value: normalizeNumber(heartRate?.value ?? heartRate), unit: heartRate?.unit || "bpm", status: heartRate?.status || "Normal" },
      temperature: { value: normalizeNumber(temperature?.value ?? temperature), unit: temperature?.unit || "°F", status: temperature?.status || "Normal" },
      oxygenSaturation: { value: normalizeNumber(oxygenSaturation?.value ?? oxygenSaturation), unit: oxygenSaturation?.unit || "%", status: oxygenSaturation?.status || "Normal" },
      weight: { value: normalizeNumber(weight?.value ?? weight), unit: weight?.unit || "kg" },
      height: { value: normalizeNumber(height?.value ?? height), unit: height?.unit || "cm" },
      recordedAt: new Date(),
      recordedBy: req.user._id,
      notes: notes || "",
    });

    await vital.populate("recordedBy", "name role");
    res.status(201).json({ success: true, message: "Vitals saved successfully", vital });
  } catch (error) {
    next(error);
  }
};

const updateVital = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vital = await Vital.findById(id);
    if (!vital) return res.status(404).json({ success: false, message: "Vital record not found" });

    const patient = await User.findOne({ _id: vital.patient, role: "patient" });
    if (!patient) return res.status(404).json({ success: false, message: "Patient not found" });

    if (req.user.role === "doctor" && !(await doctorCanAccessPatient(req.user._id, patient))) {
      return res.status(403).json({ success: false, message: "You are not authorized to update this patient's vitals" });
    }

    const fields = ["hemoglobin", "bloodSugar", "heartRate", "temperature", "oxygenSaturation"];
    const defaults = { hemoglobin: "g/dL", bloodSugar: "mg/dL", heartRate: "bpm", temperature: "°F", oxygenSaturation: "%" };
    for (const field of fields) {
      if (req.body[field] !== undefined) {
        const input = req.body[field];
        vital[field] = {
          value: normalizeNumber(input?.value ?? input),
          unit: input?.unit || defaults[field],
          status: input?.status || "Normal",
        };
      }
    }

    if (req.body.bloodPressure !== undefined) {
      const input = req.body.bloodPressure;
      vital.bloodPressure = {
        systolic: normalizeNumber(input?.systolic),
        diastolic: normalizeNumber(input?.diastolic),
        reading: input?.reading || (typeof input === "string" ? input : ""),
        unit: input?.unit || "mmHg",
        status: input?.status || "Normal",
      };
    }

    for (const field of ["weight", "height"]) {
      if (req.body[field] !== undefined) {
        const input = req.body[field];
        vital[field] = { value: normalizeNumber(input?.value ?? input), unit: input?.unit || (field === "weight" ? "kg" : "cm") };
      }
    }

    if (req.body.notes !== undefined) vital.notes = req.body.notes;
    vital.recordedAt = new Date();
    vital.recordedBy = req.user._id;
    await vital.save();
    await vital.populate("recordedBy", "name role");

    res.json({ success: true, message: "Vitals updated successfully", vital });
  } catch (error) {
    next(error);
  }
};

const deleteVital = async (req, res, next) => {
  try {
    const vital = await Vital.findById(req.params.id);
    if (!vital) return res.status(404).json({ success: false, message: "Vital record not found" });

    const patient = await User.findOne({ _id: vital.patient, role: "patient" });
    if (!patient) return res.status(404).json({ success: false, message: "Patient not found" });

    if (req.user.role === "doctor" && !(await doctorCanAccessPatient(req.user._id, patient))) {
      return res.status(403).json({ success: false, message: "You are not authorized to delete this patient's vitals" });
    }

    await vital.deleteOne();
    res.json({ success: true, message: "Vital record deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPatientVitals, createVital, updateVital, deleteVital };
