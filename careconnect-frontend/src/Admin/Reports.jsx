import React, { useEffect, useState } from "react";
import {
  Search,
  FileText,
  UserRound,
  Stethoscope,
  CalendarDays,
  X,
} from "lucide-react";

import AdminSidebar from "../components/AdminSidebar";
import NotificationBell from "../components/NotificationBell";
import ProfileMenu from "../components/ProfileMenu";
import { api } from "../services/api";

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);

  const loadReports = async () => {
    try {
      setLoading(true);

      const response = await api.reports.getAll();

      setReports(response.reports || response.data || []);
    } catch (error) {
      console.error("Failed to load reports:", error);
      alert(error.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const getPatientName = (report) => {
    return (
      report.patient?.name ||
      report.patientName ||
      "Unknown Patient"
    );
  };

  const getDoctorName = (report) => {
    return (
      report.doctor?.name ||
      report.doctorName ||
      "Not assigned"
    );
  };

  const getStatus = (report) => {
    return report.status || "Pending";
  };

  const filteredReports = reports.filter((report) => {
    const value = search.toLowerCase();

    return (
      getPatientName(report)
        .toLowerCase()
        .includes(value) ||
      getDoctorName(report)
        .toLowerCase()
        .includes(value) ||
      report.title?.toLowerCase().includes(value) ||
      report.reportType?.toLowerCase().includes(value) ||
      getStatus(report).toLowerCase().includes(value)
    );
  });

  const getStatusStyle = (status) => {
    const value = status.toLowerCase();

    if (value === "reviewed" || value === "completed") {
      return "bg-green-100 text-green-700";
    }

    if (value === "pending") {
      return "bg-yellow-100 text-yellow-700";
    }

    if (value === "rejected") {
      return "bg-red-100 text-red-700";
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
              Reports
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              Monitor patient reports and medical records.
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
                placeholder="Search reports..."
                className="w-64 bg-white border border-teal-100 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-400 shadow-sm"
              />

            </div>

            {/* Working Notification Bell */}
            <NotificationBell />

            <ProfileMenu />

          </div>

        </header>

        {/* ================= PAGE CONTENT ================= */}
        <div className="p-8">

          {/* Heading */}
          <div className="mb-7">

            <h2 className="text-xl font-bold text-slate-800">
              Report Management
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              View patient reports and track their review status.
            </p>

          </div>

          {/* ================= STAT CARDS ================= */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

            {/* Total Reports */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">

              <p className="text-sm text-slate-500">
                Total Reports
              </p>

              <h3 className="text-3xl font-bold text-slate-800 mt-2">
                {reports.length}
              </h3>

            </div>

            {/* Pending */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">

              <p className="text-sm text-slate-500">
                Pending Review
              </p>

              <h3 className="text-3xl font-bold text-yellow-600 mt-2">
                {
                  reports.filter(
                    (report) =>
                      getStatus(report).toLowerCase() ===
                      "pending"
                  ).length
                }
              </h3>

            </div>

            {/* Reviewed */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">

              <p className="text-sm text-slate-500">
                Reviewed Reports
              </p>

              <h3 className="text-3xl font-bold text-green-600 mt-2">
                {
                  reports.filter((report) => {
                    const status =
                      getStatus(report).toLowerCase();

                    return (
                      status === "reviewed" ||
                      status === "completed"
                    );
                  }).length
                }
              </h3>

            </div>

          </div>

          {/* ================= REPORT LIST ================= */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="px-6 py-5 border-b border-slate-200">

              <h3 className="text-lg font-semibold text-slate-800">
                Patient Reports
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Reports currently available in WithUSync.
              </p>

            </div>

            {/* Loading */}
            {loading ? (

              <div className="p-10 text-center text-slate-500">
                Loading reports...
              </div>

            ) : filteredReports.length === 0 ? (

              <div className="p-10 text-center text-slate-500">
                No reports found.
              </div>

            ) : (

              <div className="divide-y divide-slate-200">

                {filteredReports.map((report) => (

                  <div
                    key={report._id}
                    className="p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-6 hover:bg-slate-50 transition"
                  >

                    {/* Report */}
                    <div className="flex items-center gap-4 min-w-[230px]">

                      <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center">

                        <FileText size={22} />

                      </div>

                      <div>

                        <p className="font-semibold text-slate-800">
                          {report.title ||
                            report.reportType ||
                            "Medical Report"}
                        </p>

                        <p className="text-xs text-slate-500 mt-1">
                          Medical Report
                        </p>

                      </div>

                    </div>

                    {/* Patient */}
                    <div className="flex items-center gap-3 min-w-[200px]">

                      <UserRound
                        size={18}
                        className="text-teal-600"
                      />

                      <div>

                        <p className="text-sm font-medium text-slate-800">
                          {getPatientName(report)}
                        </p>

                        <p className="text-xs text-slate-500 mt-1">
                          Patient
                        </p>

                      </div>

                    </div>

                    {/* Doctor */}
                    <div className="flex items-center gap-3 min-w-[200px]">

                      <Stethoscope
                        size={18}
                        className="text-teal-600"
                      />

                      <div>

                        <p className="text-sm font-medium text-slate-800">
                          {getDoctorName(report)}
                        </p>

                        <p className="text-xs text-slate-500 mt-1">
                          Doctor
                        </p>

                      </div>

                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-3">

                      <CalendarDays
                        size={18}
                        className="text-teal-600"
                      />

                      <div>

                        <p className="text-sm font-medium text-slate-800">
                          {report.createdAt
                            ? new Date(
                                report.createdAt
                              ).toLocaleDateString()
                            : report.date ||
                              "Not available"}
                        </p>

                        <p className="text-xs text-slate-500 mt-1">
                          Report Date
                        </p>

                      </div>

                    </div>

                    {/* Status + View */}
                    <div className="flex items-center gap-3">

                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-medium ${getStatusStyle(
                          getStatus(report)
                        )}`}
                      >
                        {getStatus(report)}
                      </span>

                      <button
                        onClick={() =>
                          setSelectedReport(report)
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

      {/* ================= REPORT DETAILS MODAL ================= */}
      {selectedReport && (

        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center px-4">

          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">

            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">

              <div>

                <h2 className="text-xl font-bold text-slate-800">
                  Report Details
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  View complete report information.
                </p>

              </div>

              <button
                onClick={() => setSelectedReport(null)}
                className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X size={20} />
              </button>

            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">

              {/* Report Name */}
              <div className="bg-slate-50 rounded-xl p-4">

                <p className="text-xs text-slate-500">
                  Report
                </p>

                <p className="font-semibold text-slate-800 mt-1">
                  {selectedReport.title ||
                    selectedReport.reportType ||
                    "Medical Report"}
                </p>

              </div>

              {/* Patient + Doctor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="bg-slate-50 rounded-xl p-4">

                  <p className="text-xs text-slate-500">
                    Patient
                  </p>

                  <p className="font-medium text-slate-800 mt-1">
                    {getPatientName(selectedReport)}
                  </p>

                </div>

                <div className="bg-slate-50 rounded-xl p-4">

                  <p className="text-xs text-slate-500">
                    Doctor
                  </p>

                  <p className="font-medium text-slate-800 mt-1">
                    {getDoctorName(selectedReport)}
                  </p>

                </div>

              </div>

              {/* Status + Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="bg-slate-50 rounded-xl p-4">

                  <p className="text-xs text-slate-500">
                    Status
                  </p>

                  <span
                    className={`inline-block mt-2 px-3 py-1.5 rounded-full text-xs font-medium ${getStatusStyle(
                      getStatus(selectedReport)
                    )}`}
                  >
                    {getStatus(selectedReport)}
                  </span>

                </div>

                <div className="bg-slate-50 rounded-xl p-4">

                  <p className="text-xs text-slate-500">
                    Date
                  </p>

                  <p className="font-medium text-slate-800 mt-1">

                    {selectedReport.createdAt
                      ? new Date(
                          selectedReport.createdAt
                        ).toLocaleDateString()
                      : selectedReport.date ||
                        "Not available"}

                  </p>

                </div>

              </div>

              {/* Findings */}
              <div className="bg-slate-50 rounded-xl p-4">

                <p className="text-xs text-slate-500">
                  Findings
                </p>

                <p className="text-sm text-slate-800 mt-2 whitespace-pre-wrap">
                  {selectedReport.findings ||
                    "No findings recorded."}
                </p>

              </div>

              {/* Notes */}
              <div className="bg-slate-50 rounded-xl p-4">

                <p className="text-xs text-slate-500">
                  Notes
                </p>

                <p className="text-sm text-slate-800 mt-2 whitespace-pre-wrap">
                  {selectedReport.notes ||
                    "No notes recorded."}
                </p>

              </div>

              {/* Close */}
              <div className="flex justify-end pt-2">

                <button
                  onClick={() => setSelectedReport(null)}
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

export default Reports;

