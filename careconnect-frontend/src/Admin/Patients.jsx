import React, { useEffect, useMemo, useState } from "react";
import { Mail, Phone, Plus, Search, Trash2, X } from "lucide-react";
import AdminSidebar from "../components/AdminSidebar";
import NotificationBell from "../components/NotificationBell";
import ProfileMenu, { getAvatarUrl } from "../components/ProfileMenu";
import api from "../services/api";
import { displayDoctorName, getInitials } from "../utils/formatters";

const emptyForm = {
  name: "",
  email: "",
  password: "password123",
  phone: "",
  gender: "",
  age: "",
  bloodGroup: "",
  assignedDoctor: "",
};

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState("");
  const [assigningId, setAssigningId] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [patientsResponse, doctorsResponse] = await Promise.all([
        api.admin.getPatients(),
        api.admin.getDoctors(),
      ]);

      setPatients(patientsResponse.patients || []);
      setDoctors(doctorsResponse.doctors || []);
    } catch (error) {
      alert(error.message || "Could not load patients.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addPatient = async (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      alert("Name, email and password are required.");
      return;
    }

    if (!form.assignedDoctor) {
      alert("Please select an assigned doctor.");
      return;
    }

    try {
      setSaving(true);
      await api.admin.createPatient({
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
      });
      setForm(emptyForm);
      setShowAdd(false);
      await loadData();
    } catch (error) {
      alert(error.message || "Could not add patient.");
    } finally {
      setSaving(false);
    }
  };

  const removePatient = async (patient) => {
    if (!window.confirm(`Remove ${patient.name}? This cannot be undone.`)) {
      return;
    }

    try {
      setRemovingId(patient._id);
      await api.admin.deletePatient(patient._id);
      setSelected(null);
      await loadData();
    } catch (error) {
      alert(error.message || "Could not remove patient.");
    } finally {
      setRemovingId("");
    }
  };

  const assignDoctor = async (patient, doctorId) => {
    try {
      setAssigningId(patient._id);
      await api.admin.assignPatient(patient._id, doctorId || null);
      await loadData();
    } catch (error) {
      alert(error.message || "Could not assign doctor.");
    } finally {
      setAssigningId("");
    }
  };

  const filteredPatients = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return patients;

    return patients.filter((patient) =>
      `${patient.name || ""} ${patient.email || ""} ${patient.phone || ""} ${
        patient.assignedDoctor?.name || ""
      }`
        .toLowerCase()
        .includes(query)
    );
  }, [patients, search]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      <AdminSidebar />

      <main className="ml-64 flex-1 min-w-0">
        <header className="h-20 bg-gradient-to-r from-white via-teal-50/60 to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border-b border-teal-100 dark:border-slate-800 px-8 flex items-center justify-between shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              Patients
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Add, remove and assign patients.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <ProfileMenu />
          </div>
        </header>

        <div className="p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-7">
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                Registered Patients
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Manage patient accounts and assigned doctors.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-3 rounded-lg font-medium"
            >
              <Plus size={18} />
              Add Patient
            </button>
          </div>

          <div className="relative mb-5 max-w-md">
            <Search
              size={18}
              className="absolute left-3 top-3.5 text-teal-600"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search patients..."
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-800 dark:text-white"
            />
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            {loading ? (
              <div className="p-10 text-center text-slate-500">
                Loading patients...
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="p-10 text-center text-slate-500">
                No patients found.
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredPatients.map((patient) => (
                  <div
                    key={patient._id}
                    className="p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-5"
                  >
                    <button
                      type="button"
                      onClick={() => setSelected(patient)}
                      className="flex items-center gap-4 min-w-[250px] text-left"
                    >
                      <div className="w-14 h-14 rounded-full overflow-hidden bg-teal-100 text-teal-700 flex items-center justify-center font-bold shrink-0">
                        {patient.avatar ? (
                          <img
                            src={getAvatarUrl(patient.avatar)}
                            alt={patient.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          getInitials(patient.name)
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-lg text-slate-800 dark:text-white truncate">
                          {patient.name}
                        </h3>
                        <p className="text-sm text-slate-500">Patient</p>
                      </div>
                    </button>

                    <div className="text-sm text-slate-500 dark:text-slate-400 space-y-1">
                      <p className="flex gap-2 items-center break-all">
                        <Mail size={15} className="text-teal-600 shrink-0" />
                        {patient.email}
                      </p>
                      <p className="flex gap-2 items-center">
                        <Phone size={15} className="text-teal-600 shrink-0" />
                        {patient.phone || "Not provided"}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <select
                        value={patient.assignedDoctor?._id || ""}
                        disabled={assigningId === patient._id}
                        onChange={(event) =>
                          assignDoctor(patient, event.target.value)
                        }
                        className="p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-white disabled:opacity-60"
                      >
                        <option value="">Unassigned</option>
                        {doctors.map((doctor) => (
                          <option key={doctor._id} value={doctor._id}>
                            {displayDoctorName(doctor.name)}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => setSelected(patient)}
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm"
                      >
                        View
                      </button>

                      <button
                        type="button"
                        disabled={removingId === patient._id}
                        onClick={() => removePatient(patient)}
                        className="p-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
                        aria-label={`Remove ${patient.name}`}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {showAdd && (
        <Modal title="Add Patient" onClose={() => setShowAdd(false)}>
          <form onSubmit={addPatient} className="p-6 grid md:grid-cols-2 gap-4">
            <Field label="Full Name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} required />
            <Field label="Registered Email" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} required />
            <Field label="Initial Password" type="password" value={form.password} onChange={(value) => setForm({ ...form, password: value })} required />
            <Field label="Contact Number" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} />
            <Field label="Age" type="number" min="0" value={form.age} onChange={(value) => setForm({ ...form, age: value })} />
            <SelectField label="Gender" value={form.gender} onChange={(value) => setForm({ ...form, gender: value })} options={["", "Male", "Female", "Other"]} />
            <SelectField label="Blood Group" value={form.bloodGroup} onChange={(value) => setForm({ ...form, bloodGroup: value })} options={["", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]} />
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Assigned Doctor
                <select
                  required
                  value={form.assignedDoctor}
                  onChange={(event) =>
                    setForm({ ...form, assignedDoctor: event.target.value })
                  }
                  className="mt-2 w-full p-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                >
                  <option value="">Select Doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor._id} value={doctor._id}>
                      {displayDoctorName(doctor.name)} — {doctor.specialization || "General"}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="px-5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-medium disabled:opacity-60"
              >
                {saving ? "Creating..." : "Create Patient"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {selected && (
        <Modal title="Patient Details" onClose={() => setSelected(null)}>
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xl">
                {selected.avatar ? (
                  <img
                    src={getAvatarUrl(selected.avatar)}
                    alt={selected.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  getInitials(selected.name)
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                  {selected.name}
                </h2>
                <p className="text-teal-600">Patient</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Info label="Registered Email" value={selected.email} />
              <Info label="Contact Number" value={selected.phone || "Not provided"} />
              <Info
                label="Assigned Doctor"
                value={
                  selected.assignedDoctor?.name
                    ? displayDoctorName(selected.assignedDoctor.name)
                    : "Not assigned"
                }
              />
              <Info
                label="Address"
                value={[
                  selected.address?.street,
                  selected.address?.city,
                  selected.address?.state,
                  selected.address?.zipCode,
                ]
                  .filter(Boolean)
                  .join(", ") || "Not provided"}
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center px-4">
    <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </div>
  </div>
);

const Field = ({ label, value, onChange, type = "text", min, required }) => (
  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
    {label}
    <input
      type={type}
      min={min}
      required={required}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="mt-2 w-full p-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
    />
  </label>
);

const SelectField = ({ label, value, onChange, options }) => (
  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
    {label}
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="mt-2 w-full p-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option || "Select"}
        </option>
      ))}
    </select>
  </label>
);

const Info = ({ label, value }) => (
  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
    <p className="text-xs text-slate-400">{label}</p>
    <p className="text-sm text-slate-700 dark:text-slate-200 mt-1 break-words">
      {value}
    </p>
  </div>
);

export default Patients;
