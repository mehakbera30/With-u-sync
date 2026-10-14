const User = require("../models/User");
const Notification = require("../models/Notification");

const createNotification = async ({
  userId,
  title,
  message,
  type = "system",
  link = "",
}) => {
  const user = await User.findById(userId).select("notificationsEnabled");

  // Respect the user's notification preference.
  if (!user || user.notificationsEnabled === false) {
    return null;
  }

  return Notification.create({
    user: userId,
    title,
    message,
    type,
    link,
  });
};

module.exports = createNotification;
