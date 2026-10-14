
import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  UserRound,
  HeartPulse,
  FileText,
  Edit3,
  Save,
  Eye,
  Activity,
  Droplets,
  Thermometer,
  Heart,
  X,
  Pill,
  Plus,
  Trash2,
  CalendarDays,
} from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";
import DoctorSidebar from "../components/DoctorSidebar";
import NotificationBell from "../components/NotificationBell";
import ProfileMenu from "../components/ProfileMenu";
import api from "../services/api";


// ======================================================
// ADDRESS HELPERS
// ======================================================

const emptyAddress = {
  street: "",
  city: "",
  state: "",
  zipCode: "",
};


// Convert backend address into an object
const normalizeAddress = (address) => {
  if (!address) {
    return { ...emptyAddress };
  }

  // If backend somehow returns a string
  if (typeof address === "string") {
    return {
      street: address,
      city: "",
      state: "",
      zipCode: "",
    };
  }

  return {
    street: address.street || "",
    city: address.city || "",
    state: address.state || "",
    zipCode: address.zipCode || "",
  };
};


// Convert address object into readable text
const formatAddress = (address) => {
  const normalized = normalizeAddress(address);

  return [
    normalized.street,
    normalized.city,
    normalized.state,
    normalized.zipCode,
  ]
    .filter(Boolean)
    .join(", ");
};


// ======================================================
// COMPONENT
// ======================================================

const PatientDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();


  // ======================================================
  // MAIN STATES
  // ======================================================

  const [patient, setPatient] = useState(null);
  const [reports, setReports] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingPatient, setEditingPatient] = useState(false);


  // ======================================================
  // PATIENT FORM
  // ======================================================

  const [patientForm, setPatientForm] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    age: "",
    bloodGroup: "",
    address: { ...emptyAddress },
  });


  // ======================================================
  // VITALS MODAL
  // ======================================================

  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [editingVitalId, setEditingVitalId] = useState(null);

  const [vitalsForm, setVitalsForm] = useState({
    hemoglobin: "",
    bloodPressure: "",
    heartRate: "",
    temperature: "",
    bloodSugar: "",
    oxygenSaturation: "",
    weight: "",
    height: "",
    notes: "",
  });


  // ======================================================
  // PRESCRIPTION MODAL
  // ======================================================

  const [showPrescriptionModal, setShowPrescriptionModal] =
    useState(false);

  const [prescriptionForm, setPrescriptionForm] = useState({
    diagnosis: "",
    date: new Date().toISOString().split("T")[0],
  });


  // Medicines array
  const [medicines, setMedicines] = useState([]);


  // Temporary medicine form
  const [medicineForm, setMedicineForm] = useState({
    medicine: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
  });


  // ======================================================
  // LOAD PATIENT DATA
  // ======================================================

  const loadPatientData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        patientRes,
        reportsRes,
        vitalsRes,
        prescriptionsRes,
      ] = await Promise.all([
        api.users.getPatientById(id),
        api.reports.getAll({ patientId: id }),
        api.vitals.getPatient(id),
        api.prescriptions.getAll({ patientId: id }),
      ]);


      // ==================================================
      // PATIENT
      // ==================================================

      const patientData =
        patientRes?.patient ||
        patientRes?.user ||
        patientRes?.data ||
        patientRes;

      setPatient(patientData);

      setPatientForm({
        name: patientData?.name || "",
        email: patientData?.email || "",
        phone: patientData?.phone || "",
        gender: patientData?.gender || "",
        age: patientData?.age || "",
        bloodGroup: patientData?.bloodGroup || "",
        address: normalizeAddress(patientData?.address),
      });


      // ==================================================
      // REPORTS
      // ==================================================

      const reportsData =
        reportsRes?.reports ||
        reportsRes?.data ||
        [];

      setReports(Array.isArray(reportsData) ? reportsData : []);


      // ==================================================
      // VITALS
      // ==================================================

      const vitalsData =
        vitalsRes?.vitals ||
        vitalsRes?.data ||
        [];

      setVitals(Array.isArray(vitalsData) ? vitalsData : []);


      // ==================================================
      // PRESCRIPTIONS
      // ==================================================

      const prescriptionsData =
        prescriptionsRes?.prescriptions ||
        prescriptionsRes?.data ||
        [];

      setPrescriptions(
        Array.isArray(prescriptionsData)
          ? prescriptionsData
          : []
      );

    } catch (err) {
      console.error("Error loading patient:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load patient details."
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (id) {
      loadPatientData();
    }
  }, [id]);


  // ======================================================
  // PATIENT FORM CHANGE
  // ======================================================

  const handlePatientChange = (e) => {
    const { name, value } = e.target;

    setPatientForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  // Address change
  const handleAddressChange = (field, value) => {
    setPatientForm((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }));
  };


  // ======================================================
  // SAVE PATIENT DETAILS
  // ======================================================

  const savePatientDetails = async () => {
    try {
      setError("");

      const response =
        await api.users.updatePatientDetails(
          id,
          patientForm
        );

      const updatedPatient =
        response?.patient ||
        response?.user ||
        response?.data ||
        response;

      setPatient(updatedPatient);

      setPatientForm({
        name: updatedPatient?.name || "",
        email: updatedPatient?.email || "",
        phone: updatedPatient?.phone || "",
        gender: updatedPatient?.gender || "",
        age: updatedPatient?.age || "",
        bloodGroup: updatedPatient?.bloodGroup || "",
        address: normalizeAddress(
          updatedPatient?.address
        ),
      });

      setEditingPatient(false);

    } catch (err) {
      console.error("Error updating patient:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update patient details."
      );
    }
  };


  // ======================================================
  // VITALS FORM CHANGE
  // ======================================================

  const handleVitalsChange = (e) => {
    const { name, value } = e.target;

    setVitalsForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  // ======================================================
  // ADD / EDIT / DELETE VITALS
  // ======================================================

  const resetVitalsForm = () => {
    setVitalsForm({
      hemoglobin: "",
      bloodPressure: "",
      heartRate: "",
      temperature: "",
      bloodSugar: "",
      oxygenSaturation: "",
      weight: "",
      height: "",
      notes: "",
    });
    setEditingVitalId(null);
  };

  const openAddVitals = () => {
    resetVitalsForm();
    setShowVitalsModal(true);
  };

  const openEditVital = (vital) => {
    setEditingVitalId(vital._id);
    setVitalsForm({
      hemoglobin: vital.hemoglobin?.value ?? "",
      bloodPressure: vital.bloodPressure?.reading ?? "",
      heartRate: vital.heartRate?.value ?? "",
      temperature: vital.temperature?.value ?? "",
      bloodSugar: vital.bloodSugar?.value ?? "",
      oxygenSaturation: vital.oxygenSaturation?.value ?? "",
      weight: vital.weight?.value ?? "",
      height: vital.height?.value ?? "",
      notes: vital.notes || "",
    });
    setShowVitalsModal(true);
  };

  const saveVitals = async (e) => {
    e.preventDefault();

    try {
      setError("");

      const payload = {
        patientId: id,
        hemoglobin: vitalsForm.hemoglobin,
        bloodPressure: vitalsForm.bloodPressure,
        heartRate: vitalsForm.heartRate,
        temperature: vitalsForm.temperature,
        bloodSugar: vitalsForm.bloodSugar,
        oxygenSaturation: vitalsForm.oxygenSaturation,
        weight: vitalsForm.weight,
        height: vitalsForm.height,
        notes: vitalsForm.notes,
      };

      if (editingVitalId) {
        await api.vitals.update(editingVitalId, payload);
      } else {
        await api.vitals.record(payload);
      }

      setShowVitalsModal(false);
      resetVitalsForm();
      await loadPatientData();
    } catch (err) {
      console.error("Error saving vitals:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to save vitals."
      );
    }
  };

  const deleteVital = async (vitalId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this vital record?"
    );
    if (!confirmed) return;

    try {
      await api.vitals.remove(vitalId);
      await loadPatientData();
    } catch (err) {
      console.error("Error deleting vital:", err);
      setError(err?.message || "Failed to delete vital record.");
    }
  };

  // ======================================================
  // MEDICINE FORM CHANGE
  // ======================================================

  const handleMedicineChange = (e) => {
    const { name, value } = e.target;

    setMedicineForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  // ======================================================
  // ADD MEDICINE TO LIST
  // ======================================================

  const addMedicine = () => {
    if (
      !medicineForm.medicine ||
      !medicineForm.dosage ||
      !medicineForm.frequency ||
      !medicineForm.duration
    ) {
      setError(
        "Medicine, dosage, frequency and duration are required."
      );

      return;
    }

    setMedicines((prev) => [
      ...prev,
      {
        medicine: medicineForm.medicine,
        dosage: medicineForm.dosage,
        frequency: medicineForm.frequency,
        duration: medicineForm.duration,
        instructions: medicineForm.instructions,
      },
    ]);

    setMedicineForm({
      medicine: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: "",
    });

    setError("");
  };


  // ======================================================
  // REMOVE MEDICINE
  // ======================================================

  const removeMedicine = (index) => {
    setMedicines((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };


  // ======================================================
  // PRESCRIPTION FORM CHANGE
  // ======================================================

  const handlePrescriptionChange = (e) => {
    const { name, value } = e.target;

    setPrescriptionForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  // ======================================================
  // CREATE PRESCRIPTION
  // ======================================================

  const createPrescription = async (e) => {
    e.preventDefault();

    if (medicines.length === 0) {
      setError(
        "Please add at least one medicine."
      );

      return;
    }

    try {
      setError("");

      await api.prescriptions.create({
        patientId: id,

        diagnosis:
          prescriptionForm.diagnosis,

        date:
          prescriptionForm.date,

        status: "Active",

        medicines: medicines,
      });


      // Close modal
      setShowPrescriptionModal(false);


      // Reset prescription form
      setPrescriptionForm({
        diagnosis: "",
        date: new Date()
          .toISOString()
          .split("T")[0],
      });


      setMedicines([]);

      setMedicineForm({
        medicine: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
      });


      // Reload data
      await loadPatientData();

    } catch (err) {
      console.error(
        "Error creating prescription:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to create prescription."
      );
    }
  };


  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex">

        <DoctorSidebar />

        <main className="flex-1 ml-64 p-8">

          <div className="flex items-center justify-center min-h-[70vh]">

            <div className="text-center">

              <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div>

              <p className="text-slate-500">
                Loading patient details...
              </p>

            </div>

          </div>

        </main>

      </div>
    );
  }


  // ======================================================
  // PATIENT NOT FOUND
  // ======================================================

  if (!patient) {
    return (
      <div className="min-h-screen bg-slate-50 flex">

        <DoctorSidebar />

        <main className="flex-1 ml-64 p-8">

          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">

            <UserRound
              size={48}
              className="mx-auto text-slate-300 mb-4"
            />

            <h2 className="text-xl font-bold text-slate-800">
              Patient not found
            </h2>

            <button
              onClick={() =>
                navigate("/doctor/patients")
              }
              className="mt-5 px-5 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              Back to Patients
            </button>

          </div>

        </main>

      </div>
    );
  }


  // ======================================================
  // MAIN UI
  // ======================================================

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* ==================================================
          SIDEBAR
      ================================================== */}

      <DoctorSidebar />


      {/* ==================================================
          MAIN CONTENT
      ================================================== */}

      <main className="flex-1 ml-64">

        {/* ==================================================
            TOP HEADER
        ================================================== */}

        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between">

          <div className="flex items-center gap-4">

            <button
              onClick={() =>
                navigate("/doctor/patients")
              }
              className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-teal-600 transition"
            >
              <ArrowLeft size={20} />
            </button>

            <div>

              <h1 className="text-2xl font-bold text-slate-800">
                Patient Details
              </h1>

              <p className="text-sm text-slate-500">
                View and manage patient information
              </p>

            </div>

          </div>


          <div className="flex items-center gap-3">

            <NotificationBell />

            <ProfileMenu />

            <button
              onClick={() =>
                setShowVitalsModal(true)
              }
              className="flex items-center gap-2 px-4 py-2.5 border border-teal-200 text-teal-700 rounded-lg hover:bg-teal-50 transition"
            >
              <Activity size={18} />
              Add Vitals
            </button>

            <button
              onClick={() =>
                setShowPrescriptionModal(true)
              }
              className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
            >
              <Pill size={18} />
              Add Prescription
            </button>

          </div>

        </header>


        {/* ==================================================
            CONTENT
        ================================================== */}

        <div className="p-8">

          {/* Error */}
          {error && (

            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">

              <p className="text-sm">
                {error}
              </p>

              <button
                onClick={() => setError("")}
                className="text-red-500 hover:text-red-700"
              >
                <X size={18} />
              </button>

            </div>

          )}


          {/* ==================================================
              PATIENT PROFILE
          ================================================== */}

          <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 mb-8">

            <div className="flex items-center justify-between mb-6">

              <div className="flex items-center gap-4">

                <div className="w-16 h-16 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
                  <UserRound size={32} />
                </div>

                <div>

                  <h2 className="text-xl font-bold text-slate-800">
                    {patient.name}
                  </h2>

                  <p className="text-sm text-slate-500">
                    Patient
                  </p>

                </div>

              </div>


              {!editingPatient ? (

                <button
                  onClick={() =>
                    setEditingPatient(true)
                  }
                  className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  <Edit3 size={17} />
                  Edit Details
                </button>

              ) : (

                <div className="flex gap-2">

                  <button
                    onClick={() =>
                      setEditingPatient(false)
                    }
                    className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={savePatientDetails}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700"
                  >
                    <Save size={17} />
                    Save
                  </button>

                </div>

              )}

            </div>


            {!editingPatient ? (

              /* ==================================================
                 PATIENT INFORMATION VIEW
              ================================================== */

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                <div>
                  <p className="text-xs text-slate-500 mb-1">
                    Full Name
                  </p>

                  <p className="font-medium text-slate-800">
                    {patient.name || "Not available"}
                  </p>
                </div>


                <div>
                  <p className="text-xs text-slate-500 mb-1">
                    Email
                  </p>

                  <p className="font-medium text-slate-800">
                    {patient.email || "Not available"}
                  </p>
                </div>


                <div>
                  <p className="text-xs text-slate-500 mb-1">
                    Phone
                  </p>

                  <p className="font-medium text-slate-800">
                    {patient.phone || "Not available"}
                  </p>
                </div>


                <div>
                  <p className="text-xs text-slate-500 mb-1">
                    Gender
                  </p>

                  <p className="font-medium text-slate-800">
                    {patient.gender || "Not available"}
                  </p>
                </div>


                <div>
                  <p className="text-xs text-slate-500 mb-1">
                    Age
                  </p>

                  <p className="font-medium text-slate-800">
                    {patient.age || "Not available"}
                  </p>
                </div>


                <div>
                  <p className="text-xs text-slate-500 mb-1">
                    Blood Group
                  </p>

                  <p className="font-medium text-slate-800">
                    {patient.bloodGroup || "Not available"}
                  </p>
                </div>


                <div className="md:col-span-2 lg:col-span-3">

                  <p className="text-xs text-slate-500 mb-1">
                    Address
                  </p>

                  <p className="font-medium text-slate-800">
                    {formatAddress(patient.address) ||
                      "Not available"}
                  </p>

                </div>

              </div>

            ) : (

              /* ==================================================
                 PATIENT INFORMATION EDIT
              ================================================== */

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={patientForm.name}
                    onChange={handlePatientChange}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                  />

                </div>


                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={patientForm.email}
                    onChange={handlePatientChange}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                  />

                </div>


                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Phone
                  </label>

                  <input
                    type="text"
                    name="phone"
                    value={patientForm.phone}
                    onChange={handlePatientChange}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                  />

                </div>


                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Gender
                  </label>

                  <select
                    name="gender"
                    value={patientForm.gender}
                    onChange={handlePatientChange}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">
                      Select Gender
                    </option>

                    <option value="Male">
                      Male
                    </option>

                    <option value="Female">
                      Female
                    </option>

                    <option value="Other">
                      Other
                    </option>

                  </select>

                </div>


                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Age
                  </label>

                  <input
                    type="number"
                    name="age"
                    value={patientForm.age}
                    onChange={handlePatientChange}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                  />

                </div>


                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Blood Group
                  </label>

                  <select
                    name="bloodGroup"
                    value={patientForm.bloodGroup}
                    onChange={handlePatientChange}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">
                      Select Blood Group
                    </option>

                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>

                  </select>

                </div>


                {/* STREET */}

                <div className="md:col-span-2">

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Street Address
                  </label>

                  <input
                    type="text"
                    value={patientForm.address.street}
                    onChange={(e) =>
                      handleAddressChange(
                        "street",
                        e.target.value
                      )
                    }
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                  />

                </div>


                {/* CITY */}

                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    City
                  </label>

                  <input
                    type="text"
                    value={patientForm.address.city}
                    onChange={(e) =>
                      handleAddressChange(
                        "city",
                        e.target.value
                      )
                    }
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                  />

                </div>


                {/* STATE */}

                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    State
                  </label>

                  <input
                    type="text"
                    value={patientForm.address.state}
                    onChange={(e) =>
                      handleAddressChange(
                        "state",
                        e.target.value
                      )
                    }
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                  />

                </div>


                {/* ZIP */}

                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    ZIP Code
                  </label>

                  <input
                    type="text"
                    value={patientForm.address.zipCode}
                    onChange={(e) =>
                      handleAddressChange(
                        "zipCode",
                        e.target.value
                      )
                    }
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                  />

                </div>

              </div>

            )}

          </section>


          {/* ==================================================
              VITALS
          ================================================== */}

          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Vitals</h2>
                <p className="text-sm text-slate-500">Latest patient measurements</p>
              </div>

              <button
                onClick={openAddVitals}
                className="flex items-center gap-2 text-sm font-medium text-teal-600 hover:text-teal-700"
              >
                <Plus size={17} />
                Add Vitals
              </button>
            </div>

            {vitals.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
                <Activity size={40} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500">No vitals recorded yet.</p>
              </div>
            ) : (
              <>
                {(() => {
                  const latest = vitals[0];
                  const cards = [
                    ["Hemoglobin", latest.hemoglobin?.value, latest.hemoglobin?.unit || "g/dL", Droplets],
                    ["Blood Pressure", latest.bloodPressure?.reading, latest.bloodPressure?.unit || "mmHg", Activity],
                    ["Blood Sugar", latest.bloodSugar?.value, latest.bloodSugar?.unit || "mg/dL", Activity],
                    ["Heart Rate", latest.heartRate?.value, latest.heartRate?.unit || "bpm", Heart],
                    ["Oxygen Saturation", latest.oxygenSaturation?.value, latest.oxygenSaturation?.unit || "%", HeartPulse],
                    ["Temperature", latest.temperature?.value, latest.temperature?.unit || "°F", Thermometer],
                    ["Weight", latest.weight?.value, latest.weight?.unit || "kg", Activity],
                    ["Height", latest.height?.value, latest.height?.unit || "cm", Activity],
                  ];

                  return (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                        {cards.map(([label, value, unit, Icon]) => (
                          <div key={label} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                            <div className="flex items-center justify-between">
                              <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                                <Icon size={19} />
                              </div>
                              <span className="text-xs text-slate-400">Latest</span>
                            </div>
                            <p className="mt-4 text-sm text-slate-500">{label}</p>
                            <div className="mt-1 flex items-end gap-2">
                              <span className="text-2xl font-bold text-slate-800">{value ?? "—"}</span>
                              <span className="mb-1 text-xs text-slate-400">{unit}</span>
                            </div>
                            <p className="mt-2 text-xs text-slate-400">
                              Updated by {latest.recordedBy?.name || "Doctor"}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 bg-white border border-slate-200 rounded-xl overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-200">
                          <h3 className="font-semibold text-slate-800">Vital History</h3>
                          <p className="text-xs text-slate-500 mt-1">Previous records from all doctors who treated this patient</p>
                        </div>

                        <div className="divide-y divide-slate-100">
                          {vitals.map((vital, index) => (
                            <div key={vital._id || index} className="px-5 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                              <div>
                                <p className="text-sm font-semibold text-slate-800">
                                  {vital.recordedBy?.name || "Doctor"}
                                </p>
                                <p className="text-xs text-slate-400 mt-1">
                                  {vital.recordedAt ? new Date(vital.recordedAt).toLocaleString() : "—"}
                                </p>
                              </div>

                              <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-600">
                                <span>BP: <b>{vital.bloodPressure?.reading || "—"}</b></span>
                                <span>HR: <b>{vital.heartRate?.value ?? "—"}</b></span>
                                <span>SpO₂: <b>{vital.oxygenSaturation?.value ?? "—"}%</b></span>
                                <span>Hb: <b>{vital.hemoglobin?.value ?? "—"}</b></span>
                              </div>

                              <div className="flex gap-2">
                                <button onClick={() => openEditVital(vital)} className="px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50">
                                  Edit
                                </button>
                                <button onClick={() => deleteVital(vital._id)} className="px-3 py-2 border border-red-200 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50">
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </>
            )}
          </section>

          {/* ==================================================
              REPORTS
          ================================================== */}

          <section>

            <div className="flex items-center justify-between mb-4">

              <div>

                <h2 className="text-lg font-bold text-slate-800">
                  Reports
                </h2>

                <p className="text-sm text-slate-500">
                  Patient medical reports
                </p>

              </div>

              <button
                onClick={() =>
                  navigate(
                    `/doctor/patients/${id}/reports`
                  )
                }
                className="flex items-center gap-2 text-sm font-medium text-teal-600 hover:text-teal-700"
              >
                <Eye size={17} />
                View All Reports
              </button>

            </div>


            {reports.length === 0 ? (

              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">

                <FileText
                  size={40}
                  className="mx-auto text-slate-300 mb-3"
                />

                <p className="text-slate-500">
                  No reports found.
                </p>

              </div>

            ) : (

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">

                {reports.slice(0, 5).map(
                  (report, index) => (

                    <div
                      key={
                        report._id ||
                        index
                      }
                      className={`px-6 py-5 flex items-center justify-between ${
                        index !==
                        Math.min(
                          reports.length,
                          5
                        ) -
                          1
                          ? "border-b border-slate-200"
                          : ""
                      }`}
                    >

                      <div className="flex items-center gap-4">

                        <div className="w-11 h-11 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                          <FileText size={20} />
                        </div>

                        <div>

                          <p className="font-medium text-slate-800">
                            {report.title ||
                              report.name ||
                              report.reportName ||
                              "Medical Report"}
                          </p>

                          <p className="text-sm text-slate-500">

                            {report.createdAt
                              ? new Date(
                                  report.createdAt
                                ).toLocaleDateString()
                              : report.date ||
                                "No date"}

                          </p>

                        </div>

                      </div>


                      <button
                        onClick={() =>
                          navigate(
                            `/doctor/reports/${report._id}`
                          )
                        }
                        className="text-sm font-medium text-teal-600 hover:text-teal-700"
                      >
                        View
                      </button>

                    </div>

                  )
                )}

              </div>

            )}

          </section>

        </div>

      </main>


      {/* ======================================================
          VITALS MODAL
      ====================================================== */}

      {showVitalsModal && (

        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center px-4">

          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">

            {/* Header */}

            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">

              <div>

                <h3 className="text-xl font-bold text-slate-800">
                  {editingVitalId ? "Edit Patient Vitals" : "Add Patient Vitals"}
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Record the patient's current health measurements.
                </p>

              </div>

              <button
                onClick={() =>
                  setShowVitalsModal(false)
                }
                className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X size={21} />
              </button>

            </div>


            <form
              onSubmit={saveVitals}
              className="p-6"
            >

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Hemoglobin
                  </label>

                  <input
                    type="number"
                    step="0.1"
                    name="hemoglobin"
                    value={vitalsForm.hemoglobin}
                    onChange={handleVitalsChange}
                    placeholder="13.8"
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                  />

                </div>


                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Blood Pressure
                  </label>

                  <input
                    type="text"
                    name="bloodPressure"
                    value={
                      vitalsForm.bloodPressure
                    }
                    onChange={
                      handleVitalsChange
                    }
                    placeholder="120/80"
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                  />

                </div>


                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Heart Rate
                  </label>

                  <input
                    type="number"
                    name="heartRate"
                    value={
                      vitalsForm.heartRate
                    }
                    onChange={
                      handleVitalsChange
                    }
                    placeholder="72"
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                  />

                </div>


                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Temperature
                  </label>

                  <input
                    type="number"
                    step="0.1"
                    name="temperature"
                    value={
                      vitalsForm.temperature
                    }
                    onChange={
                      handleVitalsChange
                    }
                    placeholder="98.6"
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                  />

                </div>


                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Blood Sugar
                  </label>

                  <input
                    type="number"
                    name="bloodSugar"
                    value={
                      vitalsForm.bloodSugar
                    }
                    onChange={
                      handleVitalsChange
                    }
                    placeholder="100"
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                  />

                </div>


                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Oxygen Saturation
                  </label>

                  <input
                    type="number"
                    name="oxygenSaturation"
                    value={
                      vitalsForm.oxygenSaturation
                    }
                    onChange={
                      handleVitalsChange
                    }
                    placeholder="98"
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                  />

                </div>


                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Weight
                  </label>

                  <input
                    type="number"
                    step="0.1"
                    name="weight"
                    value={
                      vitalsForm.weight
                    }
                    onChange={
                      handleVitalsChange
                    }
                    placeholder="65"
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                  />

                </div>


                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Height
                  </label>

                  <input
                    type="number"
                    step="0.1"
                    name="height"
                    value={
                      vitalsForm.height
                    }
                    onChange={
                      handleVitalsChange
                    }
                    placeholder="170"
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                  />

                </div>


                <div className="md:col-span-2">

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Notes
                  </label>

                  <textarea
                    name="notes"
                    rows="3"
                    value={
                      vitalsForm.notes
                    }
                    onChange={
                      handleVitalsChange
                    }
                    placeholder="Additional notes..."
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none resize-none focus:ring-2 focus:ring-teal-500"
                  />

                </div>

              </div>


              <div className="flex justify-end gap-3 mt-6">

                <button
                  type="button"
                  onClick={() =>
                    setShowVitalsModal(false)
                  }
                  className="px-5 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700"
                >
                  {editingVitalId ? "Update Vitals" : "Save Vitals"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* ======================================================
          PRESCRIPTION MODAL
      ====================================================== */}

      {showPrescriptionModal && (

        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center px-4">

          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl max-h-[92vh] overflow-y-auto">

            {/* Header */}

            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">

              <div>

                <h3 className="text-xl font-bold text-slate-800">
                  Add Prescription
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Create a prescription for {patient.name}.
                </p>

              </div>

              <button
                onClick={() =>
                  setShowPrescriptionModal(false)
                }
                className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X size={21} />
              </button>

            </div>


            <form
              onSubmit={
                createPrescription
              }
              className="p-6"
            >

              {/* ==========================================
                  DIAGNOSIS + DATE
              ========================================== */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">

                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Diagnosis
                  </label>

                  <input
                    type="text"
                    name="diagnosis"
                    value={
                      prescriptionForm.diagnosis
                    }
                    onChange={
                      handlePrescriptionChange
                    }
                    placeholder="Enter diagnosis"
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                  />

                </div>


                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Date
                  </label>

                  <input
                    type="date"
                    name="date"
                    value={
                      prescriptionForm.date
                    }
                    onChange={
                      handlePrescriptionChange
                    }
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                  />

                </div>

              </div>


              {/* ==========================================
                  ADD MEDICINE
              ========================================== */}

              <div className="border border-slate-200 rounded-xl p-5">

                <div className="flex items-center justify-between mb-5">

                  <div>

                    <h4 className="font-semibold text-slate-800">
                      Add Medicine
                    </h4>

                    <p className="text-sm text-slate-500">
                      Add each medicine separately.
                    </p>

                  </div>

                  <Pill
                    size={20}
                    className="text-teal-600"
                  />

                </div>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* Medicine */}

                  <div>

                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Medicine *
                    </label>

                    <input
                      type="text"
                      name="medicine"
                      value={
                        medicineForm.medicine
                      }
                      onChange={
                        handleMedicineChange
                      }
                      placeholder="e.g. Paracetamol"
                      className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                    />

                  </div>


                  {/* Dosage */}

                  <div>

                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Dosage *
                    </label>

                    <input
                      type="text"
                      name="dosage"
                      value={
                        medicineForm.dosage
                      }
                      onChange={
                        handleMedicineChange
                      }
                      placeholder="e.g. 500 mg"
                      className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                    />

                  </div>


                  {/* Frequency */}

                  <div>

                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Frequency *
                    </label>

                    <input
                      type="text"
                      name="frequency"
                      value={
                        medicineForm.frequency
                      }
                      onChange={
                        handleMedicineChange
                      }
                      placeholder="e.g. Twice a day"
                      className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                    />

                  </div>


                  {/* Duration */}

                  <div>

                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Duration *
                    </label>

                    <input
                      type="text"
                      name="duration"
                      value={
                        medicineForm.duration
                      }
                      onChange={
                        handleMedicineChange
                      }
                      placeholder="e.g. 5 days"
                      className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                    />

                  </div>


                  {/* Instructions */}

                  <div className="md:col-span-2">

                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Instructions
                    </label>

                    <textarea
                      name="instructions"
                      rows="2"
                      value={
                        medicineForm.instructions
                      }
                      onChange={
                        handleMedicineChange
                      }
                      placeholder="e.g. Take after food"
                      className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none resize-none focus:ring-2 focus:ring-teal-500"
                    />

                  </div>

                </div>


                <button
                  type="button"
                  onClick={addMedicine}
                  className="mt-4 flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700"
                >
                  <Plus size={17} />
                  Add Medicine
                </button>

              </div>


              {/* ==========================================
                  MEDICINES LIST
              ========================================== */}

              {medicines.length > 0 && (

                <div className="mt-6">

                  <h4 className="font-semibold text-slate-800 mb-3">
                    Medicines Added
                  </h4>


                  <div className="space-y-3">

                    {medicines.map(
                      (medicine, index) => (

                        <div
                          key={index}
                          className="border border-slate-200 rounded-xl p-4 bg-slate-50"
                        >

                          <div className="flex items-start justify-between gap-4">

                            <div className="flex-1">

                              <div className="flex items-center gap-2 mb-2">

                                <Pill
                                  size={18}
                                  className="text-teal-600"
                                />

                                <p className="font-semibold text-slate-800">
                                  {
                                    medicine.medicine
                                  }
                                </p>

                              </div>


                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">

                                <div>

                                  <span className="text-slate-500">
                                    Dosage:
                                  </span>{" "}

                                  <span className="font-medium text-slate-700">
                                    {
                                      medicine.dosage
                                    }
                                  </span>

                                </div>


                                <div>

                                  <span className="text-slate-500">
                                    Frequency:
                                  </span>{" "}

                                  <span className="font-medium text-slate-700">
                                    {
                                      medicine.frequency
                                    }
                                  </span>

                                </div>


                                <div>

                                  <span className="text-slate-500">
                                    Duration:
                                  </span>{" "}

                                  <span className="font-medium text-slate-700">
                                    {
                                      medicine.duration
                                    }
                                  </span>

                                </div>

                              </div>


                              {medicine.instructions && (

                                <p className="text-sm text-slate-500 mt-2">

                                  <span className="font-medium text-slate-600">
                                    Instructions:
                                  </span>{" "}

                                  {
                                    medicine.instructions
                                  }

                                </p>

                              )}

                            </div>


                            <button
                              type="button"
                              onClick={() =>
                                removeMedicine(
                                  index
                                )
                              }
                              className="w-9 h-9 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50"
                            >
                              <Trash2
                                size={18}
                              />
                            </button>

                          </div>

                        </div>

                      )
                    )}

                  </div>

                </div>

              )}


              {/* ==========================================
                  FORM BUTTONS
              ========================================== */}

              <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-slate-200">

                <button
                  type="button"
                  onClick={() => {
                    setShowPrescriptionModal(
                      false
                    );

                    setMedicines([]);

                    setMedicineForm({
                      medicine: "",
                      dosage: "",
                      frequency: "",
                      duration: "",
                      instructions: "",
                    });
                  }}
                  className="px-5 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  disabled={
                    medicines.length === 0
                  }
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium text-white transition ${
                    medicines.length === 0
                      ? "bg-slate-300 cursor-not-allowed"
                      : "bg-teal-600 hover:bg-teal-700"
                  }`}
                >
                  Create Prescription
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};


export default PatientDetails;

