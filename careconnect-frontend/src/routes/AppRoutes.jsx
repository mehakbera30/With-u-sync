import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { getStoredToken, getStoredUser } from "../services/api";

// ================= AUTH =================
import Login from "../Pages/Auth/Login";
import Register from "../Pages/Auth/Register";

// ================= PATIENT =================
import PatientDashboard from "../Patient/Dashboard";
import PatientAppointments from "../Patient/Appointments";
import PatientCalendar from "../Patient/Calendar";
import PatientReports from "../Patient/Reports";
import PatientPrescriptions from "../Patient/Prescriptions";
import PatientProfile from "../Patient/Profile";
import PatientSettings from "../Patient/Settings";

// ================= DOCTOR =================
import DoctorDashboard from "../Doctor/Dashboard";
import DoctorAppointments from "../Doctor/Appointments";
import DoctorPatients from "../Doctor/Patients";
import PatientDetails from "../Doctor/PatientDetails";
import DoctorReports from "../Doctor/Reports";
import DoctorSettings from "../Doctor/Settings";

// ================= ADMIN =================
import AdminDashboard from "../Admin/Dashboard";
import AdminDoctors from "../Admin/Doctors";
import AdminPatients from "../Admin/Patients";
import AdminAppointments from "../Admin/Appointments";
import AdminReports from "../Admin/Reports";
import AdminSettings from "../Admin/Settings";


const ProtectedRoute = ({ roles, children }) => {
  const location = useLocation();
  const token = getStoredToken();
  const user = getStoredUser();

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles && !roles.includes(user.role)) {
    const destination =
      user.role === "admin"
        ? "/admin/dashboard"
        : user.role === "doctor"
        ? "/doctor/dashboard"
        : "/patient/dashboard";

    return <Navigate to={destination} replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>

      {/* ================= AUTH ================= */}

      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />


      {/* ================= PATIENT ================= */}

      <Route
        path="/patient/dashboard"
        element={<ProtectedRoute roles={["patient"]}><PatientDashboard /></ProtectedRoute>}
      />

      <Route
        path="/patient/appointments"
        element={<ProtectedRoute roles={["patient"]}><PatientAppointments /></ProtectedRoute>}
      />

      <Route
        path="/patient/calendar"
        element={<ProtectedRoute roles={["patient"]}><PatientCalendar /></ProtectedRoute>}
      />

      <Route
        path="/patient/reports"
        element={<ProtectedRoute roles={["patient"]}><PatientReports /></ProtectedRoute>}
      />

      <Route
        path="/patient/prescriptions"
        element={<ProtectedRoute roles={["patient"]}><PatientPrescriptions /></ProtectedRoute>}
      />

      <Route
        path="/patient/profile"
        element={<ProtectedRoute roles={["patient"]}><PatientProfile /></ProtectedRoute>}
      />

      <Route
        path="/patient/settings"
        element={<ProtectedRoute roles={["patient"]}><PatientSettings /></ProtectedRoute>}
      />


      {/* ================= DOCTOR ================= */}

      <Route
        path="/doctor/dashboard"
        element={<ProtectedRoute roles={["doctor"]}><DoctorDashboard /></ProtectedRoute>}
      />

      <Route
        path="/doctor/appointments"
        element={<ProtectedRoute roles={["doctor"]}><DoctorAppointments /></ProtectedRoute>}
      />

      <Route
        path="/doctor/patients"
        element={<ProtectedRoute roles={["doctor"]}><DoctorPatients /></ProtectedRoute>}
      />

      <Route
        path="/doctor/patients/:id"
        element={<ProtectedRoute roles={["doctor"]}><PatientDetails /></ProtectedRoute>}
      />

      <Route
        path="/doctor/patients/:id/reports"
        element={<ProtectedRoute roles={["doctor"]}><PatientDetails /></ProtectedRoute>}
      />

      <Route
        path="/doctor/reports"
        element={<ProtectedRoute roles={["doctor"]}><DoctorReports /></ProtectedRoute>}
      />

      <Route
        path="/doctor/reports/:id"
        element={<ProtectedRoute roles={["doctor"]}><DoctorReports /></ProtectedRoute>}
      />

      <Route
        path="/doctor/settings"
        element={<ProtectedRoute roles={["doctor"]}><DoctorSettings /></ProtectedRoute>}
      />


      {/* ================= ADMIN ================= */}

      <Route
        path="/admin/dashboard"
        element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>}
      />

      <Route
        path="/admin/doctors"
        element={<ProtectedRoute roles={["admin"]}><AdminDoctors /></ProtectedRoute>}
      />

      <Route
        path="/admin/patients"
        element={<ProtectedRoute roles={["admin"]}><AdminPatients /></ProtectedRoute>}
      />

      <Route
        path="/admin/appointments"
        element={<ProtectedRoute roles={["admin"]}><AdminAppointments /></ProtectedRoute>}
      />

      <Route
        path="/admin/reports"
        element={<ProtectedRoute roles={["admin"]}><AdminReports /></ProtectedRoute>}
      />

      <Route
        path="/admin/settings"
        element={<ProtectedRoute roles={["admin"]}><AdminSettings /></ProtectedRoute>}
      />


      {/* ================= INVALID URL ================= */}

      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />

    </Routes>
  );
};

export default AppRoutes;