import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import NotificationBell from "../components/NotificationBell";
import ProfileMenu from "../components/ProfileMenu";
import api, { getStoredUser } from "../services/api";
import {
  Search,
  Plus,
  Clock,
  MapPin,
  X,
  UserRound,
  CheckCircle2,
  Calendar,
} from "lucide-react";

const Appointments = () => {
  const [showBooking, setShowBooking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [user] = useState(getStoredUser());
  const [search, setSearch] = useState("");

  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [pastAppointments, setPastAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);

  // Booking Form State
  const [bookingForm, setBookingForm] = useState({
    doctorId: "",
    specialization: "",
    doctorName: "",
    date: "",
    time: "10:30 AM",
    reason: "",
  });

  const fetchAppointments = async () => {
    try {
      setLoading(true);

      const data = await api.appointments.getAll();

      if (data.success) {
        setUpcomingAppointments(data.upcoming || []);
        setPastAppointments(data.past || []);
      }
    } catch (err) {
      console.error("Error fetching appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const data = await api.users.getDoctors();

      if (data.success && data.doctors?.length > 0) {
        setDoctors(data.doctors);

        // Use data.doctors directly because setDoctors is asynchronous
        const firstDoctor = data.doctors[0];

        setBookingForm({
          doctorId: firstDoctor._id,
          doctorName: firstDoctor.name,
          specialization:
            firstDoctor.specialization || "General Physician",
          date: "",
          time: "10:30 AM",
          reason: "",
        });
      }
    } catch (err) {
      console.error("Error fetching doctors:", err);
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
  }, []);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!bookingForm.doctorId) {
      alert("Please select a doctor.");
      return;
    }

    if (!bookingForm.date) {
      alert("Please select a date for your appointment.");
      return;
    }

    try {
      setSubmitting(true);

      const res = await api.appointments.create({
        doctorId: bookingForm.doctorId,
        doctorName: bookingForm.doctorName,
        specialization: bookingForm.specialization,
        date: bookingForm.date,
        time: bookingForm.time,
        reason: bookingForm.reason,
      });

      if (res.success) {
        setMessage("Appointment booked successfully!");
        setShowBooking(false);

        const firstDoctor = doctors[0];

        setBookingForm({
          doctorId: firstDoctor?._id || "",
          doctorName: firstDoctor?.name || "",
          specialization:
            firstDoctor?.specialization || "General Physician",
          date: "",
          time: "10:30 AM",
          reason: "",
        });

        fetchAppointments();

        setTimeout(() => setMessage(""), 4000);
      }
    } catch (err) {
      alert(err.message || "Failed to book appointment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelAppointment = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to cancel this appointment?"
      )
    ) {
      return;
    }

    try {
      const res = await api.appointments.cancel(id);

      if (res.success) {
        fetchAppointments();
      }
    } catch (err) {
      alert(err.message || "Failed to cancel appointment.");
    }
  };

  const filteredUpcoming = upcomingAppointments.filter(
    (apt) =>
      apt.doctorName
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      apt.specialization
        ?.toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="ml-64 flex-1">

        {/* Navbar */}
        <header className="h-20 bg-gradient-to-r from-teal-100 border-b border-teal-200 px-8 flex items-center justify-between shadow-sm">

          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Appointments
            </h2>

            <p className="text-sm text-slate-500">
              Manage your upcoming and past appointments.
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
                className="w-56 bg-white border border-teal-100 rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-200"
              />

            </div>

            {/* Notification */}
            <NotificationBell />

            <ProfileMenu />

          </div>

        </header>

        {/* Content Body */}
        <div className="p-8">

          {/* Success Message */}
          {message && (
            <div className="mb-6 p-4 bg-teal-50 border border-teal-200 text-teal-800 text-sm rounded-xl flex items-center gap-2">

              <CheckCircle2
                size={18}
                className="text-teal-600"
              />

              {message}

            </div>
          )}

          {/* Action Header */}
          <div className="flex items-center justify-between mb-8">

            <div>

              <h3 className="text-xl font-bold text-slate-800">
                Scheduled Consultations
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Real-time booking linked with doctors' clinic schedules.
              </p>

            </div>

            <button
              onClick={() => setShowBooking(true)}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition"
            >
              <Plus size={18} />
              Book Appointment
            </button>

          </div>

          {/* Upcoming Section */}
          <section>

            <h4 className="text-lg font-semibold text-slate-800 mb-4">
              Upcoming Appointments ({filteredUpcoming.length})
            </h4>

            {loading ? (

              <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
                Loading appointments...
              </div>

            ) : filteredUpcoming.length === 0 ? (

              <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">

                <Calendar
                  size={36}
                  className="mx-auto mb-3 text-slate-300"
                />

                <p className="font-medium text-slate-700">
                  No upcoming appointments
                </p>

                <p className="text-sm text-slate-400 mt-1">
                  Click the "Book Appointment" button above to schedule a
                  visit with our doctors.
                </p>

              </div>

            ) : (

              <div className="space-y-4">

                {filteredUpcoming.map((appointment) => (

                  <div
                    key={appointment._id}
                    className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition"
                  >

                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

                      {/* Left Info */}
                      <div className="flex items-start gap-4">

                        <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 shrink-0">
                          <UserRound size={26} />
                        </div>

                        <div>

                          <div className="flex items-center gap-3">

                            <h5 className="font-bold text-slate-800 text-lg">
                              {appointment.doctorName || "Assigned Doctor"}
                            </h5>

                            <span
                              className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                                appointment.status === "Confirmed"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {appointment.status}
                            </span>

                          </div>

                          <p className="text-sm text-teal-600 font-medium mt-0.5">
                            {appointment.specialization} •{" "}
                            {appointment.type || "Consultation"}
                          </p>

                          {appointment.reason && (
                            <p className="text-xs text-slate-500 mt-1">
                              Reason: {appointment.reason}
                            </p>
                          )}

                        </div>

                      </div>

                      {/* Middle Details */}
                      <div className="flex flex-wrap items-center gap-5 text-sm text-slate-600 border-t lg:border-t-0 pt-3 lg:pt-0">

                        <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">

                          <Clock
                            size={16}
                            className="text-teal-600"
                          />

                          <span>
                            {appointment.date} at {appointment.time}
                          </span>

                        </div>

                        <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">

                          <MapPin
                            size={16}
                            className="text-teal-600"
                          />

                          <span>
                            {appointment.location ||
                              "WithUSync Clinic"}
                          </span>

                        </div>

                      </div>

                      {/* Right Action */}
                      <div className="flex items-center gap-3">

                        <button
                          onClick={() =>
                            handleCancelAppointment(
                              appointment._id
                            )
                          }
                          className="px-4 py-2 border border-red-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition"
                        >
                          Cancel
                        </button>

                      </div>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </section>

          {/* Past Appointments Section */}
          <section className="mt-10">

            <h4 className="text-lg font-semibold text-slate-800 mb-4">
              Past Appointments ({pastAppointments.length})
            </h4>

            {pastAppointments.length === 0 ? (

              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-sm">
                No past consultations recorded.
              </div>

            ) : (

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm divide-y divide-slate-100">

                {pastAppointments.map((appointment) => (

                  <div
                    key={appointment._id}
                    className="flex items-center justify-between px-6 py-4"
                  >

                    <div className="flex items-center gap-4">

                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                        <UserRound size={20} />
                      </div>

                      <div>

                        <p className="font-semibold text-slate-800">
                          {appointment.doctorName}
                        </p>

                        <p className="text-xs text-slate-500">
                          {appointment.date} •{" "}
                          {appointment.specialization}
                        </p>

                      </div>

                    </div>

                    <div className="flex items-center gap-2 text-sm font-medium text-slate-600">

                      <span
                        className={`w-2 h-2 rounded-full ${
                          appointment.status === "Completed"
                            ? "bg-green-500"
                            : "bg-slate-400"
                        }`}
                      ></span>

                      {appointment.status}

                    </div>

                  </div>

                ))}

              </div>

            )}

          </section>

        </div>

      </main>

      {/* Booking Modal */}
      {showBooking && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">

          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">

              <div>

                <h3 className="text-xl font-bold text-slate-800">
                  Book Appointment
                </h3>

                <p className="text-sm text-slate-500 mt-0.5">
                  Schedule a consultation with your doctor.
                </p>

              </div>

              <button
                onClick={() => setShowBooking(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={22} />
              </button>

            </div>

            {/* Booking Form */}
            <form
              onSubmit={handleBookingSubmit}
              className="p-6 space-y-4"
            >

              {/* Specialization */}
              <div>

                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Specialization
                </label>

                <select
                  value={bookingForm.specialization}
                  onChange={(e) => {

                    const spec = e.target.value;

                    const matchingDoc = doctors.find(
                      (doc) =>
                        doc.specialization === spec
                    );

                    setBookingForm({
                      ...bookingForm,
                      specialization: spec,
                      doctorId: matchingDoc?._id || "",
                      doctorName: matchingDoc?.name || "",
                    });

                  }}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                >

                  <option value="Cardiology">
                    Cardiology
                  </option>

                  <option value="General Physician">
                    General Physician
                  </option>

                  <option value="Dermatology">
                    Dermatology
                  </option>

                  <option value="Neurology">
                    Neurology
                  </option>

                </select>

              </div>

              {/* Doctor */}
              <div>

                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Select Doctor
                </label>

                <select
                  value={bookingForm.doctorId}
                  onChange={(e) => {

                    const selectedDoctor = doctors.find(
                      (doc) =>
                        doc._id === e.target.value
                    );

                    if (selectedDoctor) {

                      setBookingForm({
                        ...bookingForm,
                        doctorId: selectedDoctor._id,
                        doctorName: selectedDoctor.name,
                        specialization:
                          selectedDoctor.specialization ||
                          "General Physician",
                      });

                    }

                  }}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                >

                  {doctors.length > 0 ? (

                    doctors.map((doc) => (

                      <option
                        key={doc._id}
                        value={doc._id}
                      >
                        {doc.name} (
                        {doc.specialization || "Doctor"})
                      </option>

                    ))

                  ) : (

                    <option value="">
                      No doctors available
                    </option>

                  )}

                </select>

              </div>

              {/* Date */}
              <div>

                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Appointment Date
                </label>

                <input
                  type="date"
                  required
                  value={bookingForm.date}
                  onChange={(e) =>
                    setBookingForm({
                      ...bookingForm,
                      date: e.target.value,
                    })
                  }
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                />

              </div>

              {/* Time */}
              <div>

                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Select Time Slot
                </label>

                <select
                  value={bookingForm.time}
                  onChange={(e) =>
                    setBookingForm({
                      ...bookingForm,
                      time: e.target.value,
                    })
                  }
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                >

                  <option value="09:30 AM">
                    09:30 AM
                  </option>

                  <option value="10:30 AM">
                    10:30 AM
                  </option>

                  <option value="11:30 AM">
                    11:30 AM
                  </option>

                  <option value="02:00 PM">
                    02:00 PM
                  </option>

                  <option value="04:00 PM">
                    04:00 PM
                  </option>

                </select>

              </div>

              {/* Reason */}
              <div>

                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Reason for Visit
                </label>

                <textarea
                  rows="3"
                  value={bookingForm.reason}
                  onChange={(e) =>
                    setBookingForm({
                      ...bookingForm,
                      reason: e.target.value,
                    })
                  }
                  placeholder="Describe symptoms or reason for consultation..."
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none resize-none focus:ring-2 focus:ring-teal-500 text-sm"
                ></textarea>

              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">

                <button
                  type="button"
                  onClick={() => setShowBooking(false)}
                  className="px-5 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    submitting || !bookingForm.doctorId
                  }
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-60"
                >
                  {submitting
                    ? "Booking..."
                    : "Confirm Booking"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};

export default Appointments;