import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Users,
  Stethoscope,
  CalendarDays,
  UserPlus,
  RefreshCw,
  UserRound,
  BriefcaseMedical,
  MapPin,
  Phone,
  Mail,
  GraduationCap,
} from "lucide-react";
import AdminSidebar from "../components/AdminSidebar";
import NotificationBell from "../components/NotificationBell";
import ProfileMenu from "../components/ProfileMenu";
import api, { getStoredUser } from "../services/api";
import { displayDoctorName } from "../utils/formatters";
import { useSearchParams } from "react-router-dom";

const AdminDashboard = () => {
  const [admin, setAdmin] = useState(null);
  const [searchParams] = useSearchParams();
  const [stats, setStats] = useState({});
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [activeTab, setActiveTab] = useState("overview");
  const [search, setSearch] = useState("");

  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [creatingPatient, setCreatingPatient] = useState(false);
  const [creatingDoctor, setCreatingDoctor] = useState(false);

  const [doctorForm, setDoctorForm] = useState({
    name: "",
    email: "",
    password: "password123",
    phone: "",
    gender: "",
    specialization: "",
    qualifications: "",
    experience: "",
    clinicLocation: "WithUSync Clinic",
    consultationFee: "500",
  });

  const [patientForm, setPatientForm] = useState({
    name: "",
    email: "",
    password: "password123",
    phone: "",
    gender: "",
    age: "",
    bloodGroup: "",
    assignedDoctor: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [statsRes, doctorsRes, patientsRes, appointmentsRes] =
        await Promise.all([
          api.admin.getStats(),
          api.admin.getDoctors(),
          api.admin.getPatients(),
          api.admin.getAppointments(),
        ]);

      setStats(statsRes.stats || {});
      setDoctors(doctorsRes.doctors || []);
      setPatients(patientsRes.patients || []);
      setAppointments(appointmentsRes.appointments || []);
    } catch (err) {
      console.error("Admin dashboard error:", err);
      setError(err.message || "Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setAdmin(getStoredUser());
    loadData();
  }, []);

  useEffect(() => {
    const tab = searchParams.get("tab");

    if (["patients", "doctors", "appointments"].includes(tab)) {
      setActiveTab(tab);
    } else {
      setActiveTab("overview");
    }
  }, [searchParams]);

  const filteredPatients = useMemo(() => {
    const text = search.toLowerCase();

    return patients.filter((patient) => {
      return (
        patient.name?.toLowerCase().includes(text) ||
        patient.email?.toLowerCase().includes(text) ||
        patient.assignedDoctor?.name?.toLowerCase().includes(text)
      );
    });
  }, [patients, search]);

  const filteredDoctors = useMemo(() => {
    const text = search.toLowerCase();

    return doctors.filter(
      (doctor) =>
        doctor.name?.toLowerCase().includes(text) ||
        doctor.specialization?.toLowerCase().includes(text)
    );
  }, [doctors, search]);

  const handleCreateDoctor = async (event) => {
    event.preventDefault();

    if (!doctorForm.name || !doctorForm.email || !doctorForm.password) {
      setError("Name, email and password are required.");
      return;
    }

    try {
      setCreatingDoctor(true);
      setError("");
      setSuccess("");

      const response = await api.admin.createDoctor(doctorForm);

      if (response.success) {
        setSuccess("Doctor account created successfully.");
        setDoctorForm({
          name: "",
          email: "",
          password: "password123",
          phone: "",
          gender: "",
          specialization: "",
          qualifications: "",
          experience: "",
          clinicLocation: "WithUSync Clinic",
          consultationFee: "500",
        });
        setShowDoctorModal(false);
        setActiveTab("doctors");
        await loadData();
      }
    } catch (err) {
      setError(err.message || "Failed to create doctor.");
    } finally {
      setCreatingDoctor(false);
    }
  };

  const handleCreatePatient = async (event) => {
    event.preventDefault();

    if (!patientForm.assignedDoctor) {
      setError("Please assign a doctor before creating the patient.");
      return;
    }

    try {
      setCreatingPatient(true);
      setError("");
      setSuccess("");

      const response = await api.admin.createPatient(patientForm);

      if (response.success) {
        setSuccess("Patient created and assigned successfully.");

        setPatientForm({
          name: "",
          email: "",
          password: "password123",
          phone: "",
          gender: "",
          age: "",
          bloodGroup: "",
          assignedDoctor: "",
        });

        setShowPatientModal(false);
        await loadData();
      }
    } catch (err) {
      setError(err.message || "Failed to create patient.");
    } finally {
      setCreatingPatient(false);
    }
  };

  const handleAssign = async (patientId, doctorId) => {
    try {
      setError("");
      setSuccess("");

      const response = await api.admin.assignPatient(
        patientId,
        doctorId || null
      );

      if (response.success) {
        setSuccess(response.message);
        await loadData();
      }
    } catch (err) {
      setError(err.message || "Failed to assign patient.");
    }
  };

  const initials =
    admin?.name
      ?.split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "AD";

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />

      <main className="ml-64">
        <header className="h-20 bg-gradient-to-r from-teal-100 to-white border-b border-teal-100 px-8 flex items-center justify-between shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Admin Dashboard
            </h1>
            <p className="text-slate-500 mt-1">
              Manage doctors, patients and WithUSync operations.
            </p>
          </div>

          <div className="flex items-center gap-5">
            <div className="relative hidden lg:block">
              <Search
                size={19}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-600"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-60 bg-white border border-teal-100 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-200"
              />
            </div>

            <button
              type="button"
              onClick={loadData}
              className="w-11 h-11 bg-white border border-teal-100 rounded-xl flex items-center justify-center text-slate-500 hover:text-teal-600"
              title="Refresh"
            >
              <RefreshCw size={19} />
            </button>

            <NotificationBell />

            <ProfileMenu />
          </div>
        </header>

        <div className="p-8">
          {error && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 p-4 bg-teal-50 border border-teal-200 text-teal-700 rounded-xl">
              {success}
            </div>
          )}

          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
              Loading admin dashboard...
            </div>
          ) : (
            <>
              <div className="grid grid-cols-5 gap-5 mb-8">
                <StatCard
                  label="Doctors"
                  value={stats.doctors || 0}
                  icon={<Stethoscope size={22} />}
                />

                <StatCard
                  label="Patients"
                  value={stats.patients || 0}
                  icon={<Users size={22} />}
                />

                <StatCard
                  label="Unassigned"
                  value={stats.unassignedPatients || 0}
                  icon={<UserPlus size={22} />}
                />

                <StatCard
                  label="Appointments"
                  value={stats.appointments || 0}
                  icon={<CalendarDays size={22} />}
                />

                <StatCard
                  label="Pending"
                  value={stats.pendingAppointments || 0}
                  icon={<CalendarDays size={22} />}
                />
              </div>

              <div className="flex items-center gap-2 mb-6">
                {[
                  ["overview", "Overview"],
                  ["patients", "Patients"],
                  ["doctors", "Doctors"],
                  ["appointments", "Appointments"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setActiveTab(value)}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium ${
                      activeTab === value
                        ? "bg-teal-600 text-white"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {activeTab === "overview" && (
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h2 className="text-xl font-semibold text-slate-800">
                          Patient Assignment
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                          Assign every patient to the doctor responsible for
                          them.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowPatientModal(true)}
                        className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium"
                      >
                        <Plus size={17} />
                        Add Patient
                      </button>
                    </div>

                    <div className="space-y-3">
                      {patients.slice(0, 5).map((patient) => (
                        <PatientAssignment
                          key={patient._id}
                          patient={patient}
                          doctors={doctors}
                          onAssign={handleAssign}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <h2 className="text-xl font-semibold text-slate-800">
                      Doctors
                    </h2>
                    <p className="text-sm text-slate-500 mt-1 mb-5">
                      Current doctor accounts in the system.
                    </p>

                    <div className="space-y-3">
                      {doctors.slice(0, 6).map((doctor) => {
                        const count = patients.filter(
                          (patient) =>
                            patient.assignedDoctor?._id === doctor._id
                        ).length;

                        return (
                          <div
                            key={doctor._id}
                            className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
                          >
                            <div>
                              <p className="font-medium text-slate-800">
                                {displayDoctorName(doctor.name)}
                              </p>
                              <p className="text-xs text-teal-600">
                                {doctor.specialization || "General Physician"}
                              </p>
                            </div>

                            <span className="text-xs bg-teal-50 text-teal-700 px-3 py-1 rounded-full">
                              {count} patients
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "patients" && (
                <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-slate-800">
                        Patient Management
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">
                        Create patients and control their doctor assignment.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowPatientModal(true)}
                      className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium"
                    >
                      <Plus size={17} />
                      Add Patient
                    </button>
                  </div>

                  <PatientTable
                    patients={filteredPatients}
                    doctors={doctors}
                    onAssign={handleAssign}
                  />
                </section>
              )}

              {activeTab === "doctors" && (
                <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="p-6 border-b border-slate-200 flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-slate-800">
                        Doctor Management
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">
                        Create doctor accounts and monitor their patient workload.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowDoctorModal(true)}
                      className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition"
                    >
                      <Plus size={17} />
                      Add Doctor
                    </button>
                  </div>

                  <div className="p-6 grid grid-cols-1 xl:grid-cols-2 gap-5">
                    {filteredDoctors.length === 0 ? (
                      <div className="xl:col-span-2 py-14 text-center text-slate-500">
                        No doctors found. Add your first doctor to get started.
                      </div>
                    ) : (
                      filteredDoctors.map((doctor) => {
                        const count = patients.filter(
                          (patient) =>
                            patient.assignedDoctor?._id === doctor._id
                        ).length;

                        const doctorInitials = doctor.name
                          ?.split(" ")
                          .filter(Boolean)
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase();

                        return (
                          <div
                            key={doctor._id}
                            className="group border border-slate-200 rounded-2xl p-5 hover:border-teal-200 hover:shadow-md transition bg-white"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-lg border border-teal-100">
                                  {doctorInitials || "DR"}
                                </div>
                                <div>
                                  <h3 className="font-semibold text-lg text-slate-800">
                                    {doctor.name}
                                  </h3>
                                  <p className="text-sm text-teal-600 font-medium mt-0.5">
                                    {doctor.specialization || "General Physician"}
                                  </p>
                                </div>
                              </div>
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                                Active
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-5">
                              <DoctorInfo icon={<Mail size={15} />} value={doctor.email} />
                              <DoctorInfo icon={<Phone size={15} />} value={doctor.phone || "Not added"} />
                              <DoctorInfo icon={<GraduationCap size={15} />} value={doctor.qualifications || "MBBS"} />
                              <DoctorInfo icon={<BriefcaseMedical size={15} />} value={`${doctor.experience || 0} years experience`} />
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                              <div className="flex items-center gap-2 text-sm text-slate-500">
                                <Users size={16} className="text-teal-600" />
                                <span>{count} assigned patient{count === 1 ? "" : "s"}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                <MapPin size={14} />
                                {doctor.clinicLocation || "WithUSync Clinic"}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </section>
              )}

              {activeTab === "appointments" && (
                <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="p-6 border-b border-slate-200">
                    <h2 className="text-xl font-semibold text-slate-800">
                      Appointment Monitoring
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      System-wide appointment activity.
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="text-left px-6 py-4 text-sm text-slate-500">
                            Patient
                          </th>
                          <th className="text-left px-6 py-4 text-sm text-slate-500">
                            Doctor
                          </th>
                          <th className="text-left px-6 py-4 text-sm text-slate-500">
                            Date
                          </th>
                          <th className="text-left px-6 py-4 text-sm text-slate-500">
                            Status
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {appointments.map((appointment) => (
                          <tr
                            key={appointment._id}
                            className="border-t border-slate-100"
                          >
                            <td className="px-6 py-4 text-sm font-medium text-slate-800">
                              {appointment.patient?.name ||
                                appointment.patientName}
                            </td>

                            <td className="px-6 py-4 text-sm text-slate-600">
                              {appointment.doctor?.name ||
                                appointment.doctorName}
                            </td>

                            <td className="px-6 py-4 text-sm text-slate-600">
                              {appointment.date} • {appointment.time}
                            </td>

                            <td className="px-6 py-4">
                              <span className="text-xs px-3 py-1 rounded-full bg-teal-50 text-teal-700">
                                {appointment.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>

      {showDoctorModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Stethoscope size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Add New Doctor</h2>
                  <p className="text-sm text-slate-500 mt-1">Create a doctor account for WithUSync.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDoctorModal(false)}
                className="w-9 h-9 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 text-xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateDoctor} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Full Name" value={doctorForm.name} onChange={(value) => setDoctorForm({ ...doctorForm, name: value })} required />
                <Field label="Email" type="email" value={doctorForm.email} onChange={(value) => setDoctorForm({ ...doctorForm, email: value })} required />
                <Field label="Password" value={doctorForm.password} onChange={(value) => setDoctorForm({ ...doctorForm, password: value })} required />
                <Field label="Phone" value={doctorForm.phone} onChange={(value) => setDoctorForm({ ...doctorForm, phone: value })} />
                <SelectField label="Gender" value={doctorForm.gender} onChange={(value) => setDoctorForm({ ...doctorForm, gender: value })} options={["", "Male", "Female", "Other"]} />
                <Field label="Specialization" value={doctorForm.specialization} onChange={(value) => setDoctorForm({ ...doctorForm, specialization: value })} />
                <Field label="Qualifications" value={doctorForm.qualifications} onChange={(value) => setDoctorForm({ ...doctorForm, qualifications: value })} />
                <Field label="Experience (years)" type="number" value={doctorForm.experience} onChange={(value) => setDoctorForm({ ...doctorForm, experience: value })} />
                <Field label="Clinic Location" value={doctorForm.clinicLocation} onChange={(value) => setDoctorForm({ ...doctorForm, clinicLocation: value })} />
                <Field label="Consultation Fee" type="number" value={doctorForm.consultationFee} onChange={(value) => setDoctorForm({ ...doctorForm, consultationFee: value })} />
              </div>

              <div className="mt-6 p-4 bg-teal-50 border border-teal-100 rounded-xl text-sm text-teal-800">
                The doctor can use these credentials to log in and will appear in the doctor portal immediately.
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <button type="button" onClick={() => setShowDoctorModal(false)} className="px-5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" disabled={creatingDoctor} className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium disabled:opacity-60">
                  {creatingDoctor ? "Creating Doctor..." : "Create Doctor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPatientModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl">
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Add New Patient
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  The patient must be assigned to a doctor.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowPatientModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xl"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleCreatePatient}
              className="p-6 grid grid-cols-2 gap-5"
            >
              <Field
                label="Full Name"
                value={patientForm.name}
                onChange={(value) =>
                  setPatientForm({ ...patientForm, name: value })
                }
                required
              />

              <Field
                label="Email"
                type="email"
                value={patientForm.email}
                onChange={(value) =>
                  setPatientForm({ ...patientForm, email: value })
                }
                required
              />

              <Field
                label="Password"
                value={patientForm.password}
                onChange={(value) =>
                  setPatientForm({ ...patientForm, password: value })
                }
                required
              />

              <Field
                label="Phone"
                value={patientForm.phone}
                onChange={(value) =>
                  setPatientForm({ ...patientForm, phone: value })
                }
              />

              <Field
                label="Age"
                type="number"
                value={patientForm.age}
                onChange={(value) =>
                  setPatientForm({ ...patientForm, age: value })
                }
              />

              <SelectField
                label="Gender"
                value={patientForm.gender}
                onChange={(value) =>
                  setPatientForm({ ...patientForm, gender: value })
                }
                options={["", "Male", "Female", "Other"]}
              />

              <SelectField
                label="Blood Group"
                value={patientForm.bloodGroup}
                onChange={(value) =>
                  setPatientForm({ ...patientForm, bloodGroup: value })
                }
                options={[
                  "",
                  "A+",
                  "A-",
                  "B+",
                  "B-",
                  "AB+",
                  "AB-",
                  "O+",
                  "O-",
                ]}
              />

              <SelectField
                label="Assign Doctor"
                value={patientForm.assignedDoctor}
                onChange={(value) =>
                  setPatientForm({
                    ...patientForm,
                    assignedDoctor: value,
                  })
                }
                options={doctors.map((doctor) => ({
                  value: doctor._id,
                  label: `${displayDoctorName(doctor.name)} — ${
                    doctor.specialization || "General"
                  }`,
                }))}
                required
              />

              <div className="col-span-2 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPatientModal(false)}
                  className="px-5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-700"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creatingPatient}
                  className="px-5 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-medium disabled:opacity-60"
                >
                  {creatingPatient ? "Creating..." : "Create Patient"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const DoctorInfo = ({ icon, value }) => (
  <div className="flex items-center gap-2 min-w-0 bg-slate-50 rounded-lg px-3 py-2">
    <span className="text-teal-600 shrink-0">{icon}</span>
    <span className="text-xs text-slate-600 truncate">{value}</span>
  </div>
);

const StatCard = ({ label, value, icon }) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-5">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <h3 className="text-3xl font-bold text-slate-800 mt-2">{value}</h3>
      </div>

      <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">{icon}</div>
    </div>
  </div>
);

const PatientAssignment = ({ patient, doctors, onAssign }) => (
  <div className="flex items-center justify-between gap-4 p-3 bg-slate-50 rounded-xl">
    <div className="min-w-0">
      <p className="font-medium text-slate-800 truncate">{patient.name}</p>
      <p className="text-xs text-slate-500 truncate">
        {patient.email}
      </p>
    </div>

    <select
      value={patient.assignedDoctor?._id || ""}
      onChange={(e) => onAssign(patient._id, e.target.value)}
      className="w-52 border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
    >
      <option value="">Unassigned</option>
      {doctors.map((doctor) => (
        <option key={doctor._id} value={doctor._id}>
          {displayDoctorName(doctor.name)}
        </option>
      ))}
    </select>
  </div>
);

const PatientTable = ({ patients, doctors, onAssign }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="bg-slate-50">
        <tr>
          <th className="text-left px-6 py-4 text-sm text-slate-500">
            Patient
          </th>
          <th className="text-left px-6 py-4 text-sm text-slate-500">
            Email
          </th>
          <th className="text-left px-6 py-4 text-sm text-slate-500">
            Assigned Doctor
          </th>
          <th className="text-left px-6 py-4 text-sm text-slate-500">
            Change Assignment
          </th>
        </tr>
      </thead>

      <tbody>
        {patients.length === 0 ? (
          <tr>
            <td colSpan="4" className="text-center py-12 text-slate-500">
              No patients found.
            </td>
          </tr>
        ) : (
          patients.map((patient) => (
            <tr key={patient._id} className="border-t border-slate-100">
              <td className="px-6 py-4 font-medium text-slate-800">
                {patient.name}
              </td>

              <td className="px-6 py-4 text-sm text-slate-500">
                {patient.email}
              </td>

              <td className="px-6 py-4 text-sm text-slate-600">
                {patient.assignedDoctor?.name || "Unassigned"}
              </td>

              <td className="px-6 py-4">
                <select
                  value={patient.assignedDoctor?._id || ""}
                  onChange={(e) =>
                    onAssign(patient._id, e.target.value)
                  }
                  className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Unassigned</option>

                  {doctors.map((doctor) => (
                    <option key={doctor._id} value={doctor._id}>
                      {displayDoctorName(doctor.name)}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

const Field = ({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-2">
      {label}
    </label>

    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500"
    />
  </div>
);

const SelectField = ({
  label,
  value,
  onChange,
  options,
  required = false,
}) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-2">
      {label}
    </label>

    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="w-full border border-slate-300 rounded-lg px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-teal-500"
    >
      {options.map((option) => {
        const item =
          typeof option === "string"
            ? { value: option, label: option || "Select" }
            : option;

        return (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        );
      })}
    </select>
  </div>
);

export default AdminDashboard;
