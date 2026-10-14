import React, { useEffect, useRef, useState } from "react";
import { Camera, ChevronDown, Mail, MapPin, Phone, UserRound, X, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api, { getStoredUser } from "../services/api";
import { displayDoctorName } from "../utils/formatters";

export const getAvatarUrl = (avatar) => {
  if (!avatar) return "";
  if (avatar.startsWith("data:") || avatar.startsWith("http")) return avatar;
  return avatar.startsWith("/") ? avatar : `/${avatar}`;
};

const getInitials = (name = "User") =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

const ProfileMenu = () => {
  const navigate = useNavigate();
  const ref = useRef(null);
  const fileRef = useRef(null);
  const [user, setUser] = useState(getStoredUser());
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const loadUser = async () => {
    try {
      const response = await api.auth.me();
      if (response.success && response.user) {
        setUser(response.user);
        localStorage.setItem("careconnect_user", JSON.stringify(response.user));
      }
    } catch (error) {
      console.error("Profile menu load error:", error);
    }
  };

  useEffect(() => {
    loadUser();

    const close = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const handlePhoto = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a JPG, JPEG or PNG image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Photo must be smaller than 5 MB.");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("avatar", file);
      const response = await api.users.uploadAvatar(formData);

      if (response.success && response.user) {
        setUser(response.user);
        localStorage.setItem("careconnect_user", JSON.stringify(response.user));
      }
    } catch (error) {
      console.error("Photo upload error:", error);
      alert(error.message || "Could not update profile photo.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  if (!user) return null;

  const editPath =
    user.role === "patient"
      ? "/patient/profile"
      : user.role === "doctor"
      ? "/doctor/settings"
      : "/admin/settings";

  const address = [
    user.address?.street,
    user.address?.city,
    user.address?.state,
    user.address?.zipCode,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="relative" ref={ref}>
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        className="hidden"
        onChange={handlePhoto}
      />

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-xl hover:bg-teal-50 dark:hover:bg-slate-800 px-2 py-1.5 transition focus:outline-none focus:ring-2 focus:ring-teal-300"
      >
        <span className="w-11 h-11 rounded-full overflow-hidden bg-teal-100 text-teal-700 flex items-center justify-center font-bold border border-teal-200 dark:border-slate-700">
          {user.avatar ? (
            <img src={getAvatarUrl(user.avatar)} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            getInitials(user.name)
          )}
        </span>
        <span className="hidden xl:block text-left">
          <span className="block text-sm font-semibold text-slate-800 dark:text-white">{user.role === "doctor" ? displayDoctorName(user.name) : user.name}</span>
          <span className="block text-xs text-teal-600 capitalize">{user.role}</span>
        </span>
        <ChevronDown size={16} className="text-slate-400 hidden xl:block" />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+10px)] z-[100] w-[360px] max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-5 bg-gradient-to-r from-teal-50 to-white dark:from-slate-800 dark:to-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-start gap-4">
            <div className="relative">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-16 h-16 rounded-full overflow-hidden bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-lg border-2 border-white dark:border-slate-700 shadow-sm"
                title="Change profile photo"
              >
                {user.avatar ? (
                  <img src={getAvatarUrl(user.avatar)} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  getInitials(user.name)
                )}
              </button>
              <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center border-2 border-white">
                <Camera size={13} />
              </span>
            </div>

            <div className="min-w-0">
              <p className="font-bold text-slate-800 dark:text-white truncate">{user.role === "doctor" ? displayDoctorName(user.name) : user.name}</p>
              <p className="text-xs text-teal-600 capitalize">{user.role}</p>
              <p className="text-xs text-slate-500 mt-1 truncate">{uploading ? "Uploading photo..." : "Click the photo to change"}</p>
            </div>

            <button type="button" onClick={() => setOpen(false)} className="ml-auto text-slate-400 hover:text-slate-700 dark:hover:text-white">
              <X size={17} />
            </button>
          </div>

          <div className="p-5 space-y-3 text-sm">
            <div className="flex gap-3">
              <Mail size={17} className="text-teal-600 mt-0.5 shrink-0" />
              <div><p className="text-xs text-slate-400">Registered Email</p><p className="text-slate-700 dark:text-slate-200 break-all">{user.email}</p></div>
            </div>

            <div className="flex gap-3">
              <Phone size={17} className="text-teal-600 mt-0.5 shrink-0" />
              <div><p className="text-xs text-slate-400">Contact Number</p><p className="text-slate-700 dark:text-slate-200">{user.phone || "Not provided"}</p></div>
            </div>

            {user.role === "patient" && (
              <div className="flex gap-3">
                <UserRound size={17} className="text-teal-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400">Assigned Doctor</p>
                  <p className="text-slate-700 dark:text-slate-200">{user.assignedDoctor?.name ? displayDoctorName(user.assignedDoctor.name) : "Not assigned"}</p>
                  {user.assignedDoctor?.specialization && <p className="text-xs text-slate-500">{user.assignedDoctor.specialization}</p>}
                </div>
              </div>
            )}

            {user.role === "doctor" && (
              <div className="flex gap-3">
                <GraduationCap size={17} className="text-teal-600 mt-0.5 shrink-0" />
                <div><p className="text-xs text-slate-400">Most Recent Education</p><p className="text-slate-700 dark:text-slate-200">{user.qualifications || "Not provided"}</p></div>
              </div>
            )}

            {address && (
              <div className="flex gap-3">
                <MapPin size={17} className="text-teal-600 mt-0.5 shrink-0" />
                <div><p className="text-xs text-slate-400">Address</p><p className="text-slate-700 dark:text-slate-200">{address}</p></div>
              </div>
            )}
          </div>

          <div className="px-5 pb-5 flex gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex-1 px-4 py-2.5 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 rounded-lg text-sm font-medium hover:bg-teal-50 dark:hover:bg-slate-800"
            >
              Change Photo
            </button>
            <button
              type="button"
              onClick={() => { setOpen(false); navigate(editPath); }}
              className="flex-1 px-4 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700"
            >
              Edit Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
