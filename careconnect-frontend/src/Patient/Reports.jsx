import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import NotificationBell from "../components/NotificationBell";
import ProfileMenu from "../components/ProfileMenu";
import { displayDoctorName } from "../utils/formatters";
import api, { getStoredUser } from "../services/api";

import {
  Search,
  FileText,
  Eye,
  Download,
  X,
  CheckCircle2,
  Clock,
  Upload,
  Trash2,
  ExternalLink,
} from "lucide-react";

const Reports = () => {
  const [user] = useState(getStoredUser());

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [selectedReport, setSelectedReport] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);

  const [message, setMessage] = useState("");

  // =========================================================
  // UPLOAD STATES
  // =========================================================

  const [showUpload, setShowUpload] = useState(false);

  const [uploadData, setUploadData] = useState({
    name: "",
    type: "Blood Test",
    date: "",
    findings: "",
    doctorNotes: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

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
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // =========================================================
  // VIEW REPORT DETAILS
  // =========================================================

  const handleViewReport = async (id) => {
    try {
      setViewLoading(true);

      const data = await api.reports.getById(id);

      if (data.success) {
        setSelectedReport(data.report);
        setShowReport(true);
      }
    } catch (error) {
      console.error("Error fetching report:", error);
      alert(error.message || "Failed to load report.");
    } finally {
      setViewLoading(false);
    }
  };

  // =========================================================
  // OPEN ACTUAL FILE
  // =========================================================

  const handleOpenFile = (fileUrl) => {
    if (!fileUrl) {
      alert("No report file is available.");
      return;
    }

    const url = getFileUrl(fileUrl);

    window.open(url, "_blank", "noopener,noreferrer");
  };

  // =========================================================
  // DOWNLOAD / OPEN
  // =========================================================

  const handleDownload = (fileUrl) => {
    if (!fileUrl) {
      alert("No report file is available.");
      return;
    }

    const url = getFileUrl(fileUrl);

    window.open(url, "_blank", "noopener,noreferrer");
  };

  // =========================================================
  // REMOVE REPORT
  // =========================================================

  const handleRemoveReport = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this report?"
    );

    if (!confirmed) return;

    try {
      const data = await api.reports.remove(id);

      if (data.success) {
        setReports((prevReports) =>
          prevReports.filter(
            (report) => report._id !== id
          )
        );

        setMessage("Report removed successfully.");

        setTimeout(() => {
          setMessage("");
        }, 3000);
      }
    } catch (error) {
      console.error("Remove report error:", error);

      alert(
        error.message || "Failed to remove report."
      );
    }
  };

  // =========================================================
  // UPLOAD REPORT
  // =========================================================

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!uploadData.name.trim()) {
      alert("Please enter report name.");
      return;
    }

    if (!selectedFile) {
      alert("Please select a report file.");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();

      formData.append("name", uploadData.name);
      formData.append("type", uploadData.type);
      formData.append("date", uploadData.date);
      formData.append("findings", uploadData.findings);
      formData.append(
        "doctorNotes",
        uploadData.doctorNotes
      );

      // IMPORTANT
      formData.append(
        "reportFile",
        selectedFile
      );

      const data = await api.reports.create(formData);

      if (data.success) {
        setMessage(
          "Report uploaded successfully."
        );

        setUploadData({
          name: "",
          type: "Blood Test",
          date: "",
          findings: "",
          doctorNotes: "",
        });

        setSelectedFile(null);

        setShowUpload(false);

        await fetchReports();

        setTimeout(() => {
          setMessage("");
        }, 3000);
      }
    } catch (error) {
      console.error(
        "Upload report error:",
        error
      );

      alert(
        error.message ||
          "Failed to upload report."
      );
    } finally {
      setUploading(false);
    }
  };

  // =========================================================
  // SEARCH
  // =========================================================

  const filteredReports = reports.filter(
    (report) => {
      const searchText =
        search.toLowerCase();

      return (
        report.name
          ?.toLowerCase()
          .includes(searchText) ||
        report.type
          ?.toLowerCase()
          .includes(searchText) ||
        report.doctor?.name
          ?.toLowerCase()
          .includes(searchText)
      );
    }
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* ================================================= */}
      {/* SIDEBAR */}
      {/* ================================================= */}

      <Sidebar />

      <main className="ml-64 flex-1">

        {/* ================================================= */}
        {/* NAVBAR */}
        {/* ================================================= */}

        <header className="h-20 bg-gradient-to-r from-teal-100 border-b border-teal-200 px-8 flex items-center justify-between shadow-sm">

          <div>

            <h2 className="text-2xl font-bold text-slate-800">
              Reports
            </h2>

            <p className="text-sm text-slate-500">
              View and manage your medical reports.
            </p>

          </div>

          <div className="flex items-center gap-5">

            <div className="relative hidden lg:block">

              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-600"
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search reports..."
                className="w-56 bg-white border border-teal-100 rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-200"
              />

            </div>

            <NotificationBell />

            <ProfileMenu />

          </div>

        </header>

        {/* ================================================= */}
        {/* CONTENT */}
        {/* ================================================= */}

        <div className="p-8">

          {message && (

            <div className="mb-6 p-4 bg-teal-50 border border-teal-200 text-teal-800 text-sm rounded-xl flex items-center gap-2">

              <CheckCircle2
                size={18}
                className="text-teal-600"
              />

              {message}

            </div>

          )}

          {/* HEADING */}

          <div className="flex items-center justify-between mb-8">

            <div>

              <h3 className="text-xl font-bold text-slate-800">
                Medical Reports
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Access your recent medical test reports and health records.
              </p>

            </div>

            <button
              onClick={() =>
                setShowUpload(true)
              }
              className="flex items-center gap-2 px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition shadow-sm"
            >

              <Upload size={18} />

              Upload Report

            </button>

          </div>

          <h4 className="text-lg font-semibold text-slate-800 mb-4">
            My Reports ({filteredReports.length})
          </h4>

          {/* ================================================= */}
          {/* LOADING */}
          {/* ================================================= */}

          {loading ? (

            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
              Loading reports...
            </div>

          ) : filteredReports.length === 0 ? (

            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">

              <FileText
                size={42}
                className="mx-auto mb-4 text-slate-300"
              />

              <p className="font-medium text-slate-700">
                No reports found
              </p>

              <p className="text-sm text-slate-400 mt-1">
                Your uploaded medical reports will appear here.
              </p>

            </div>

          ) : (

            <div className="space-y-4">

              {filteredReports.map(
                (report) => (

                  <div
                    key={report._id}
                    className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition"
                  >

                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">

                      {/* REPORT INFORMATION */}

                      <div className="flex items-start gap-4">

                        <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 shrink-0">

                          <FileText size={26} />

                        </div>

                        <div>

                          <h5 className="font-bold text-slate-800 text-lg">
                            {report.name}
                          </h5>

                          <p className="text-sm text-teal-600 font-medium mt-1">
                            {report.type}
                          </p>

                          <p className="text-sm text-slate-500 mt-1">

                            {report.doctor?.name
                              ? displayDoctorName(
                                  report.doctor.name
                                )
                              : "Doctor not assigned"}

                            {" • "}

                            {report.date}

                          </p>

                          {/* FILE STATUS */}

                          {report.fileUrl && (

                            <p className="text-xs text-teal-600 mt-2 font-medium">
                              ✓ Report file uploaded
                            </p>

                          )}

                        </div>

                      </div>

                      {/* STATUS */}

                      <div>

                        {report.status ===
                        "Reviewed" ? (

                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 rounded-full text-xs font-medium">

                            <CheckCircle2 size={14} />

                            Reviewed

                          </span>

                        ) : (

                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-full text-xs font-medium">

                            <Clock size={14} />

                            {report.status ||
                              "Pending Review"}

                          </span>

                        )}

                      </div>

                      {/* ACTIONS */}

                      <div className="flex items-center gap-2 flex-wrap">

                        {/* VIEW DETAILS */}

                        <button
                          onClick={() =>
                            handleViewReport(
                              report._id
                            )
                          }
                          className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:text-teal-600 hover:border-teal-200 transition"
                        >

                          <Eye size={17} />

                          View

                        </button>

                        {/* ACTUAL UPLOADED FILE */}

                        {report.fileUrl && (

                          <button
                            onClick={() =>
                              handleOpenFile(
                                report.fileUrl
                              )
                            }
                            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition"
                          >

                            <ExternalLink
                              size={17}
                            />

                            View Report File

                          </button>

                        )}

                        {/* DOWNLOAD */}

                        {report.fileUrl && (

                          <button
                            onClick={() =>
                              handleDownload(
                                report.fileUrl
                              )
                            }
                            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:text-teal-600 hover:border-teal-200 transition"
                          >

                            <Download
                              size={17}
                            />

                            Download

                          </button>

                        )}

                        {/* REMOVE */}

                        <button
                          onClick={() =>
                            handleRemoveReport(
                              report._id
                            )
                          }
                          className="flex items-center gap-2 px-4 py-2 border border-red-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition"
                        >

                          <Trash2 size={17} />

                          Remove

                        </button>

                      </div>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

          {/* INFO */}

          <div className="mt-8 bg-teal-50 border border-teal-100 rounded-xl p-5">

            <div className="flex items-center gap-3">

              <FileText
                className="text-teal-600"
                size={22}
              />

              <div>

                <h4 className="font-semibold text-slate-800">
                  Keep your medical records organized
                </h4>

                <p className="text-sm text-slate-600 mt-1">
                  Your uploaded reports and doctor's reviews will appear here.
                </p>

              </div>

            </div>

          </div>

        </div>

      </main>

      {/* ================================================= */}
      {/* REPORT VIEW MODAL */}
      {/* ================================================= */}

      {showReport && selectedReport && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">

          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden">

            {/* HEADER */}

            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">

              <div>

                <h3 className="text-xl font-bold text-slate-800">
                  {selectedReport.name}
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  {selectedReport.type} •{" "}
                  {selectedReport.date}
                </p>

              </div>

              <button
                onClick={() => {
                  setShowReport(false);
                  setSelectedReport(null);
                }}
                className="text-slate-400 hover:text-slate-700"
              >

                <X size={22} />

              </button>

            </div>

            {/* CONTENT */}

            <div className="p-6 space-y-5">

              {/* BASIC DETAILS */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="bg-slate-50 rounded-xl p-4">

                  <p className="text-xs text-slate-500">
                    Doctor
                  </p>

                  <p className="font-semibold text-slate-800 mt-1">

                    {selectedReport.doctor?.name
                      ? displayDoctorName(
                          selectedReport.doctor.name
                        )
                      : "Doctor not assigned"}

                  </p>

                </div>

                <div className="bg-slate-50 rounded-xl p-4">

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

                <p className="text-sm font-semibold text-slate-800 mb-2">
                  Findings
                </p>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm text-slate-600">

                  {selectedReport.findings
                    ? selectedReport.findings
                    : "No findings added yet."}

                </div>

              </div>

              {/* DOCTOR NOTES */}

              <div>

                <p className="text-sm font-semibold text-slate-800 mb-2">
                  Doctor's Notes
                </p>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm text-slate-600">

                  {selectedReport.doctorNotes
                    ? selectedReport.doctorNotes
                    : "No doctor's notes added yet."}

                </div>

              </div>

              {/* ================================================= */}
              {/* ACTUAL UPLOADED FILE */}
              {/* ================================================= */}

              <div>

                <p className="text-sm font-semibold text-slate-800 mb-2">
                  Uploaded Report File
                </p>

                {selectedReport.fileUrl ? (

                  <div className="flex items-center gap-3">

                    <button
                      onClick={() =>
                        handleOpenFile(
                          selectedReport.fileUrl
                        )
                      }
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition"
                    >

                      <Eye size={17} />

                      Open Report File

                    </button>

                    <button
                      onClick={() =>
                        handleDownload(
                          selectedReport.fileUrl
                        )
                      }
                      className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 text-sm font-medium"
                    >

                      <Download size={17} />

                      Download

                    </button>

                  </div>

                ) : (

                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">

                    <p className="text-sm text-slate-500">
                      No report file available.
                    </p>

                  </div>

                )}

              </div>

            </div>

            {/* FOOTER */}

            <div className="flex justify-end px-6 py-4 border-t border-slate-200">

              <button
                onClick={() => {
                  setShowReport(false);
                  setSelectedReport(null);
                }}
                className="px-5 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

      {/* ================================================= */}
      {/* UPLOAD REPORT MODAL */}
      {/* ================================================= */}

      {showUpload && (

        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">

          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">

            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">

              <div>

                <h3 className="text-xl font-bold text-slate-800">
                  Upload Medical Report
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Upload your medical test report.
                </p>

              </div>

              <button
                onClick={() =>
                  setShowUpload(false)
                }
                className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >

                <X size={21} />

              </button>

            </div>

            <form
              onSubmit={handleUpload}
              className="p-6 space-y-5"
            >

              {/* NAME */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Report Name
                </label>

                <input
                  type="text"
                  value={uploadData.name}
                  onChange={(e) =>
                    setUploadData({
                      ...uploadData,
                      name: e.target.value,
                    })
                  }
                  placeholder="e.g. Complete Blood Count"
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />

              </div>

              {/* TYPE */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Report Type
                </label>

                <select
                  value={uploadData.type}
                  onChange={(e) =>
                    setUploadData({
                      ...uploadData,
                      type: e.target.value,
                    })
                  }
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >

                  <option>Blood Test</option>
                  <option>ECG</option>
                  <option>X-Ray</option>
                  <option>Health Checkup</option>
                  <option>MRI</option>
                  <option>Ultrasound</option>
                  <option>Other</option>

                </select>

              </div>

              {/* DATE */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Report Date
                </label>

                <input
                  type="date"
                  value={uploadData.date}
                  onChange={(e) =>
                    setUploadData({
                      ...uploadData,
                      date: e.target.value,
                    })
                  }
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />

              </div>

              {/* FILE */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Report File
                </label>

                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) =>
                    setSelectedFile(
                      e.target.files[0]
                    )
                  }
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm"
                />

                <p className="text-xs text-slate-400 mt-2">
                  PDF, JPG, JPEG or PNG • Maximum 5MB
                </p>

              </div>

              {/* FINDINGS */}

              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Findings
                </label>

                <textarea
                  rows="3"
                  value={uploadData.findings}
                  onChange={(e) =>
                    setUploadData({
                      ...uploadData,
                      findings: e.target.value,
                    })
                  }
                  placeholder="Enter report findings if available..."
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none resize-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />

              </div>

              {/* BUTTONS */}

              <div className="flex justify-end gap-3 pt-2">

                <button
                  type="button"
                  onClick={() =>
                    setShowUpload(false)
                  }
                  className="px-5 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={uploading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white rounded-lg text-sm font-medium transition"
                >

                  <Upload size={17} />

                  {uploading
                    ? "Uploading..."
                    : "Upload Report"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};

export default Reports;