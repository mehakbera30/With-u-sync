import React, { useEffect, useState } from "react";
import {
  Search,
  CalendarDays,
  Clock,
  UserRound,
  Stethoscope,
  X,
} from "lucide-react";

import AdminSidebar from "../components/AdminSidebar";
import NotificationBell from "../components/NotificationBell";
import ProfileMenu from "../components/ProfileMenu";
import { api } from "../services/api";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const loadAppointments = async () => {
    try {
      setLoading(true);

      const response = await api.appointments.getAll();

      setAppointments(
        response.appointments ||
          response.data ||
          []
      );
    } catch (error) {
      console.error("Failed to load appointments:", error);
      alert(error.message || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const getPatientName = (appointment) => {
    return (
      appointment.patient?.name ||
      appointment.patientName ||
      "Unknown Patient"
    );
  };

  const getDoctorName = (appointment) => {
    return (
      appointment.doctor?.name ||
      appointment.doctorName ||
      "Unknown Doctor"
    );
  };

  const getStatus = (appointment) => {
    return appointment.status || "Scheduled";
  };

  const filteredAppointments = appointments.filter((appointment) => {
    const value = search.toLowerCase();

    return (
      getPatientName(appointment)
        .toLowerCase()
        .includes(value) ||
      getDoctorName(appointment)
        .toLowerCase()
        .includes(value) ||
      getStatus(appointment)
        .toLowerCase()
        .includes(value)
    );
  });

  const getStatusStyle = (status) => {
    const value = status.toLowerCase();

    if (value === "completed") {
      return "bg-green-100 text-green-700";
    }

    if (value === "cancelled" || value === "canceled") {
      return "bg-red-100 text-red-700";
    }

    if (value === "pending") {
      return "bg-yellow-100 text-yellow-700";
    }

    return "bg-teal-100 text-teal-700";
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ================= SIDEBAR ================= */}
      <AdminSidebar />

      {/* ================= MAIN CONTENT ================= */}
      <main className="ml-64">

        {/* ================= HEADER ================= */}
        <header className="h-20 bg-gradient-to-r from-white via-teal-50/60 to-slate-50 border-b border-teal-100 px-8 flex items-center justify-between shadow-sm">

          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Appointments
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              Monitor and manage patient appointments.
            </p>
          </div>

          <div className="flex items-center gap-5">

            {/* Search */}
            <div className="relative hidden lg:block">

              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-600"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search appointments..."
                className="w-64 bg-white border border-teal-100 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-400 shadow-sm"
              />

            </div>

            {/* REAL NOTIFICATION BELL */}
            <NotificationBell />

            <ProfileMenu />

          </div>

        </header>

        {/* ================= PAGE CONTENT ================= */}
        <div className="p-8">

          {/* Heading */}
          <div className="mb-7">

            <h2 className="text-xl font-bold text-slate-800">
              Appointment Management
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              View and monitor appointments between patients and doctors.
            </p>

          </div>

          {/* ================= STAT CARDS ================= */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">

            {/* Total */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">

              <p className="text-sm text-slate-500">
                Total Appointments
              </p>

              <h3 className="text-3xl font-bold text-slate-800 mt-2">
                {appointments.length}
              </h3>

            </div>

            {/* Scheduled */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">

              <p className="text-sm text-slate-500">
                Scheduled
              </p>

              <h3 className="text-3xl font-bold text-teal-600 mt-2">

                {
                  appointments.filter(
                    (appointment) =>
                      getStatus(appointment).toLowerCase() ===
                      "scheduled"
                  ).length
                }

              </h3>

            </div>

            {/* Completed */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">

              <p className="text-sm text-slate-500">
                Completed
              </p>

              <h3 className="text-3xl font-bold text-green-600 mt-2">

                {
                  appointments.filter(
                    (appointment) =>
                      getStatus(appointment).toLowerCase() ===
                      "completed"
                  ).length
                }

              </h3>

            </div>

            {/* Cancelled */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">

              <p className="text-sm text-slate-500">
                Cancelled
              </p>

              <h3 className="text-3xl font-bold text-red-600 mt-2">

                {
                  appointments.filter(
                    (appointment) => {
                      const status =
                        getStatus(appointment).toLowerCase();

                      return (
                        status === "cancelled" ||
                        status === "canceled"
                      );
                    }
                  ).length
                }

              </h3>

            </div>

          </div>

          {/* ================= APPOINTMENT LIST ================= */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="px-6 py-5 border-b border-slate-200">

              <h3 className="text-lg font-semibold text-slate-800">
                All Appointments
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Appointment records currently available in WithUSync.
              </p>

            </div>

            {/* Loading */}
            {loading ? (

              <div className="p-10 text-center text-slate-500">
                Loading appointments...
              </div>

            ) : filteredAppointments.length === 0 ? (

              <div className="p-10 text-center text-slate-500">
                No appointments found.
              </div>

            ) : (

              <div className="divide-y divide-slate-200">

                {filteredAppointments.map((appointment) => (

                  <div
                    key={appointment._id}
                    className="p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-6 hover:bg-slate-50 transition"
                  >

                    {/* Patient */}
                    <div className="flex items-center gap-4 min-w-[220px]">

                      <div className="w-12 h-12 rounded-full bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center">

                        <UserRound size={22} />

                      </div>

                      <div>

                        <p className="font-semibold text-slate-800">
                          {getPatientName(appointment)}
                        </p>

                        <p className="text-xs text-slate-500 mt-1">
                          Patient
                        </p>

                      </div>

                    </div>

                    {/* Doctor */}
                    <div className="flex items-center gap-3 min-w-[220px]">

                      <Stethoscope
                        size={19}
                        className="text-teal-600"
                      />

                      <div>

                        <p className="font-medium text-slate-800">
                          {getDoctorName(appointment)}
                        </p>

                        <p className="text-xs text-slate-500 mt-1">
                          Doctor
                        </p>

                      </div>

                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-3">

                      <CalendarDays
                        size={19}
                        className="text-teal-600"
                      />

                      <div>

                        <p className="text-sm font-medium text-slate-800">
                          {appointment.date || "Date not available"}
                        </p>

                        <p className="text-xs text-slate-500 mt-1">
                          Appointment Date
                        </p>

                      </div>

                    </div>

                    {/* Time */}
                    <div className="flex items-center gap-3">

                      <Clock
                        size={19}
                        className="text-teal-600"
                      />

                      <div>

                        <p className="text-sm font-medium text-slate-800">
                          {appointment.time || "Time not available"}
                        </p>

                        <p className="text-xs text-slate-500 mt-1">
                          Appointment Time
                        </p>

                      </div>

                    </div>

                    {/* Status + View */}
                    <div className="flex items-center gap-3">

                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-medium ${getStatusStyle(
                          getStatus(appointment)
                        )}`}
                      >
                        {getStatus(appointment)}
                      </span>

                      <button
                        onClick={() =>
                          setSelectedAppointment(appointment)
                        }
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition"
                      >
                        View
                      </button>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </div>

        </div>

      </main>

      {/* ================= APPOINTMENT DETAILS MODAL ================= */}
      {selectedAppointment && (

        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center px-4">

          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl">

            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">

              <div>

                <h2 className="text-xl font-bold text-slate-800">
                  Appointment Details
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  View complete appointment information.
                </p>

              </div>

              <button
                onClick={() => setSelectedAppointment(null)}
                className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X size={20} />
              </button>

            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">

              {/* Patient */}
              <div className="bg-slate-50 rounded-xl p-4">

                <p className="text-xs text-slate-500">
                  Patient
                </p>

                <p className="font-semibold text-slate-800 mt-1">
                  {getPatientName(selectedAppointment)}
                </p>

              </div>

              {/* Doctor */}
              <div className="bg-slate-50 rounded-xl p-4">

                <p className="text-xs text-slate-500">
                  Doctor
                </p>

                <p className="font-semibold text-slate-800 mt-1">
                  {getDoctorName(selectedAppointment)}
                </p>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Date */}
                <div className="bg-slate-50 rounded-xl p-4">

                  <p className="text-xs text-slate-500">
                    Date
                  </p>

                  <p className="font-medium text-slate-800 mt-1">
                    {selectedAppointment.date ||
                      "Not available"}
                  </p>

                </div>

                {/* Time */}
                <div className="bg-slate-50 rounded-xl p-4">

                  <p className="text-xs text-slate-500">
                    Time
                  </p>

                  <p className="font-medium text-slate-800 mt-1">
                    {selectedAppointment.time ||
                      "Not available"}
                  </p>

                </div>

                {/* Status */}
                <div className="bg-slate-50 rounded-xl p-4">

                  <p className="text-xs text-slate-500">
                    Status
                  </p>

                  <span
                    className={`inline-block mt-2 px-3 py-1.5 rounded-full text-xs font-medium ${getStatusStyle(
                      getStatus(selectedAppointment)
                    )}`}
                  >
                    {getStatus(selectedAppointment)}
                  </span>

                </div>

                {/* Reason */}
                <div className="bg-slate-50 rounded-xl p-4">

                  <p className="text-xs text-slate-500">
                    Reason
                  </p>

                  <p className="font-medium text-slate-800 mt-1">
                    {selectedAppointment.reason ||
                      "Not provided"}
                  </p>

                </div>

              </div>

              {/* Close */}
              <div className="flex justify-end pt-2">

                <button
                  onClick={() =>
                    setSelectedAppointment(null)
                  }
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium"
                >
                  Close
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default Appointments;
