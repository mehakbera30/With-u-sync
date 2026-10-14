import React, { useEffect, useState } from "react";
import {
  Search,
  CalendarDays,
  Check,
  X,
  Eye,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DoctorSidebar from "../components/DoctorSidebar";
import NotificationBell from "../components/NotificationBell";
import ProfileMenu from "../components/ProfileMenu";
import api, { getStoredUser } from "../services/api";
import { parseAppointmentDate } from "../utils/dateUtils";

const Appointments = () => {
  const navigate = useNavigate();

  // ================= STATES =================

  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState("");
  const [doctor, setDoctor] = useState(null);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  // ================= FETCH APPOINTMENTS =================

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await api.appointments.getAll();

      if (data.success) {
        setAppointments(data.appointments || []);
      }
    } catch (error) {
      console.error("Fetch appointments error:", error);

      setError(
        error.message || "Failed to load appointments."
      );
    } finally {
      setLoading(false);
    }
  };

  // ================= LOAD LOGGED-IN DOCTOR =================

  useEffect(() => {
    const loggedInUser = getStoredUser();

    if (loggedInUser) {
      setDoctor(loggedInUser);
    }

    fetchAppointments();
  }, []);

  // ================= UPDATE APPOINTMENT STATUS =================

  const updateStatus = async (id, status) => {
    try {
      setUpdating(true);
      setError("");

      const data =
        await api.appointments.updateStatus(
          id,
          status
        );

      if (data.success) {
        setAppointments((prevAppointments) =>
          prevAppointments.map(
            (appointment) =>
              appointment._id === id
                ? {
                    ...appointment,
                    status: status,
                  }
                : appointment
          )
        );
      }
    } catch (error) {
      console.error(
        "Update appointment error:",
        error
      );

      setError(
        error.message ||
          "Failed to update appointment."
      );
    } finally {
      setUpdating(false);
    }
  };

  // ================= SEARCH =================

  const filteredAppointments =
    appointments.filter((appointment) => {
      const searchText =
        search.toLowerCase();

      return (
        appointment.patientName
          ?.toLowerCase()
          .includes(searchText) ||
        appointment.type
          ?.toLowerCase()
          .includes(searchText) ||
        appointment.date
          ?.toLowerCase()
          .includes(searchText) ||
        appointment.status
          ?.toLowerCase()
          .includes(searchText)
      );
    });

  // ================= TODAY'S APPOINTMENTS =================

  const todaysAppointments =
    appointments.filter((appointment) => {
      if (!appointment.date) {
        return false;
      }

      const appointmentDate =
        parseAppointmentDate(appointment.date);

      const today = new Date();

      return (
        appointmentDate &&
        appointmentDate.toDateString() ===
        today.toDateString()
      );
    }).length;

  // ================= PENDING COUNT =================

  const pendingAppointments =
    appointments.filter(
      (appointment) =>
        appointment.status === "Pending"
    ).length;

  // ================= COMPLETED COUNT =================

  const completedAppointments =
    appointments.filter(
      (appointment) =>
        appointment.status === "Completed"
    ).length;

  // ================= DOCTOR INITIALS =================

  const doctorInitials = doctor?.name
    ? doctor.name
        .split(" ")
        .map((name) => name[0])
        .join("")
        .toUpperCase()
    : "DR";

  // ================= RENDER =================

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ================= SIDEBAR ================= */}

      <DoctorSidebar />

      {/* ================= MAIN ================= */}

      <main className="ml-64">

        {/* ================= HEADER ================= */}

        <div className="h-20 bg-gradient-to-r from-teal-100 border-teal-500 px-8 flex items-center justify-between shadow-sm">

          {/* Page Title */}

          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Appointments
            </h1>

            <p className="text-slate-500 mt-1">
              Manage your patient appointments.
            </p>
          </div>

          {/* ================= HEADER RIGHT ================= */}

          <div className="flex items-center gap-5">

            {/* ================= SEARCH ================= */}

            <div className="relative">

              <Search
                size={20}
                className="absolute left-4 top-3.5 text-teal-600"
              />

              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="w-64 h-12 pl-11 pr-4 bg-white border border-teal-100 rounded-xl outline-none focus:ring-2 focus:ring-teal-400"
              />

            </div>

            {/* ================= NOTIFICATION ================= */}

            <NotificationBell />

            <ProfileMenu />

          </div>

        </div>

        {/* ================= PAGE CONTENT ================= */}

        <div className="p-8">

          {/* ================= ERROR ================= */}

          {error && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl">
              {error}
            </div>
          )}

          {/* ================= SUMMARY CARDS ================= */}

          <div className="grid grid-cols-3 gap-6 mb-8">

            {/* Today's Appointments */}

            <div className="bg-white p-6 rounded-2xl border border-slate-200">

              <p className="text-slate-500">
                Today's Appointments
              </p>

              <h2 className="text-3xl font-bold text-slate-800 mt-2">
                {todaysAppointments}
              </h2>

            </div>

            {/* Pending */}

            <div className="bg-white p-6 rounded-2xl border border-slate-200">

              <p className="text-slate-500">
                Pending Requests
              </p>

              <h2 className="text-3xl font-bold text-slate-800 mt-2">
                {pendingAppointments}
              </h2>

            </div>

            {/* Completed */}

            <div className="bg-white p-6 rounded-2xl border border-slate-200">

              <p className="text-slate-500">
                Completed
              </p>

              <h2 className="text-3xl font-bold text-slate-800 mt-2">
                {completedAppointments}
              </h2>

            </div>

          </div>

          {/* ================= APPOINTMENTS CARD ================= */}

          <div className="bg-white rounded-2xl border border-slate-200 p-6">

            {/* Heading */}

            <div className="flex items-center gap-2 mb-6">

              <CalendarDays
                className="text-teal-600"
              />

              <h2 className="text-xl font-semibold text-slate-800">
                All Appointments
              </h2>

            </div>

            {/* ================= LOADING ================= */}

            {loading ? (

              <div className="text-center py-12 text-slate-500">
                Loading appointments...
              </div>

            ) : filteredAppointments.length === 0 ? (

              /* ================= EMPTY ================= */

              <div className="text-center py-12 text-slate-500">
                No appointments found.
              </div>

            ) : (

              /* ================= APPOINTMENT LIST ================= */

              <div className="space-y-4">

                {filteredAppointments.map(
                  (appointment) => (

                    <div
                      key={appointment._id}
                      className="flex items-center justify-between p-5 bg-slate-50 rounded-xl"
                    >

                      {/* ================= PATIENT ================= */}

                      <div className="flex items-center gap-4">

                        {/* Patient Avatar */}

                        <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-semibold">

                          {appointment.patientName
                            ?.split(" ")
                            .map(
                              (name) =>
                                name[0]
                            )
                            .join("")
                            .toUpperCase()}

                        </div>

                        {/* Patient Information */}

                        <div>

                          <h3 className="font-semibold text-slate-800">

                            {appointment.patientName}

                          </h3>

                          <p className="text-sm text-slate-500">

                            {appointment.type}

                          </p>

                          {appointment.reason && (
                            <p className="text-xs text-slate-400 mt-1">

                              Reason:{" "}
                              {appointment.reason}

                            </p>
                          )}

                        </div>

                      </div>

                      {/* ================= DATE & TIME ================= */}

                      <div className="text-center">

                        <p className="font-medium text-slate-700">

                          {appointment.date}

                        </p>

                        <p className="text-sm text-slate-500">

                          {appointment.time}

                        </p>

                      </div>

                      {/* ================= STATUS ================= */}

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          appointment.status ===
                          "Confirmed"
                            ? "bg-green-100 text-green-700"
                            : appointment.status ===
                              "Pending"
                            ? "bg-amber-100 text-amber-700"
                            : appointment.status ===
                              "Completed"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >

                        {appointment.status}

                      </span>

                      {/* ================= ACTIONS ================= */}

                      <div className="flex items-center gap-2">

                        {/* Pending */}

                        {appointment.status ===
                          "Pending" && (
                          <>

                            {/* Confirm */}

                            <button
                              disabled={updating}
                              onClick={() =>
                                updateStatus(
                                  appointment._id,
                                  "Confirmed"
                                )
                              }
                              className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition disabled:opacity-50"
                              title="Confirm appointment"
                            >

                              <Check size={18} />

                            </button>

                            {/* Cancel */}

                            <button
                              disabled={updating}
                              onClick={() =>
                                updateStatus(
                                  appointment._id,
                                  "Cancelled"
                                )
                              }
                              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition disabled:opacity-50"
                              title="Cancel appointment"
                            >

                              <X size={18} />

                            </button>

                          </>
                        )}

                        {/* Confirmed */}

                        {appointment.status ===
                          "Confirmed" && (

                          <button
                            disabled={updating}
                            onClick={() =>
                              updateStatus(
                                appointment._id,
                                "Completed"
                              )
                            }
                            className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm transition disabled:opacity-50"
                          >

                            Complete

                          </button>

                        )}

                        {/* View Patient */}

                        <button
                          onClick={() => {

                            const patientId =
                              typeof appointment.patient ===
                              "object"
                                ? appointment
                                    .patient?._id
                                : appointment.patient;

                            if (patientId) {

                              navigate(
                                `/doctor/patients/${patientId}`
                              );

                            }

                          }}
                          className="p-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition"
                          title="View patient"
                        >

                          <Eye size={18} />

                        </button>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

        </div>

      </main>

    </div>
  );
};

export default Appointments;