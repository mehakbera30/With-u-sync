import React, { useEffect, useState } from "react";
import {
  Search,
  Eye,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DoctorSidebar from "../components/DoctorSidebar";
import NotificationBell from "../components/NotificationBell";
import ProfileMenu from "../components/ProfileMenu";
import api, { getStoredUser } from "../services/api";
import { parseAppointmentDate } from "../utils/dateUtils";

const Patients = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  const [doctor, setDoctor] = useState(null);

  const [patients, setPatients] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ================= LOAD PAGE =================

  useEffect(() => {
    const loggedInUser = getStoredUser();

    setDoctor(loggedInUser);

    fetchPatients();
  }, []);

  // ================= FETCH PATIENTS =================

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        patientsResponse,
        appointmentsResponse,
      ] = await Promise.all([
        api.users.getPatients(),
        api.appointments.getAll(),
      ]);

      const patientsData =
        patientsResponse.patients || [];

      const appointmentsData =
        appointmentsResponse.appointments || [];

      // ================= CREATE LAST VISIT MAP =================

      const lastVisitMap = {};

      appointmentsData.forEach((appointment) => {
        const patientId =
          appointment.patient?._id ||
          appointment.patient;

        if (!patientId) {
          return;
        }

        const appointmentDate =
          parseAppointmentDate(appointment.date);

        if (appointmentDate && (
          !lastVisitMap[patientId] ||
          appointmentDate >
            parseAppointmentDate(lastVisitMap[patientId])
        )) {
          lastVisitMap[patientId] =
            appointment.date;
        }
      });

      // ================= FORMAT PATIENT DATA =================

      const formattedPatients =
        patientsData.map((patient) => {

          return {
            id: patient._id,

            name: patient.name || "Unknown Patient",

            age: patient.age || "-",

            gender: patient.gender || "-",

            condition:
              patient.condition ||
              "No condition recorded",

            bloodGroup:
              patient.bloodGroup || "-",

            lastVisit:
              lastVisitMap[patient._id] ||
              "No visit yet",
          };
        });

      setPatients(formattedPatients);

    } catch (error) {
      console.error(
        "Patients page error:",
        error
      );

      setError(
        error.message ||
          "Failed to load patients."
      );
    } finally {
      setLoading(false);
    }
  };

  // ================= SEARCH =================

  const filteredPatients =
    patients.filter((patient) =>
      patient.name
        .toLowerCase()
        .includes(search.toLowerCase())
    );

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
                My Patients
              </h1>

              <p className="text-slate-500 mt-1">
                View and manage your patients.
              </p>

            </div>

          </div>

          <div className="flex items-center justify-center h-[70vh]">

            <div className="text-center">

              <p className="text-lg font-medium text-slate-700">
                Loading patients...
              </p>

              <p className="text-sm text-slate-400 mt-2">
                Fetching patient information.
              </p>

            </div>

          </div>

        </main>

      </div>
    );
  }

  // ================= MAIN UI =================

  return (
    <div className="min-h-screen bg-slate-50">

      <DoctorSidebar />

      <main className="ml-64">

        {/* ================= HEADER ================= */}

        <div className="h-20 bg-gradient-to-r from-teal-100 border-teal-500 px-8 flex items-center justify-between shadow-sm">

          <div>

            <h1 className="text-2xl font-bold text-slate-800">
              My Patients
            </h1>

            <p className="text-slate-500 mt-1">
              View and manage your patients.
            </p>

          </div>

          <div className="flex items-center gap-5">

            {/* Search */}

            <div className="relative">

              <Search
                size={20}
                className="absolute left-4 top-3.5 text-teal-600"
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search..."
                className="w-64 h-12 pl-11 pr-4 bg-white border border-teal-100 rounded-xl outline-none focus:ring-2 focus:ring-teal-400 text-slate-700"
              />

            </div>

            {/* Notification */}

            <NotificationBell />

            <ProfileMenu />

          </div>

        </div>

        {/* ================= CONTENT ================= */}

        <div className="p-8">

          {/* Error */}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl">

              {error}

            </div>
          )}

          {/* ================= PATIENT CARD ================= */}

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">

            {/* Card Header */}

            <div className="p-6 border-b border-slate-200 flex items-center gap-3">

              <div className="p-3 bg-teal-50 rounded-xl">

                <Users className="text-teal-600" />

              </div>

              <div>

                <h2 className="text-xl font-semibold text-slate-800">
                  Patient List
                </h2>

                <p className="text-sm text-slate-500">

                  {filteredPatients.length}{" "}
                  {filteredPatients.length === 1
                    ? "patient"
                    : "patients"}{" "}
                  found

                </p>

              </div>

            </div>

            {/* ================= TABLE ================= */}

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-slate-50">

                  <tr>

                    <th className="text-left px-6 py-4 text-sm text-slate-500">
                      Patient
                    </th>

                    <th className="text-left px-6 py-4 text-sm text-slate-500">
                      Age
                    </th>

                    <th className="text-left px-6 py-4 text-sm text-slate-500">
                      Gender
                    </th>

                    <th className="text-left px-6 py-4 text-sm text-slate-500">
                      Condition
                    </th>

                    <th className="text-left px-6 py-4 text-sm text-slate-500">
                      Blood Group
                    </th>

                    <th className="text-left px-6 py-4 text-sm text-slate-500">
                      Last Visit
                    </th>

                    <th className="text-left px-6 py-4 text-sm text-slate-500">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredPatients.length === 0 ? (

                    <tr>

                      <td
                        colSpan="7"
                        className="text-center py-12 text-slate-500"
                      >

                        {search
                          ? "No patients found for your search."
                          : "No patients found."}

                      </td>

                    </tr>

                  ) : (

                    filteredPatients.map(
                      (patient) => (

                        <tr
                          key={patient.id}
                          className="border-t border-slate-100 hover:bg-slate-50 transition"
                        >

                          {/* Patient */}

                          <td className="px-6 py-4">

                            <div className="flex items-center gap-3">

                              <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-semibold">

                                {patient.name
                                  .split(" ")
                                  .map(
                                    (name) =>
                                      name[0]
                                  )
                                  .join("")
                                  .toUpperCase()}

                              </div>

                              <span className="font-medium text-slate-800">

                                {patient.name}

                              </span>

                            </div>

                          </td>

                          {/* Age */}

                          <td className="px-6 py-4 text-slate-600">

                            {patient.age}

                          </td>

                          {/* Gender */}

                          <td className="px-6 py-4 text-slate-600">

                            {patient.gender}

                          </td>

                          {/* Condition */}

                          <td className="px-6 py-4">

                            <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm">

                              {patient.condition}

                            </span>

                          </td>

                          {/* Blood Group */}

                          <td className="px-6 py-4 text-slate-600">

                            {patient.bloodGroup}

                          </td>

                          {/* Last Visit */}

                          <td className="px-6 py-4 text-slate-500">

                            {patient.lastVisit}

                          </td>

                          {/* Action */}

                          <td className="px-6 py-4">

                            <button
                              onClick={() =>
                                navigate(
                                  `/doctor/patients/${patient.id}`
                                )
                              }
                              className="flex items-center gap-2 px-3 py-2 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition"
                            >

                              <Eye size={17} />

                              View

                            </button>

                          </td>

                        </tr>

                      )
                    )

                  )}

                </tbody>

              </table>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
};

export default Patients;