import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  FileText,
  Pill,
  Settings,
  LogOut,
} from "lucide-react";

const Sidebar = () => {
  return (
    <aside className="w-64 bg-slate-900 text-white fixed left-0 top-0 h-screen flex flex-col">

      <div className="px-6 py-6 flex items-center gap-3 border-b border-slate-800">
        <div className="w-11 h-11 rounded-xl overflow-hidden bg-white flex items-center justify-center border border-teal-200 shadow-sm">
          <img src="/withusync-logo.png" alt="WithUSync" className="w-full h-full object-contain" />
        </div>

        <div>
          <h1 className="text-xl font-bold">WithUSync</h1>
          <p className="text-xs text-slate-400">
            Healthcare Portal
          </p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">

        <NavLink
          to="/patient/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg ${
              isActive
                ? "bg-teal-600 text-white"
                : "text-slate-300 hover:bg-slate-800"
            }`
          }
        >
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>

        <NavLink
          to="/patient/appointments"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg ${
              isActive
                ? "bg-teal-600 text-white"
                : "text-slate-300 hover:bg-slate-800"
            }`
          }
        >
          <CalendarDays size={20} />
          Appointments
        </NavLink>

        <NavLink
          to="/patient/calendar"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg ${
              isActive
                ? "bg-teal-600 text-white"
                : "text-slate-300 hover:bg-slate-800"
            }`
          }
        >
          <CalendarDays size={20} />
          Calendar
        </NavLink>

        <NavLink
          to="/patient/reports"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg ${
              isActive
                ? "bg-teal-600 text-white"
                : "text-slate-300 hover:bg-slate-800"
            }`
          }
        >
          <FileText size={20} />
          Reports
        </NavLink>

        <NavLink
          to="/patient/prescriptions"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg ${
              isActive
                ? "bg-teal-600 text-white"
                : "text-slate-300 hover:bg-slate-800"
            }`
          }
        >
          <Pill size={20} />
          Prescriptions
        </NavLink>

        <NavLink
          to="/patient/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg ${
              isActive
                ? "bg-teal-600 text-white"
                : "text-slate-300 hover:bg-slate-800"
            }`
          }
        >
          <Settings size={20} />
          Settings
        </NavLink>

      </nav>

      <div className="px-4 pb-6">

        <NavLink
          to="/login"
          onClick={() => {
            localStorage.removeItem("careconnect_token");
            localStorage.removeItem("careconnect_user");
          }}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800"
        >
          <LogOut size={20} />
          Logout
        </NavLink>

      </div>

    </aside>
  );
};

export default Sidebar;