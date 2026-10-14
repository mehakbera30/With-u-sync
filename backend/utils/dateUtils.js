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

const parseAppointmentDateTime = (dateValue, timeValue) => {
  if (!dateValue) return null;

  const text = String(dateValue).trim();
  let year;
  let month;
  let day;

  let match = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (match) {
    year = Number(match[1]);
    month = Number(match[2]) - 1;
    day = Number(match[3]);
  } else {
    match = text.match(/^(\d{1,2})[\s/-]+([A-Za-z]+)[\s/-]+(\d{4})$/);
    if (match) {
      day = Number(match[1]);
      month = MONTHS[match[2].toLowerCase()];
      year = Number(match[3]);
    }
  }

  if (
    year === undefined ||
    month === undefined ||
    day === undefined ||
    month < 0 ||
    month > 11
  ) {
    const fallback = new Date(text);
    if (Number.isNaN(fallback.getTime())) return null;
    year = fallback.getFullYear();
    month = fallback.getMonth();
    day = fallback.getDate();
  }

  const result = new Date(year, month, day, 23, 59, 59, 999);
  const time = String(timeValue || "").trim();
  const timeMatch = time.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);

  if (timeMatch) {
    let hours = Number(timeMatch[1]);
    const minutes = Number(timeMatch[2] || 0);
    const period = timeMatch[3]?.toUpperCase();

    if (period === "PM" && hours < 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    result.setHours(hours, minutes, 0, 0);
  }

  return result;
};

module.exports = { parseAppointmentDateTime };
