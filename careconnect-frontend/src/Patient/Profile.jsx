import React, { useEffect, useRef, useState } from "react";
import { Camera, MapPin, Phone, Mail, Save } from "lucide-react";
import Sidebar from "../components/Sidebar";
import NotificationBell from "../components/NotificationBell";
import ProfileMenu, { getAvatarUrl } from "../components/ProfileMenu";
import api, { getStoredUser } from "../services/api";
import { displayDoctorName } from "../utils/formatters";

const Profile = () => {
  const [user, setUser] = useState(getStoredUser());
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", street: "", city: "", state: "", zipCode: "" });
  const [photo, setPhoto] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.auth.me();
        if (response.success && response.user) {
          setUser(response.user);
          setForm({
            name: response.user.name || "",
            phone: response.user.phone || "",
            street: response.user.address?.street || "",
            city: response.user.address?.city || "",
            state: response.user.address?.state || "",
            zipCode: response.user.address?.zipCode || "",
          });
          localStorage.setItem("careconnect_user", JSON.stringify(response.user));
        }
      } catch (error) {
        console.error("Profile load error:", error);
      }
    };
    load();
  }, []);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const saveProfile = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      const response = await api.users.updateProfile({
        name: form.name,
        phone: form.phone,
        address: {
          street: form.street,
          city: form.city,
          state: form.state,
          zipCode: form.zipCode,
        },
      });
      if (response.success) {
        setUser(response.user);
        localStorage.setItem("careconnect_user", JSON.stringify(response.user));
        alert("Profile updated successfully.");
      }
    } catch (error) {
      alert(error.message || "Could not update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handlePhoto = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return alert("Please select an image.");
    if (file.size > 5 * 1024 * 1024) return alert("Photo must be smaller than 5 MB.");
    setPhoto(URL.createObjectURL(file));
    try {
      const data = new FormData();
      data.append("avatar", file);
      const response = await api.users.uploadAvatar(data);
      if (response.success) {
        setUser(response.user);
        localStorage.setItem("careconnect_user", JSON.stringify(response.user));
      }
    } catch (error) {
      alert(error.message || "Photo upload failed.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      <Sidebar />
      <main className="ml-64 flex-1">
        <header className="h-20 bg-gradient-to-r from-white via-teal-50/60 to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border-b border-teal-100 dark:border-slate-800 px-8 flex items-center justify-between shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">My Profile</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">View and update your personal information.</p>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <ProfileMenu />
          </div>
        </header>

        <div className="p-8 max-w-5xl">
          <form onSubmit={saveProfile} className="space-y-6">
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row items-center gap-5">
                <div className="relative">
                  <button type="button" onClick={() => fileRef.current?.click()} className="w-28 h-28 rounded-full overflow-hidden bg-teal-100 text-teal-700 flex items-center justify-center text-2xl font-bold border-4 border-white dark:border-slate-800 shadow">
                    {photo || user?.avatar ? <img src={photo || getAvatarUrl(user.avatar)} alt={user.name} className="w-full h-full object-cover" /> : user?.name?.slice(0, 2).toUpperCase()}
                  </button>
                  <span className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-teal-600 text-white flex items-center justify-center border-2 border-white dark:border-slate-900"><Camera size={17} /></span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{user?.name || "Patient"}</h2>
                  <p className="text-teal-600">Patient</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Your registered email: {user?.email}</p>
                  <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/jpg" onChange={handlePhoto} className="hidden" />
                  <button type="button" onClick={() => fileRef.current?.click()} className="mt-3 text-sm text-teal-600 font-medium hover:text-teal-700">Change profile photo</button>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-5">Personal Information</h2>
              <div className="grid md:grid-cols-2 gap-5">
                <Field label="Full Name" value={form.name} onChange={(e) => update("name", e.target.value)} />
                <div><label className="block text-sm text-slate-600 dark:text-slate-300 mb-2">Registered Email</label><div className="w-full p-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex gap-2 items-center"><Mail size={16} />{user?.email}</div><p className="text-xs text-slate-400 mt-1">Email is your registered account identifier.</p></div>
                <Field label="Contact Number" value={form.phone} onChange={(e) => update("phone", e.target.value)} icon={<Phone size={16} />} />
                <div><label className="block text-sm text-slate-600 dark:text-slate-300 mb-2">Assigned Doctor</label><div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">{user?.assignedDoctor?.name ? displayDoctorName(user.assignedDoctor.name) : "Not assigned"}</div></div>
              </div>
            </section>

            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-5">Address</h2>
              <div className="grid md:grid-cols-2 gap-5">
                <Field label="Street / House Address" value={form.street} onChange={(e) => update("street", e.target.value)} icon={<MapPin size={16} />} />
                <Field label="City" value={form.city} onChange={(e) => update("city", e.target.value)} />
                <Field label="State" value={form.state} onChange={(e) => update("state", e.target.value)} />
                <Field label="PIN / ZIP Code" value={form.zipCode} onChange={(e) => update("zipCode", e.target.value)} />
              </div>
            </section>

            <div className="flex justify-end"><button disabled={saving} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white px-6 py-3 rounded-lg font-medium"><Save size={18} />{saving ? "Saving..." : "Save Changes"}</button></div>
          </form>
        </div>
      </main>
    </div>
  );
};

const Field = ({ label, value, onChange, icon }) => (
  <div>
    <label className="block text-sm text-slate-600 dark:text-slate-300 mb-2">{label}</label>
    <div className="relative">{icon && <span className="absolute left-3 top-3.5 text-teal-600">{icon}</span>}<input value={value} onChange={onChange} className={`w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-teal-100 ${icon ? "pl-9" : ""}`} /></div>
  </div>
);

export default Profile;
