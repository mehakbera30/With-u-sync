const MONTHS = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
};

export const parseAppointmentDate = (value) => {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : new Date(value.getTime());
  }

  const text = String(value).trim();

  let match = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (match) {
    const [, year, month, day] = match;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  match = text.match(/^(\d{1,2})[\s/-]+([A-Za-z]+)[\s/-]+(\d{4})$/);
  if (match) {
    const [, day, monthText, year] = match;
    const month = MONTHS[monthText.toLowerCase()];
    if (month !== undefined) {
      const date = new Date(Number(year), month, Number(day));
      return Number.isNaN(date.getTime()) ? null : date;
    }
  }

  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const parseAppointmentDateTime = (dateValue, timeValue) => {
  const date = parseAppointmentDate(dateValue);
  if (!date) return null;

  const result = new Date(date);
  const time = String(timeValue || "").trim();

  const match = time.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (match) {
    let hours = Number(match[1]);
    const minutes = Number(match[2] || 0);
    const period = match[3]?.toUpperCase();

    if (period === "PM" && hours < 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    result.setHours(hours, minutes, 0, 0);
  } else {
    result.setHours(23, 59, 59, 999);
  }

  return result;
};

export const isSameDay = (a, b) =>
  a &&
  b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const formatDate = (dateValue) => {
  const date = parseAppointmentDate(dateValue);
  if (!date) return dateValue || "Date unavailable";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
