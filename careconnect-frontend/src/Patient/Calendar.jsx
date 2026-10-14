import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react";
import Sidebar from "../components/Sidebar";
import NotificationBell from "../components/NotificationBell";
import ProfileMenu from "../components/ProfileMenu";
import api from "../services/api";
import {
  formatDate,
  isSameDay,
  parseAppointmentDate,
  parseAppointmentDateTime,
} from "../utils/dateUtils";

const Calendar = () => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.appointments.getAll();
      setAppointments(response.appointments || []);
    } catch (err) {
      console.error("Calendar appointments error:", err);
      setError(err.message || "Unable to load your appointments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const monthStart = useMemo(
    () => new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1),
    [currentMonth]
  );

  const monthEnd = useMemo(
    () => new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0),
    [currentMonth]
  );

  const calendarDays = useMemo(() => {
    const firstWeekday = monthStart.getDay();
    const daysInMonth = monthEnd.getDate();
    const previousMonthDays = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      0
    ).getDate();

    const cells = [];

    for (let index = firstWeekday - 1; index >= 0; index -= 1) {
      cells.push({
        date: new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth() - 1,
          previousMonthDays - index
        ),
        outsideMonth: true,
      });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push({
        date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day),
        outsideMonth: false,
      });
    }

    while (cells.length < 42) {
      const nextDay = cells.length - firstWeekday - daysInMonth + 1;
      cells.push({
        date: new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth() + 1,
          nextDay
        ),
        outsideMonth: true,
      });
    }

    return cells;
  }, [currentMonth, monthStart, monthEnd]);

  const appointmentMap = useMemo(() => {
    const map = new Map();

    appointments.forEach((appointment) => {
      const date = parseAppointmentDate(appointment.date);
      if (!date) return;

      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      const list = map.get(key) || [];
      list.push(appointment);
      map.set(key, list);
    });

    return map;
  }, [appointments]);

  const now = new Date();

  const getDayAppointments = (date) => {
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    return appointmentMap.get(key) || [];
  };

  const getAppointmentState = (appointment) => {
    const dateTime = parseAppointmentDateTime(appointment.date, appointment.time);
    if (!dateTime) return "unknown";
    if (appointment.status === "Cancelled" || dateTime < now) return "past";
    return "upcoming";
  };

  const upcomingAppointments = useMemo(
    () =>
      appointments
        .filter((appointment) => {
          const dateTime = parseAppointmentDateTime(
            appointment.date,
            appointment.time
          );
          return (
            appointment.status !== "Cancelled" &&
            appointment.status !== "Completed" &&
            dateTime &&
            dateTime >= now
          );
        })
        .sort(
          (a, b) =>
            parseAppointmentDateTime(a.date, a.time) -
            parseAppointmentDateTime(b.date, b.time)
        ),
    [appointments, now]
  );

  const goToToday = () =>
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));

  const changeMonth = (offset) => {
    setCurrentMonth(
      (previous) =>
        new Date(previous.getFullYear(), previous.getMonth() + offset, 1)
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      <Sidebar />

      <main className="ml-64 flex-1 min-w-0">
        <header className="h-20 bg-gradient-to-r from-white via-teal-50/60 to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border-b border-teal-100 dark:border-slate-800 px-8 flex items-center justify-between shadow-sm">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
              Calendar
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              View your appointments and schedule.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell />
            <ProfileMenu />
          </div>
        </header>

        <div className="p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                {currentMonth.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Appointment dates are highlighted by their status.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => changeMonth(-1)}
                className="p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                aria-label="Previous month"
              >
                <ChevronLeft size={20} />
              </button>

              <button
                type="button"
                onClick={goToToday}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Today
              </button>

              <button
                type="button"
                onClick={() => changeMonth(1)}
                className="p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                aria-label="Next month"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              Upcoming appointment
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              Passed appointment
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
            <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                (day) => (
                  <div
                    key={day}
                    className="p-3 sm:p-4 text-center text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400"
                  >
                    {day}
                  </div>
                )
              )}
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                Loading appointments...
              </div>
            ) : error ? (
              <div className="p-12 text-center">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                <button
                  type="button"
                  onClick={loadAppointments}
                  className="mt-3 text-sm text-teal-600 dark:text-teal-400 font-medium"
                >
                  Try again
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-7">
                {calendarDays.map(({ date, outsideMonth }) => {
                  const dayAppointments = getDayAppointments(date);
                  const hasUpcoming = dayAppointments.some(
                    (appointment) => getAppointmentState(appointment) === "upcoming"
                  );
                  const hasPast = dayAppointments.some(
                    (appointment) => getAppointmentState(appointment) === "past"
                  );
                  const todayCell = isSameDay(date, today);

                  return (
                    <div
                      key={date.toISOString()}
                      className={`min-h-28 sm:min-h-32 border-r border-b border-slate-200 dark:border-slate-800 p-2 sm:p-3 ${
                        outsideMonth
                          ? "bg-slate-50/70 dark:bg-slate-950/40 text-slate-300"
                          : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium ${
                          hasUpcoming
                            ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300"
                            : hasPast
                            ? "bg-red-100 text-red-700 ring-1 ring-red-300"
                            : todayCell
                            ? "bg-teal-600 text-white"
                            : ""
                        }`}
                      >
                        {date.getDate()}
                      </div>

                      <div className="mt-2 space-y-1.5">
                        {dayAppointments.slice(0, 2).map((appointment) => {
                          const state = getAppointmentState(appointment);
                          const isPast = state === "past";

                          return (
                            <div
                              key={appointment._id}
                              title={`${appointment.doctorName || appointment.doctor?.name || "Doctor"} • ${appointment.time || "Time unavailable"}`}
                              className={`rounded-md px-2 py-1.5 border-l-4 ${
                                isPast
                                  ? "bg-red-50 dark:bg-red-950/40 border-red-500 text-red-700 dark:text-red-300"
                                  : "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300"
                              }`}
                            >
                              <p className="text-[11px] font-semibold truncate">
                                {appointment.time || "Time unavailable"}
                              </p>
                              <p className="text-[11px] truncate">
                                {appointment.doctorName || appointment.doctor?.name || "Doctor"}
                              </p>
                            </div>
                          );
                        })}

                        {dayAppointments.length > 2 && (
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">
                            +{dayAppointments.length - 2} more
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <section className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                  Upcoming Appointments
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Your next scheduled consultations.
                </p>
              </div>
              <CalendarDays className="text-teal-600" size={22} />
            </div>

            {upcomingAppointments.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-slate-500">
                No upcoming appointments.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {upcomingAppointments.slice(0, 6).map((appointment) => (
                  <div
                    key={appointment._id}
                    className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900 rounded-xl p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm text-emerald-600 font-semibold">
                          {formatDate(appointment.date)} • {appointment.time}
                        </p>
                        <h4 className="font-semibold text-slate-800 dark:text-white mt-2">
                          {appointment.doctorName || appointment.doctor?.name || "Doctor"}
                        </h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {appointment.specialization || "General Consultation"}
                        </p>
                      </div>
                      <Clock className="text-emerald-600 shrink-0" size={19} />
                    </div>
                    {appointment.location && (
                      <div className="flex items-center gap-2 mt-3 text-xs text-slate-500 dark:text-slate-400">
                        <MapPin size={14} />
                        {appointment.location}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default Calendar;
