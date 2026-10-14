import React, { useEffect, useState } from "react";
import {
  Search,
  Users,
  CalendarDays,
  Clock,
  CheckCircle,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DoctorSidebar from "../components/DoctorSidebar";
import NotificationBell from "../components/NotificationBell";
import ProfileMenu from "../components/ProfileMenu";
import api, { getStoredUser } from "../services/api";
import { parseAppointmentDate } from "../utils/dateUtils";

const Dashboard = () => {
  const navigate = useNavigate();

  // ================= STATES =================

  const [doctor, setDoctor] = useState(null);

  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [reports, setReports] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  // ================= LOAD DASHBOARD DATA =================

  useEffect(() => {
    const loggedInUser = getStoredUser();

    if (loggedInUser) {
      setDoctor(loggedInUser);
    }

    fetchDashboardData();
  }, []);

  // ================= FETCH DATA =================

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        appointmentsResponse,
        patientsResponse,
        reportsResponse,
      ] = await Promise.all([
        api.appointments.getAll(),
        api.users.getPatients(),
        api.reports.getAll(),
      ]);

      // ================= APPOINTMENTS =================

      if (appointmentsResponse.success) {
        setAppointments(
          appointmentsResponse.appointments || []
        );
      }

      // ================= PATIENTS =================

      if (patientsResponse.success) {
        setPatients(
          patientsResponse.patients || []
        );
      }

      // ================= REPORTS =================

      if (reportsResponse.success) {
        setReports(
          reportsResponse.reports || []
        );
      }

    } catch (error) {
      console.error(
        "Dashboard data error:",
        error
      );

      setError(
        error.message ||
          "Failed to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  // ================= TODAY'S DATE =================

  const today = new Date();

  // Convert date into the same format used by appointments
  const todayString =
    today.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  // ================= TODAY'S APPOINTMENTS =================

  const todaysAppointments =
    appointments.filter((appointment) => {

      if (!appointment.date) {
        return false;
      }

      const appointmentDate =
        parseAppointmentDate(appointment.date);

      if (appointmentDate) {
        return (
          appointmentDate.toDateString() ===
          today.toDateString()
        );
      }

      return (
        appointment.date.toLowerCase() ===
        todayString.toLowerCase()
      );
    });

  // ================= PENDING =================

  const pendingAppointments =
    appointments.filter(
      (appointment) =>
        appointment.status === "Pending"
    );

  // ================= COMPLETED =================

  const completedAppointments =
    appointments.filter(
      (appointment) =>
        appointment.status === "Completed"
    );

  // ================= SEARCH =================

  const searchResults =
    todaysAppointments.filter(
      (appointment) => {

        const searchText =
          search.toLowerCase();

        return (
          appointment.patientName
            ?.toLowerCase()
            .includes(searchText) ||
          appointment.type
            ?.toLowerCase()
            .includes(searchText)
        );
      }
    );

  // ================= RECENT PATIENTS =================

  const recentPatients =
    [...patients]
      .sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt) -
          new Date(a.updatedAt || a.createdAt)
      )
      .slice(0, 3);

  // ================= RECENT REPORTS =================

  const recentReports =
    [...reports]
      .sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      )
      .slice(0, 3);

  // ================= DOCTOR INITIALS =================

  const doctorInitials = doctor?.name
    ? doctor.name
        .split(" ")
        .map((name) => name[0])
        .join("")
        .toUpperCase()
    : "DR";

  // ================= LOADING =================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">

        <DoctorSidebar />

        <main className="ml-64">

          <div className="h-20 bg-gradient-to-r from-teal-100 border-teal-500 px-8 flex items-center justify-between shadow-sm">

            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Doctor Dashboard
              </h1>

              <p className="text-slate-500 mt-1">
                Manage your patients and appointments.
              </p>
            </div>

          </div>

          <div className="flex items-center justify-center h-[70vh]">

            <div className="text-center">

              <div className="text-lg font-medium text-slate-700">
                Loading dashboard...
              </div>

              <p className="text-sm text-slate-400 mt-2">
                Fetching your latest information.
              </p>

            </div>

          </div>

        </main>

      </div>
    );
  }

  // ================= UI =================

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
              Doctor Dashboard
            </h1>

            <p className="text-slate-500 mt-1">
              Manage your patients and appointments.
            </p>

          </div>

          {/* Header Right */}

          <div className="flex items-center gap-5">

            {/* Search */}

            <div className="relative">

              <Search
                size={20}
                className="absolute left-4 top-3.5 text-teal-600"
              />

              <input
                type="text"
                placeholder="Search today's appointments..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="w-64 h-12 pl-11 pr-4 bg-white border border-teal-100 rounded-xl outline-none focus:ring-2 focus:ring-teal-400 text-slate-700"
              />

            </div>
            <NotificationBell />

            <ProfileMenu />

          </div>

        </div>

        {/* ================= CONTENT ================= */}

        <div className="p-8">

          {/* ================= ERROR ================= */}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl">
              {error}
            </div>
          )}

          {/* ================= WELCOME ================= */}

          <div className="bg-gradient-to-r from-teal-600 to-teal-500 rounded-2xl p-6 text-white mb-8">

            <h2 className="text-2xl font-bold">

              Welcome back,{" "}
              {doctor?.name || "Doctor"} 👋

            </h2>

            <p className="mt-2 text-teal-50">

              Here is an overview of your patients
              and today's appointments.

            </p>

          </div>

          {/* ================= STATS ================= */}

          <div className="grid grid-cols-4 gap-6 mb-8">

            {/* Total Patients */}

            <div className="bg-white p-6 rounded-2xl border border-slate-200">

              <div className="flex justify-between items-start">

                <div>

                  <p className="text-slate-500 text-sm">
                    Total Patients
                  </p>

                  <h3 className="text-3xl font-bold text-slate-800 mt-2">
                    {patients.length}
                  </h3>

                </div>

                <div className="bg-teal-50 p-3 rounded-xl">

                  <Users
                    className="text-teal-600"
                    size={22}
                  />

                </div>

              </div>

            </div>

            {/* Today's Appointments */}

            <div className="bg-white p-6 rounded-2xl border border-slate-200">

              <div className="flex justify-between items-start">

                <div>

                  <p className="text-slate-500 text-sm">
                    Today's Appointments
                  </p>

                  <h3 className="text-3xl font-bold text-slate-800 mt-2">
                    {todaysAppointments.length}
                  </h3>

                </div>

                <div className="bg-blue-50 p-3 rounded-xl">

                  <CalendarDays
                    className="text-blue-600"
                    size={22}
                  />

                </div>

              </div>

            </div>

            {/* Pending */}

            <div className="bg-white p-6 rounded-2xl border border-slate-200">

              <div className="flex justify-between items-start">

                <div>

                  <p className="text-slate-500 text-sm">
                    Pending Requests
                  </p>

                  <h3 className="text-3xl font-bold text-slate-800 mt-2">
                    {pendingAppointments.length}
                  </h3>

                </div>

                <div className="bg-amber-50 p-3 rounded-xl">

                  <Clock
                    className="text-amber-600"
                    size={22}
                  />

                </div>

              </div>

            </div>

            {/* Completed */}

            <div className="bg-white p-6 rounded-2xl border border-slate-200">

              <div className="flex justify-between items-start">

                <div>

                  <p className="text-slate-500 text-sm">
                    Completed
                  </p>

                  <h3 className="text-3xl font-bold text-slate-800 mt-2">
                    {completedAppointments.length}
                  </h3>

                </div>

                <div className="bg-green-50 p-3 rounded-xl">

                  <CheckCircle
                    className="text-green-600"
                    size={22}
                  />

                </div>

              </div>

            </div>

          </div>

          {/* ================= TODAY'S APPOINTMENTS ================= */}

          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8">

            <div className="flex items-center justify-between mb-6">

              <h2 className="text-xl font-semibold text-slate-800">
                Today's Appointments
              </h2>

              <button
                onClick={() =>
                  navigate("/doctor/appointments")
                }
                className="text-teal-600 text-sm font-medium hover:text-teal-700"
              >
                View All
              </button>

            </div>

            {searchResults.length === 0 ? (

              <div className="text-center py-10 text-slate-500">

                No appointments for today.

              </div>

            ) : (

              <div className="space-y-4">

                {searchResults.slice(0, 5).map(
                  (appointment) => {

                    const initials =
                      appointment.patientName
                        ?.split(" ")
                        .map(
                          (name) =>
                            name[0]
                        )
                        .join("")
                        .toUpperCase();

                    return (

                      <div
                        key={appointment._id}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"
                      >

                        {/* Patient */}

                        <div className="flex items-center gap-4">

                          <div className="w-11 h-11 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-semibold">

                            {initials || "PT"}

                          </div>

                          <div>

                            <h3 className="font-semibold text-slate-800">

                              {appointment.patientName ||
                                "Patient"}

                            </h3>

                            <p className="text-sm text-slate-500">

                              {appointment.type ||
                                "General Consultation"}

                            </p>

                          </div>

                        </div>

                        {/* Time */}

                        <div className="text-right">

                          <p className="font-medium text-slate-700">

                            {appointment.time}

                          </p>

                          <span
                            className={`text-xs ${
                              appointment.status ===
                              "Pending"
                                ? "text-amber-600"
                                : appointment.status ===
                                  "Completed"
                                ? "text-blue-600"
                                : "text-green-600"
                            }`}
                          >

                            {appointment.status}

                          </span>

                        </div>

                      </div>

                    );
                  }
                )}

              </div>

            )}

          </div>

          {/* ================= BOTTOM SECTIONS ================= */}

          <div className="grid grid-cols-2 gap-6">

            {/* ================= RECENT PATIENTS ================= */}

            <div className="bg-white rounded-2xl border border-slate-200 p-6">

              <div className="flex justify-between items-center mb-5">

                <h2 className="text-xl font-semibold text-slate-800">
                  Recent Patients
                </h2>

                <Users
                  size={20}
                  className="text-teal-600"
                />

              </div>

              {recentPatients.length === 0 ? (

                <p className="text-center py-6 text-slate-500">
                  No patients found.
                </p>

              ) : (

                <div className="space-y-4">

                  {recentPatients.map(
                    (patient) => (

                      <div
                        key={patient._id}
                        className="flex justify-between items-center"
                      >

                        <div>

                          <p className="font-medium text-slate-800">
                            {patient.name}
                          </p>

                          <p className="text-sm text-slate-500">
                            {patient.condition ||
                              "No condition recorded"}
                          </p>

                        </div>

                        <p className="text-sm text-slate-400">

                          {patient.updatedAt
                            ? new Date(
                                patient.updatedAt
                              ).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )
                            : "-"}

                        </p>

                      </div>

                    )
                  )}

                </div>

              )}

            </div>

            {/* ================= RECENT REPORTS ================= */}

            <div className="bg-white rounded-2xl border border-slate-200 p-6">

              <div className="flex justify-between items-center mb-5">

                <h2 className="text-xl font-semibold text-slate-800">
                  Recent Reports
                </h2>

                <FileText
                  size={20}
                  className="text-teal-600"
                />

              </div>

              {recentReports.length === 0 ? (

                <p className="text-center py-6 text-slate-500">
                  No reports found.
                </p>

              ) : (

                <div className="space-y-4">

                  {recentReports.map(
                    (report) => (

                      <div
                        key={report._id}
                        className="flex justify-between items-center"
                      >

                        <div>

                          <p className="font-medium text-slate-800">
                            {report.name}
                          </p>

                          <p className="text-sm text-slate-500">
                            {report.patientName ||
                              report.patient?.name ||
                              "Patient"}
                          </p>

                        </div>

                        <p className="text-sm text-slate-400">

                          {report.date ||
                            (report.createdAt
                              ? new Date(
                                  report.createdAt
                                ).toLocaleDateString(
                                  "en-GB",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )
                              : "-")}

                        </p>

                      </div>

                    )
                  )}

                </div>

              )}

            </div>

          </div>

        </div>

      </main>

    </div>
  );
};

export default Dashboard;