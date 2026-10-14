import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Search,
  FileText,
  Eye,
  Edit,
  Save,
  X,
  Download,
  ExternalLink,
} from "lucide-react";

import DoctorSidebar from "../components/DoctorSidebar";
import NotificationBell from "../components/NotificationBell";
import ProfileMenu from "../components/ProfileMenu";
import api from "../services/api";

const Reports = () => {
  const { id: reportId } = useParams();

  const [search, setSearch] = useState("");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);

  const [editData, setEditData] = useState({
    findings: "",
    doctorNotes: "",
  });

  const [selectedReport, setSelectedReport] = useState(null);
  const [showView, setShowView] = useState(false);

  const [saving, setSaving] = useState(false);

  // =========================================================
  // FILE URL
  // =========================================================

  const getFileUrl = (fileUrl) => {
    if (!fileUrl) return "";

    if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
      return fileUrl;
    }

    return `http://localhost:5000${
      fileUrl.startsWith("/") ? "" : "/"
    }${fileUrl}`;
  };

  // =========================================================
  // FETCH REPORTS
  // =========================================================

  const fetchReports = async () => {
    try {
      setLoading(true);

      const data = await api.reports.getAll();

      if (data.success) {
        setReports(data.reports || []);
      }
    } catch (error) {
      console.error("Fetch reports error:", error);
      alert(error.message || "Failed to load reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // =========================================================
  // OPEN REPORT FROM URL
  // =========================================================

  useEffect(() => {
    if (!reportId) return;

    const openRequestedReport = async () => {
      try {
        const data = await api.reports.getById(reportId);

        if (data.success && data.report) {
          setSelectedReport(data.report);
          setShowView(true);
        }
      } catch (error) {
        console.error("Open report route error:", error);
        alert(error.message || "Failed to load report.");
      }
    };

    openRequestedReport();
  }, [reportId]);

  // =========================================================
  // SEARCH
  // =========================================================

  const filteredReports = reports.filter((report) => {
    const patientName = report.patientName || "";
    const reportName = report.name || "";
    const reportType = report.type || "";

    const searchText = search.toLowerCase();

    return (
      patientName.toLowerCase().includes(searchText) ||
      reportName.toLowerCase().includes(searchText) ||
      reportType.toLowerCase().includes(searchText)
    );
  });

  // =========================================================
  // VIEW REPORT DETAILS
  // =========================================================

  const handleViewReport = async (id) => {
    try {
      const data = await api.reports.getById(id);

      if (data.success) {
        setSelectedReport(data.report);
        setShowView(true);
      }
    } catch (error) {
      console.error("View report error:", error);
      alert(error.message || "Failed to load report.");
    }
  };

  // =========================================================
  // VIEW ACTUAL UPLOADED FILE
  // =========================================================

  const handleOpenFile = (fileUrl) => {
    if (!fileUrl) {
      alert("No uploaded report file is available.");
      return;
    }

    const url = getFileUrl(fileUrl);

    window.open(url, "_blank", "noopener,noreferrer");
  };

  // =========================================================
  // DOWNLOAD / OPEN FILE
  // =========================================================

  const handleDownload = (fileUrl) => {
    if (!fileUrl) {
      alert("No file available for this report.");
      return;
    }

    const url = getFileUrl(fileUrl);

    window.open(url, "_blank", "noopener,noreferrer");
  };

  // =========================================================
  // START EDIT
  // =========================================================

  const startEditing = (report) => {
    setEditingId(report._id);

    setEditData({
      findings: report.findings || "",
      doctorNotes: report.doctorNotes || "",
    });
  };

  // =========================================================
  // SAVE REVIEW
  // =========================================================

  const saveReview = async (id) => {
    try {
      setSaving(true);

      const data = await api.reports.review(
        id,
        editData.findings,
        editData.doctorNotes,
        "Reviewed"
      );

      if (data.success) {
        setReports((prevReports) =>
          prevReports.map((report) =>
            report._id === id
              ? {
                  ...report,
                  findings: data.report.findings,
                  doctorNotes: data.report.doctorNotes,
                  status: data.report.status,
                  doctor: data.report.doctor,
                  doctorName: data.report.doctorName,
                  fileUrl: data.report.fileUrl || report.fileUrl,
                }
              : report
          )
        );

        if (selectedReport && selectedReport._id === id) {
          setSelectedReport((prev) => ({
            ...prev,
            findings: data.report.findings,
            doctorNotes: data.report.doctorNotes,
            status: data.report.status,
            doctor: data.report.doctor,
            doctorName: data.report.doctorName,
            fileUrl: data.report.fileUrl || prev.fileUrl,
          }));
        }

        setEditingId(null);

        setEditData({
          findings: "",
          doctorNotes: "",
        });

        alert("Report review saved successfully.");
      }
    } catch (error) {
      console.error("Save review error:", error);
      alert(error.message || "Failed to save report review.");
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // CLOSE VIEW
  // =========================================================

  const closeView = () => {
    setShowView(false);
    setSelectedReport(null);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <DoctorSidebar />

      <main className="ml-64">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="h-20 bg-gradient-to-r from-teal-100 to-slate-50 border-b border-teal-100 px-8 flex items-center justify-between shadow-sm">

          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Patient Reports
            </h1>

            <p className="text-slate-500 mt-1">
              Review and manage your patients' medical reports.
            </p>
          </div>

          <div className="flex items-center gap-5">

            <div className="relative">

              <Search
                size={20}
                className="absolute left-4 top-3.5 text-teal-600"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-64 h-12 pl-11 pr-4 bg-white border border-teal-100 rounded-xl outline-none focus:ring-2 focus:ring-teal-400"
              />

            </div>

            <NotificationBell />

            <ProfileMenu />

          </div>
        </div>

        {/* ================================================= */}
        {/* PAGE CONTENT */}
        {/* ================================================= */}

        <div className="p-8">

          {/* SUMMARY CARDS */}

          <div className="grid grid-cols-3 gap-6 mb-8">

            <div className="bg-white p-6 rounded-2xl border border-slate-200">

              <p className="text-sm text-slate-500">
                Total Reports
              </p>

              <h2 className="text-3xl font-bold text-slate-800 mt-2">
                {reports.length}
              </h2>

            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200">

              <p className="text-sm text-slate-500">
                Pending Review
              </p>

              <h2 className="text-3xl font-bold text-amber-600 mt-2">
                {
                  reports.filter(
                    (report) => report.status === "Pending Review"
                  ).length
                }
              </h2>

            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200">

              <p className="text-sm text-slate-500">
                Reviewed
              </p>

              <h2 className="text-3xl font-bold text-green-600 mt-2">
                {
                  reports.filter(
                    (report) => report.status === "Reviewed"
                  ).length
                }
              </h2>

            </div>

          </div>

          {/* ================================================= */}
          {/* REPORT CARD */}
          {/* ================================================= */}

          <div className="bg-white rounded-2xl border border-slate-200">

            <div className="p-6 border-b border-slate-200 flex items-center gap-3">

              <div className="bg-teal-50 p-3 rounded-xl">

                <FileText
                  size={22}
                  className="text-teal-600"
                />

              </div>

              <div>

                <h2 className="text-xl font-semibold text-slate-800">
                  Medical Reports
                </h2>

                <p className="text-sm text-slate-500">
                  View patient reports and add your findings.
                </p>

              </div>

            </div>

            {/* ================================================= */}
            {/* LOADING */}
            {/* ================================================= */}

            {loading ? (

              <div className="p-10 text-center text-slate-500">
                Loading reports...
              </div>

            ) : filteredReports.length === 0 ? (

              <div className="p-10 text-center">

                <FileText
                  size={40}
                  className="mx-auto text-slate-300 mb-3"
                />

                <p className="text-slate-500">
                  No reports found.
                </p>

              </div>

            ) : (

              <div className="p-6 space-y-4">

                {filteredReports.map((report) => (

                  <div
                    key={report._id}
                    className="border border-slate-200 rounded-xl p-5 hover:border-teal-200 transition"
                  >

                    {/* REPORT TOP */}

                    <div className="flex items-center justify-between">

                      <div className="flex items-center gap-4">

                        <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center">

                          <FileText
                            size={22}
                            className="text-teal-600"
                          />

                        </div>

                        <div>

                          <h3 className="font-semibold text-slate-800">
                            {report.name}
                          </h3>

                          <p className="text-sm text-slate-500 mt-1">
                            Patient:{" "}
                            {report.patientName || "Unknown Patient"}
                          </p>

                          <p className="text-sm text-slate-400">
                            {report.type} • {report.date}
                          </p>

                        </div>

                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          report.status === "Reviewed"
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {report.status}
                      </span>

                    </div>

                    {/* FINDINGS */}

                    <div className="mt-5">

                      <p className="text-sm font-medium text-slate-600 mb-2">
                        Doctor's Findings
                      </p>

                      {editingId === report._id ? (

                        <div>

                          <textarea
                            value={editData.findings}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                findings: e.target.value,
                              })
                            }
                            placeholder="Enter your findings..."
                            rows="3"
                            className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-400"
                          />

                          <p className="text-sm font-medium text-slate-600 mt-4 mb-2">
                            Doctor's Notes
                          </p>

                          <textarea
                            value={editData.doctorNotes}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                doctorNotes: e.target.value,
                              })
                            }
                            placeholder="Enter notes for the patient..."
                            rows="3"
                            className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-400"
                          />

                          <div className="flex gap-3 mt-3">

                            <button
                              onClick={() => saveReview(report._id)}
                              disabled={saving}
                              className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg disabled:opacity-60"
                            >

                              <Save size={17} />

                              {saving
                                ? "Saving..."
                                : "Save Review"}

                            </button>

                            <button
                              onClick={() => {
                                setEditingId(null);

                                setEditData({
                                  findings: "",
                                  doctorNotes: "",
                                });
                              }}
                              className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600"
                            >
                              Cancel
                            </button>

                          </div>

                        </div>

                      ) : (

                        <div className="bg-slate-50 p-4 rounded-lg">

                          <div className="flex items-start justify-between gap-4">

                            <div>

                              <p className="text-sm text-slate-600">
                                {report.findings ||
                                  "No findings added yet."}
                              </p>

                              {report.doctorNotes && (

                                <div className="mt-3">

                                  <p className="text-xs font-semibold text-slate-500">
                                    Doctor's Notes
                                  </p>

                                  <p className="text-sm text-slate-600 mt-1">
                                    {report.doctorNotes}
                                  </p>

                                </div>

                              )}

                            </div>

                            <div className="flex items-center gap-3 shrink-0 flex-wrap justify-end">

                              {/* VIEW DETAILS */}

                              <button
                                onClick={() =>
                                  handleViewReport(report._id)
                                }
                                className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
                              >

                                <Eye size={17} />

                                View

                              </button>

                              {/* ACTUAL UPLOADED FILE */}

                              {report.fileUrl && (

                                <button
                                  onClick={() =>
                                    handleOpenFile(report.fileUrl)
                                  }
                                  className="flex items-center gap-2 px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                                >

                                  <ExternalLink size={17} />

                                  View Report File

                                </button>

                              )}

                              {/* EDIT */}

                              <button
                                onClick={() =>
                                  startEditing(report)
                                }
                                className="flex items-center gap-2 px-3 py-2 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100"
                              >

                                <Edit size={17} />

                                {report.findings
                                  ? "Edit"
                                  : "Add Findings"}

                              </button>

                            </div>

                          </div>

                        </div>

                      )}

                    </div>

                  </div>

                ))}

              </div>

            )}

          </div>

        </div>

      </main>

      {/* ================================================= */}
      {/* VIEW REPORT MODAL */}
      {/* ================================================= */}

      {showView && selectedReport && (

        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">

          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">

            {/* HEADER */}

            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">

              <div>

                <h3 className="text-xl font-bold text-slate-800">
                  Report Details
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  {selectedReport.name}
                </p>

              </div>

              <button
                onClick={closeView}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >

                <X size={21} />

              </button>

            </div>

            {/* BODY */}

            <div className="p-6 space-y-5">

              <div className="grid grid-cols-2 gap-4">

                <div className="bg-slate-50 rounded-lg p-4">

                  <p className="text-xs text-slate-500">
                    Patient
                  </p>

                  <p className="font-semibold text-slate-800 mt-1">
                    {selectedReport.patientName ||
                      "Unknown Patient"}
                  </p>

                </div>

                <div className="bg-slate-50 rounded-lg p-4">

                  <p className="text-xs text-slate-500">
                    Report Type
                  </p>

                  <p className="font-semibold text-slate-800 mt-1">
                    {selectedReport.type}
                  </p>

                </div>

                <div className="bg-slate-50 rounded-lg p-4">

                  <p className="text-xs text-slate-500">
                    Report Date
                  </p>

                  <p className="font-semibold text-slate-800 mt-1">
                    {selectedReport.date}
                  </p>

                </div>

                <div className="bg-slate-50 rounded-lg p-4">

                  <p className="text-xs text-slate-500">
                    Status
                  </p>

                  <p className="font-semibold text-slate-800 mt-1">
                    {selectedReport.status}
                  </p>

                </div>

              </div>

              {/* FINDINGS */}

              <div>

                <p className="text-sm font-semibold text-slate-700 mb-2">
                  Findings
                </p>

                <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-600">
                  {selectedReport.findings ||
                    "No findings added yet."}
                </div>

              </div>

              {/* DOCTOR NOTES */}

              <div>

                <p className="text-sm font-semibold text-slate-700 mb-2">
                  Doctor's Notes
                </p>

                <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-600">
                  {selectedReport.doctorNotes ||
                    "No doctor notes added yet."}
                </div>

              </div>

              {/* ================================================= */}
              {/* UPLOADED PATIENT FILE */}
              {/* ================================================= */}

              <div>

                <p className="text-sm font-semibold text-slate-700 mb-2">
                  Patient Uploaded Report
                </p>

                {selectedReport.fileUrl ? (

                  <div className="flex items-center gap-3">

                    <button
                      onClick={() =>
                        handleOpenFile(
                          selectedReport.fileUrl
                        )
                      }
                      className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg"
                    >

                      <Eye size={17} />

                      Open Uploaded Report

                    </button>

                    <button
                      onClick={() =>
                        handleDownload(
                          selectedReport.fileUrl
                        )
                      }
                      className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50"
                    >

                      <Download size={17} />

                      Download

                    </button>

                  </div>

                ) : (

                  <div className="bg-slate-50 rounded-lg p-4">

                    <p className="text-sm text-slate-500">
                      No report file was uploaded by the patient.
                    </p>

                  </div>

                )}

              </div>

            </div>

            {/* FOOTER */}

            <div className="px-6 py-4 border-t border-slate-200 flex justify-end">

              <button
                onClick={closeView}
                className="px-5 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default Reports;