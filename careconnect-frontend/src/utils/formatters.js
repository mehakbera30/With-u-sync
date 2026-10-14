export const displayDoctorName = (name = "Doctor") => {
  const cleaned = String(name)
    .trim()
    .replace(/^(dr\.?\s*)+/i, "")
    .trim();

  return cleaned ? `Dr. ${cleaned}` : "Doctor";
};

export const getInitials = (name = "User") =>
  String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";
