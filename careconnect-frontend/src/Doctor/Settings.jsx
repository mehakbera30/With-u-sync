import React, { useEffect, useState } from "react";
import {
  Search,
  User,
  Lock,
  BellRing,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import DoctorSidebar from "../components/DoctorSidebar";
import NotificationBell from "../components/NotificationBell";
import ProfileMenu, { getAvatarUrl } from "../components/ProfileMenu";
import api, { getStoredUser } from "../services/api";

const Settings = () => {
  const [user, setUser] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [qualifications, setQualifications] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState({ street: "", city: "", state: "", zipCode: "" });

  const [notifications, setNotifications] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = getStoredUser();

        if (storedUser) {
          setUser(storedUser);
          setName(storedUser.name || "");
          setEmail(storedUser.email || "");
          setSpecialization(storedUser.specialization || "");
          setQualifications(storedUser.qualifications || "");
          setPhone(storedUser.phone || "");
          setAddress(storedUser.address || { street: "", city: "", state: "", zipCode: "" });
          setNotifications(storedUser.notificationsEnabled !== false);
        }

        const response = await api.auth.me();

        if (response.success && response.user) {
          setUser(response.user);
          setName(response.user.name || "");
          setEmail(response.user.email || "");
          setSpecialization(response.user.specialization || "");
          setQualifications(response.user.qualifications || "");
          setPhone(response.user.phone || "");
          setAddress(response.user.address || { street: "", city: "", state: "", zipCode: "" });
          setNotifications(response.user.notificationsEnabled !== false);

          localStorage.setItem(
            "careconnect_user",
            JSON.stringify(response.user)
          );
        }
      } catch (error) {
        console.error("Load doctor settings error:", error);
      }
    };

    loadUser();
  }, []);

  const getInitials = (value = "") =>
    value
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "DR";

  const handleSave = async () => {
    try {
      setSaving(true);

      const response = await api.users.updateProfile({
        name,
        email,
        specialization,
        qualifications,
        phone,
        address,
      });

      if (response.success && response.user) {
        setUser(response.user);

        localStorage.setItem(
          "careconnect_user",
          JSON.stringify(response.user)
        );

        alert("Profile updated successfully.");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      alert(error.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationToggle = async () => {
    const newValue = !notifications;

    try {
      setNotifications(newValue);

      const response = await api.users.updateProfile({
        notificationsEnabled: newValue,
      });

      if (response.success && response.user) {
        setUser(response.user);

        localStorage.setItem(
          "careconnect_user",
          JSON.stringify(response.user)
        );
      }
    } catch (error) {
      console.error("Notification update error:", error);
      setNotifications(!newValue);
      alert(error.message || "Failed to update notification settings.");
    }
  };

  const openPasswordModal = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowPasswordModal(true);
  };

  const closePasswordModal = () => {
    if (changingPassword) return;

    setShowPasswordModal(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Please fill all password fields.");
      return;
    }

    if (newPassword.length < 6) {
      alert("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("New password and confirm password do not match.");
      return;
    }

    try {
      setChangingPassword(true);

      const response = await api.auth.updatePassword(
        currentPassword,
        newPassword
      );

      if (response.success) {
        alert("Password changed successfully.");
        closePasswordModal();
      }
    } catch (error) {
      console.error("Password update error:", error);
      alert(error.message || "Failed to change password.");
    } finally {
      setChangingPassword(false);
    }
  };

  const doctorInitials = getInitials(user?.name);

  return (
    <div className="min-h-screen bg-slate-50">
      <DoctorSidebar />

      <main className="ml-64">
        <header className="h-20 bg-gradient-to-r from-teal-100 to-white border-b border-teal-100 px-8 flex items-center justify-between shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Settings
            </h1>
            <p className="text-slate-500 mt-1">
              Manage your account and preferences.
            </p>
          </div>

          <div className="flex items-center gap-5">
            <div className="relative hidden lg:block">
              <Search
                size={20}
                className="absolute left-4 top-3.5 text-teal-600"
              />
              <input
                placeholder="Search..."
                className="w-64 h-12 pl-11 pr-4 bg-white border border-teal-100 rounded-xl outline-none focus:ring-2 focus:ring-teal-200"
              />
            </div>


            <NotificationBell />

            <ProfileMenu />
          </div>
        </header>

        <div className="p-8 max-w-5xl">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-teal-50 rounded-xl">
                <User className="text-teal-600" />
              </div>

              <div>
                <h2 className="text-xl font-semibold text-slate-800">
                  Profile Information
                </h2>
                <p className="text-sm text-slate-500">
                  Update your professional information.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm text-slate-600 mb-2">
                  Full Name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-100"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-100"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-2">
                  Specialization
                </label>
                <input
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-100"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-2">Most Recent Education</label>
                <input value={qualifications} onChange={(e) => setQualifications(e.target.value)} placeholder="MBBS, MD, MS, etc." className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-100" />
              </div>

              <div>
                <label className="block text-sm text-slate-600 mb-2">Contact Number</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-100" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm text-slate-600 mb-2">Address</label>
                <div className="grid md:grid-cols-2 gap-3">
                  {[["street","Street / House Address"],["city","City"],["state","State"],["zipCode","PIN / ZIP Code"]].map(([key,label]) => <input key={key} value={address[key] || ""} onChange={(e) => setAddress({ ...address, [key]: e.target.value })} placeholder={label} className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-100" />)}
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="mt-6 bg-teal-600 hover:bg-teal-700 text-white px-5 py-3 rounded-lg disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 bg-teal-50 rounded-xl">
                <Lock className="text-teal-600" />
              </div>

              <div>
                <h2 className="text-xl font-semibold text-slate-800">
                  Security
                </h2>
                <p className="text-sm text-slate-500">
                  Manage your account security.
                </p>
              </div>
            </div>

            <button
              onClick={openPasswordModal}
              className="border border-slate-300 hover:bg-slate-50 px-5 py-3 rounded-lg text-slate-700"
            >
              Change Password
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-teal-50 rounded-xl">
                  <BellRing className="text-teal-600" />
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-slate-800">
                    Notifications
                  </h2>
                  <p className="text-sm text-slate-500">
                    Receive appointment and patient updates.
                  </p>
                  <p className="text-xs text-teal-600 mt-1">
                    {notifications
                      ? "Notifications are enabled."
                      : "Notifications are turned off."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleNotificationToggle}
                className={`relative w-12 h-6 rounded-full transition ${
                  notifications ? "bg-teal-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition ${
                    notifications ? "left-7" : "left-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </main>

      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl">
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  Change Password
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Enter your current password and choose a new one.
                </p>
              </div>

              <button
                type="button"
                onClick={closePasswordModal}
                className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-5">
              {[
                ["Current Password", currentPassword, setCurrentPassword, showCurrentPassword, setShowCurrentPassword],
                ["New Password", newPassword, setNewPassword, showNewPassword, setShowNewPassword],
                ["Confirm New Password", confirmPassword, setConfirmPassword, showConfirmPassword, setShowConfirmPassword],
              ].map(([label, value, setter, visible, setVisible]) => (
                <div key={label}>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {label}
                  </label>

                  <div className="relative">
                    <input
                      type={visible ? "text" : "password"}
                      value={value}
                      onChange={(e) => setter(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-4 py-3 pr-11 outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setVisible(!visible)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closePasswordModal}
                  disabled={changingPassword}
                  className="px-5 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={changingPassword}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium disabled:opacity-60"
                >
                  {changingPassword ? "Updating..." : "Update Password"}
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
