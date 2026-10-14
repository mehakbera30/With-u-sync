const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://127.0.0.1:27017/careconnect"
    );

    const email = "admin@withusync.com";

    // Keep exactly one authorized administrator account.
    await User.updateMany(
      { role: "admin", email: { $ne: email } },
      { $set: { role: "patient" } }
    );

    let admin = await User.findOne({ email });

    if (admin) {
      admin.role = "admin";
      admin.name = "WithUSync Admin";
      admin.notificationsEnabled = true;
      admin.phoneVerified = true;
      await admin.save();

      console.log("Existing user converted to admin.");
    } else {
      admin = await User.create({
        name: "WithUSync Admin",
        email,
        password: "admin123",
        role: "admin",
        notificationsEnabled: true,
        phoneVerified: true,
      });

      console.log("Admin account created.");
    }

    console.log("Admin Email: admin@withusync.com");
    console.log("Admin Password: admin123");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Create admin error:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

createAdmin();
