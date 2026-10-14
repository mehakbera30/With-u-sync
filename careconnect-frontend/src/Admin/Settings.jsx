import React, { useState } from "react";
import {
  Search,
  Bell,
  UserRound,
  Lock,
  Save,
  X,
} from "lucide-react";

import AdminSidebar from "../components/AdminSidebar";
import NotificationBell from "../components/NotificationBell";
import ProfileMenu from "../components/ProfileMenu";
import api, { getStoredUser } from "../services/api";

const Settings = () => {
  const storedUser = getStoredUser();

  const [profile, setProfile] = useState({
    name: storedUser?.name || "",
    email: storedUser?.email || "",
    phone: storedUser?.phone || "",
    street: storedUser?.address?.street || "",
    city: storedUser?.address?.city || "",
    state: storedUser?.address?.state || "",
    zipCode: storedUser?.address?.zipCode || "",
  });

  const [notifications, setNotifications] = useState(
    storedUser?.notificationsEnabled !== false &&
      localStorage.getItem("admin_notifications") !== "false"
  );

  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  /* ================= PROFILE ================= */

  const handleProfileChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (!profile.name || !profile.email) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      setSavingProfile(true);

      const response = await api.users.updateProfile({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        address: {
          street: profile.street,
          city: profile.city,
          state: profile.state,
          zipCode: profile.zipCode,
        },
      });

      const updatedUser = response.user || {
        ...storedUser,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        address: { street: profile.street, city: profile.city, state: profile.state, zipCode: profile.zipCode },
      };

      localStorage.setItem(
        "careconnect_user",
        JSON.stringify(updatedUser)
      );

      alert(response.message || "Profile updated successfully.");
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert(error.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  /* ================= PASSWORD ================= */

  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      alert("Please fill all password fields.");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      alert("New password must be at least 6 characters.");
      return;
    }

    if (
      passwordForm.newPassword !==
      passwordForm.confirmPassword
    ) {
      alert("New passwords do not match.");
      return;
    }

    try {
      setChangingPassword(true);

      const response = await api.auth.updatePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );

      alert(
        response.message ||
          "Password changed successfully."
      );

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setShowPasswordModal(false);
    } catch (error) {
      console.error("Failed to change password:", error);
      alert(error.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  /* ================= NOTIFICATIONS ================= */

  const handleNotificationToggle = async () => {
    const newValue = !notifications;

    try {
      const response = await api.users.updateProfile({
        notificationsEnabled: newValue,
      });

      const updatedUser = response.user || {
        ...storedUser,
        notificationsEnabled: newValue,
      };

      localStorage.setItem(
        "careconnect_user",
        JSON.stringify(updatedUser)
      );

      localStorage.setItem(
        "admin_notifications",
        String(newValue)
      );

      setNotifications(newValue);
    } catch (error) {
      console.error("Failed to update notification preference:", error);
      alert(error.message || "Failed to update notification preference");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ================= SIDEBAR ================= */}
      <AdminSidebar />

      {/* ================= MAIN CONTENT ================= */}
      <main className="ml-64">

        {/* ================= HEADER ================= */}
        <header className="h-20 bg-gradient-to-r from-white via-teal-50/60 to-slate-50 border-b border-teal-100 px-8 flex items-center justify-between shadow-sm">

          <div>

            <h1 className="text-2xl font-bold text-slate-800">
              Settings
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              Manage your administrator account settings.
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
                placeholder="Search..."
                className="w-56 bg-white border border-teal-100 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-400 shadow-sm"
              />

            </div>

            {/* Working Notification Bell */}

            <NotificationBell />

            <ProfileMenu />

          </div>

        </header>

        {/* ================= PAGE CONTENT ================= */}
        <div className="p-8">

          <div className="mb-7">

            <h2 className="text-xl font-bold text-slate-800">
              Admin Settings
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Update your profile, password, and preferences.
            </p>

          </div>

          {/* ================= PROFILE SETTINGS ================= */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm mb-6">

            <div className="px-6 py-5 border-b border-slate-200 flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">

                <UserRound size={20} />

              </div>

              <div>

                <h3 className="text-lg font-semibold text-slate-800">
                  Profile Information
                </h3>

                <p className="text-sm text-slate-500">
                  Manage your administrator profile.
                </p>

              </div>

            </div>

            <form
              onSubmit={handleSaveProfile}
              className="p-6"
            >

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Name */}
                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleProfileChange}
                    placeholder="Admin Name"
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500"
                  />

                </div>

                {/* Email */}
                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleProfileChange}
                    placeholder="admin@example.com"
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500"
                  />

                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                {[
                  ["phone", "Contact Number"],
                  ["street", "Street / House Address"],
                  ["city", "City"],
                  ["state", "State"],
                  ["zipCode", "PIN / ZIP Code"],
                ].map(([key, label]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
                    <input type="text" name={key} value={profile[key]} onChange={handleProfileChange} className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500" />
                  </div>
                ))}
              </div>

              <div className="flex justify-end mt-5">

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition"
                >

                  <Save size={17} />

                  {savingProfile
                    ? "Saving..."
                    : "Save Changes"}

                </button>

              </div>

            </form>

          </div>

          {/* ================= SECURITY ================= */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm mb-6">

            <div className="px-6 py-5 border-b border-slate-200 flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">

                <Lock size={20} />

              </div>

              <div>

                <h3 className="text-lg font-semibold text-slate-800">
                  Security
                </h3>

                <p className="text-sm text-slate-500">
                  Keep your administrator account secure.
                </p>

              </div>

            </div>

            <div className="p-6 flex items-center justify-between">

              <div>

                <p className="font-medium text-slate-800">
                  Password
                </p>

                <p className="text-sm text-slate-500 mt-1">
                  Change your account password regularly.
                </p>

              </div>

              <button
                onClick={() => setShowPasswordModal(true)}
                className="px-5 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                Change Password
              </button>

            </div>

          </div>

          {/* ================= NOTIFICATIONS ================= */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">

            <div className="px-6 py-5 border-b border-slate-200 flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">

                <Bell size={20} />

              </div>

              <div>

                <h3 className="text-lg font-semibold text-slate-800">
                  Notifications
                </h3>

                <p className="text-sm text-slate-500">
                  Manage administrator notification preferences.
                </p>

              </div>

            </div>

            <div className="p-6 flex items-center justify-between">

              <div>

                <p className="font-medium text-slate-800">
                  Enable Notifications
                </p>

                <p className="text-sm text-slate-500 mt-1">
                  Receive notifications about system activity.
                </p>

              </div>

              {/* Toggle */}
              <button
                type="button"
                onClick={handleNotificationToggle}
                className={`relative w-12 h-6 rounded-full transition ${
                  notifications
                    ? "bg-teal-600"
                    : "bg-slate-300"
                }`}
              >

                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition ${
                    notifications
                      ? "left-7"
                      : "left-1"
                  }`}
                />

              </button>

            </div>

          </div>

        </div>

      </main>

      {/* ================= PASSWORD MODAL ================= */}
      {showPasswordModal && (

        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center px-4">

          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">

            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">

              <div>

                <h2 className="text-xl font-bold text-slate-800">
                  Change Password
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Update your administrator password.
                </p>

              </div>

              <button
                onClick={() => setShowPasswordModal(false)}
                className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X size={20} />
              </button>

            </div>

            {/* Password Form */}
            <form
              onSubmit={handleChangePassword}
              className="p-6 space-y-5"
            >

              {/* Current Password */}
              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Current Password
                </label>

                <input
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500"
                />

              </div>

              {/* New Password */}
              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  New Password
                </label>

                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Minimum 6 characters"
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500"
                />

              </div>

              {/* Confirm Password */}
              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Confirm New Password
                </label>

                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Re-enter new password"
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500"
                />

              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-2">

                <button
                  type="button"
                  onClick={() =>
                    setShowPasswordModal(false)
                  }
                  className="px-5 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={changingPassword}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white rounded-lg text-sm font-medium"
                >
                  {changingPassword
                    ? "Updating..."
                    : "Update Password"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};

export default Settings;

