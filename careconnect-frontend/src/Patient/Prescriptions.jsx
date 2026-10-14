import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import NotificationBell from "../components/NotificationBell";
import ProfileMenu from "../components/ProfileMenu";
import api, { getStoredUser } from "../services/api";

import {
  Search,
  Pill,
  CalendarDays,
  UserRound,
  X,
  Clock,
} from "lucide-react";

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  const user = getStoredUser();

  // ================= FETCH PRESCRIPTIONS =================

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);

      const data = await api.prescriptions.getAll();

      if (data.success) {
        setPrescriptions(data.prescriptions || []);
      }
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  // ================= VIEW COMPLETE PRESCRIPTION =================

  const viewPrescription = async (id) => {
    try {
      setViewLoading(true);

      const data = await api.prescriptions.getById(id);

      if (data.success) {

        setSelectedPrescription(data.prescription);
      }
    } catch (error) {
      console.error("Error fetching prescription:", error);
    } finally {
      setViewLoading(false);
    }
  };

  // ================= LOAD DATA =================

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  // ================= FORMAT DATE =================

  const formatDate = (date) => {
    if (!date) {
      return "Not available";
    }

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ================= SEARCH =================

  const filteredPrescriptions = prescriptions.filter((prescription) => {
    const searchText = search.toLowerCase();

    const doctorName =
      prescription.doctorName?.toLowerCase() || "";

    const diagnosis =
      prescription.diagnosis?.toLowerCase() || "";

    const medicineMatch =
      prescription.medicines?.some((medicine) =>
        medicine.medicine
          ?.toLowerCase()
          .includes(searchText)
      );

    return (
      doctorName.includes(searchText) ||
      diagnosis.includes(searchText) ||
      medicineMatch
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* ================= SIDEBAR ================= */}

      <Sidebar />

      {/* ================= MAIN CONTENT ================= */}

      <main className="ml-64 flex-1">

        {/* ================= HEADER ================= */}

        <header className="h-20 bg-teal-100 border-b border-teal-200 px-8 flex items-center justify-between shadow-sm">

          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Prescriptions
            </h2>

            <p className="text-sm text-slate-500">
              View your current and previous prescriptions.
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
                placeholder="Search prescriptions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-56 bg-white border border-teal-100 rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-200"
              />

            </div>

            {/* Notification */}

            <NotificationBell />

            <ProfileMenu />

          </div>

        </header>

        {/* ================= PAGE CONTENT ================= */}

        <div className="p-8">

          <div className="mb-7">

            <h3 className="text-xl font-bold text-slate-800">
              My Prescriptions
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Keep track of your medicines and prescribed treatments.
            </p>

          </div>

          {/* ================= LOADING ================= */}

          {loading && (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500">
              Loading prescriptions...
            </div>
          )}

          {/* ================= EMPTY ================= */}

          {!loading && filteredPrescriptions.length === 0 && (

            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">

              <Pill
                size={40}
                className="mx-auto mb-3 text-slate-300"
              />

              <p className="font-medium text-slate-700">
                No prescriptions found
              </p>

              <p className="text-sm text-slate-400 mt-1">
                Your prescriptions will appear here when your doctor adds them.
              </p>

            </div>

          )}

          {/* ================= PRESCRIPTION CARDS ================= */}

          {!loading && filteredPrescriptions.length > 0 && (

            <div className="space-y-4">

              {filteredPrescriptions.map((prescription) => (

                <div
                  key={prescription._id}
                  className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition"
                >

                  {/* ================= TOP SECTION ================= */}

                  <div className="flex items-start justify-between gap-4">

                    <div className="flex items-center gap-4">

                      <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">

                        <Pill size={25} />

                      </div>

                      <div>

                        <h4 className="text-lg font-semibold text-slate-800">
                          Prescription
                        </h4>

                        <div className="flex flex-wrap items-center gap-4 mt-1">

                          {/* Date */}

                          <div className="flex items-center gap-1.5 text-sm text-slate-500">

                            <CalendarDays
                              size={15}
                              className="text-teal-600"
                            />

                            {formatDate(prescription.date)}

                          </div>

                          {/* Doctor */}

                          <div className="flex items-center gap-1.5 text-sm text-slate-500">

                            <UserRound
                              size={15}
                              className="text-teal-600"
                            />

                            {prescription.doctorName || "Doctor"}

                          </div>

                        </div>

                      </div>

                    </div>

                    {/* ================= STATUS ================= */}

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        prescription.status === "Active"
                          ? "bg-green-50 text-green-600"
                          : prescription.status === "Completed"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {prescription.status}
                    </span>

                  </div>

                  {/* ================= DIAGNOSIS ================= */}

                  {prescription.diagnosis && (

                    <div className="mt-5 pt-4 border-t border-slate-100">

                      <p className="text-xs text-slate-400">
                        Diagnosis
                      </p>

                      <p className="text-sm font-medium text-slate-700 mt-1">
                        {prescription.diagnosis}
                      </p>

                    </div>

                  )}

                  {/* ================= MEDICINE COUNT ================= */}

                  <div className="mt-4 flex items-center justify-between">

                    <p className="text-sm text-slate-500">

                      {prescription.medicines?.length || 0} medicine
                      {prescription.medicines?.length !== 1
                        ? "s"
                        : ""}{" "}
                      prescribed

                    </p>

                    {/* ================= VIEW BUTTON ================= */}

                    <button
                      onClick={() =>
                        viewPrescription(prescription._id)
                      }
                      disabled={viewLoading}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white rounded-lg text-sm font-medium transition"
                    >
                      {viewLoading
                        ? "Loading..."
                        : "View Prescription"}
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </main>

      {/* ================================================= */}
      {/* VIEW PRESCRIPTION MODAL */}
      {/* ================================================= */}

      {selectedPrescription && (

        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">

          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">

            {/* ================= MODAL HEADER ================= */}

            <div className="flex items-start justify-between px-6 py-5 border-b border-slate-200">

              <div>

                <h3 className="text-xl font-bold text-slate-800">
                  Prescription Details
                </h3>

                <div className="flex flex-wrap gap-5 mt-2">

                  {/* Date */}

                  <div className="flex items-center gap-2 text-sm text-slate-500">

                    <CalendarDays
                      size={16}
                      className="text-teal-600"
                    />

                    {formatDate(selectedPrescription.date)}

                  </div>

                  {/* Doctor */}

                  <div className="flex items-center gap-2 text-sm text-slate-500">

                    <UserRound
                      size={16}
                      className="text-teal-600"
                    />

                    {selectedPrescription.doctorName || "Doctor"}

                  </div>

                </div>

              </div>

              {/* Close Button */}

              <button
                onClick={() => setSelectedPrescription(null)}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X size={21} />
              </button>

            </div>

            {/* ================= MODAL CONTENT ================= */}

            <div className="p-6">

              {/* ================= DIAGNOSIS ================= */}

              {selectedPrescription.diagnosis && (

                <div className="mb-6">

                  <p className="text-sm font-semibold text-slate-700">
                    Diagnosis
                  </p>

                  <div className="mt-2 bg-teal-50 border border-teal-100 rounded-lg px-4 py-3">

                    <p className="text-sm text-slate-700">
                      {selectedPrescription.diagnosis}
                    </p>

                  </div>

                </div>

              )}

              {/* ================= MEDICINES ================= */}

              <div>

                <h4 className="text-lg font-semibold text-slate-800 mb-4">
                  Medicines
                </h4>

                {selectedPrescription.medicines &&
                selectedPrescription.medicines.length > 0 ? (

                  <div className="space-y-4">

                    {selectedPrescription.medicines.map(
                      (medicine, index) => (

                        <div
                          key={medicine._id || index}
                          className="border border-slate-200 rounded-xl p-5"
                        >

                          {/* ================= MEDICINE NAME ================= */}

                          <div className="flex items-center gap-3">

                            <div className="w-9 h-9 bg-teal-50 text-teal-600 rounded-lg flex items-center justify-center">

                              <Pill size={19} />

                            </div>

                            <p className="font-semibold text-slate-800">
                              {index + 1}.{" "}
                              {medicine.medicine ||
                                "Medicine name not available"}
                            </p>

                          </div>

                          {/* ================= MEDICINE DETAILS ================= */}

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">

                            {/* Dosage */}

                            <div>

                              <p className="text-xs text-slate-400">
                                Dosage
                              </p>

                              <p className="text-sm font-medium text-slate-700 mt-1">
                                {medicine.dosage ||
                                  "Not available"}
                              </p>

                            </div>

                            {/* Frequency */}

                            <div>

                              <p className="text-xs text-slate-400">
                                Frequency
                              </p>

                              <p className="text-sm font-medium text-slate-700 mt-1">
                                {medicine.frequency ||
                                  "Not available"}
                              </p>

                            </div>

                            {/* Duration */}

                            <div>

                              <p className="text-xs text-slate-400">
                                Duration
                              </p>

                              <p className="text-sm font-medium text-slate-700 mt-1 flex items-center gap-1">

                                <Clock size={14} />

                                {medicine.duration ||
                                  "Not available"}

                              </p>

                            </div>

                          </div>

                          {/* ================= INSTRUCTIONS ================= */}

                          {medicine.instructions && (

                            <div className="mt-4 pt-4 border-t border-slate-100">

                              <p className="text-xs text-slate-400">
                                Instructions
                              </p>

                              <p className="text-sm text-slate-600 mt-1">
                                {medicine.instructions}
                              </p>

                            </div>

                          )}

                        </div>

                      )
                    )}

                  </div>

                ) : (

                  <div className="border border-slate-200 rounded-xl p-6 text-center">

                    <Pill
                      size={32}
                      className="mx-auto mb-2 text-slate-300"
                    />

                    <p className="text-sm text-slate-500">
                      No medicines found in this prescription.
                    </p>

                  </div>

                )}

              </div>

              {/* ================= STATUS ================= */}

              <div className="mt-6 pt-5 border-t border-slate-200 flex items-center justify-between">

                <span className="text-sm text-slate-500">
                  Prescription Status
                </span>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selectedPrescription.status === "Active"
                      ? "bg-green-50 text-green-600"
                      : selectedPrescription.status === "Completed"
                      ? "bg-blue-50 text-blue-600"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {selectedPrescription.status}
                </span>

              </div>

            </div>

            {/* ================= MODAL FOOTER ================= */}

            <div className="px-6 py-4 border-t border-slate-200 flex justify-end">

              <button
                onClick={() => setSelectedPrescription(null)}
                className="px-5 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
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

export default Prescriptions;