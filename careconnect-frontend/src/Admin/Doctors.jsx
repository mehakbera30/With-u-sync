import React, { useEffect, useMemo, useState } from "react";
import { GraduationCap, Mail, Phone, Plus, Search, Trash2, X } from "lucide-react";
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
  specialization: "General Physician",
  qualifications: "MBBS",
  experience: "",
  clinicLocation: "WithUSync Clinic",
  consultationFee: "500",
};

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState("");

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const response = await api.admin.getDoctors();
      setDoctors(response.doctors || []);
    } catch (error) {
      alert(error.message || "Could not load doctors.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  const addDoctor = async (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      alert("Name, email and password are required.");
      return;
    }

    try {
      setSaving(true);
      await api.admin.createDoctor({
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
      });
      setForm(emptyForm);
      setShowAdd(false);
      await loadDoctors();
    } catch (error) {
      alert(error.message || "Could not add doctor.");
    } finally {
      setSaving(false);
    }
  };

  const removeDoctor = async (doctor) => {
    const doctorName = displayDoctorName(doctor.name);

    if (
      !window.confirm(
        `Remove ${doctorName}? Assigned patients will become unassigned.`
      )
    ) {
      return;
    }

    try {
      setRemovingId(doctor._id);
      await api.admin.deleteDoctor(doctor._id);
      await loadDoctors();
    } catch (error) {
      alert(error.message || "Could not remove doctor.");
    } finally {
      setRemovingId("");
    }
  };

  const filteredDoctors = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return doctors;

    return doctors.filter((doctor) =>
      `${doctor.name || ""} ${doctor.email || ""} ${
        doctor.specialization || ""
      } ${doctor.qualifications || ""}`
        .toLowerCase()
        .includes(query)
    );
  }, [doctors, search]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      <AdminSidebar />

      <main className="ml-64 flex-1 min-w-0">
        <header className="h-20 bg-gradient-to-r from-white via-teal-50/60 to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border-b border-teal-100 dark:border-slate-800 px-8 flex items-center justify-between shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              Doctors
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Add, view and remove doctor accounts.
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
                Registered Doctors
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Manage doctor profiles and professional information.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-3 rounded-lg font-medium"
            >
              <Plus size={18} />
              Add Doctor
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
              placeholder="Search doctors..."
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-800 dark:text-white"
            />
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-10 text-center text-slate-500">
                Loading doctors...
              </div>
            ) : filteredDoctors.length === 0 ? (
              <div className="p-10 text-center text-slate-500">
                No doctors found.
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredDoctors.map((doctor) => (
                  <div
                    key={doctor._id}
                    className="p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-5"
                  >
                    <div className="flex items-center gap-4 min-w-[260px]">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-teal-100 text-teal-700 flex items-center justify-center font-bold shrink-0">
                        {doctor.avatar ? (
                          <img
                            src={getAvatarUrl(doctor.avatar)}
                            alt={doctor.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          getInitials(doctor.name)
                        )}
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-semibold text-lg text-slate-800 dark:text-white truncate">
                          {displayDoctorName(doctor.name)}
                        </h3>
                        <p className="text-sm text-teal-600">
                          {doctor.specialization || "General Physician"}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {doctor.qualifications || "Education not provided"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400 flex-1">
                      <span className="flex gap-2 items-center break-all">
                        <Mail size={15} className="text-teal-600 shrink-0" />
                        {doctor.email}
                      </span>
                      <span className="flex gap-2 items-center">
                        <Phone size={15} className="text-teal-600 shrink-0" />
                        {doctor.phone || "Not provided"}
                      </span>
                      <span className="flex gap-2 items-center">
                        <GraduationCap
                          size={15}
                          className="text-teal-600 shrink-0"
                        />
                        {doctor.qualifications || "Not provided"}
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={removingId === doctor._id}
                      onClick={() => removeDoctor(doctor)}
                      className="self-start xl:self-center flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                      {removingId === doctor._id ? "Removing..." : "Remove"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {showAdd && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                  Add Doctor
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Create a doctor account for the WithUSync portal.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={addDoctor} className="p-6 grid md:grid-cols-2 gap-5">
              <Field label="Full Name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} required />
              <Field label="Email" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} required />
              <Field label="Initial Password" type="password" value={form.password} onChange={(value) => setForm({ ...form, password: value })} required />
              <Field label="Contact Number" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} />
              <Field label="Specialization" value={form.specialization} onChange={(value) => setForm({ ...form, specialization: value })} />
              <Field label="Most Recent Education" value={form.qualifications} onChange={(value) => setForm({ ...form, qualifications: value })} />
              <Field label="Experience (years)" type="number" min="0" value={form.experience} onChange={(value) => setForm({ ...form, experience: value })} />
              <Field label="Clinic Location" value={form.clinicLocation} onChange={(value) => setForm({ ...form, clinicLocation: value })} />
              <Field label="Consultation Fee" type="number" min="0" value={form.consultationFee} onChange={(value) => setForm({ ...form, consultationFee: value })} />

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
                  {saving ? "Creating..." : "Create Doctor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

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

export default Doctors;
