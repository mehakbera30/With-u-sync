import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LockKeyhole, ShieldCheck } from "lucide-react";
import api from "../../services/api";
import ThemeToggle from "../../components/ThemeToggle";

const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const PHONE_REGEX = /^\d{10}$/;

const Register = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("patient");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ email: "", phone: "" });

  const validateDetails = () => {
    if (name.trim().length < 2) return "Please enter your full name.";
    if (!EMAIL_REGEX.test(email.trim())) {
      setFieldErrors((prev) => ({ ...prev, email: "Please enter a valid email address." }));
      return "Please enter a valid email address.";
    }
    if (!PHONE_REGEX.test(phone)) {
      setFieldErrors((prev) => ({ ...prev, phone: "Phone number must contain exactly 10 digits." }));
      return "Phone number must contain exactly 10 digits.";
    }
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (password !== confirmPassword) return "Passwords do not match.";
    return "";
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setError("");
    setFieldErrors({ email: "", phone: "" });

    const validationError = validateDetails();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      const response = await api.auth.register({
        name: name.trim(),
        email: email.trim(),
        phone,
        password,
        role,
      });

      if (response.token && response.user) {
        localStorage.setItem("careconnect_token", response.token);
        localStorage.setItem("careconnect_user", JSON.stringify(response.user));
      }

      if (response.user?.role === "doctor") {
        navigate("/doctor/dashboard");
      } else {
        navigate("/patient/dashboard");
      }
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4 py-8 transition-colors duration-300">
      <div className="fixed top-5 right-5 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-6xl bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden grid lg:grid-cols-[0.95fr_1.05fr] border border-slate-200 dark:border-slate-800">
        {/* Brand panel */}
        <div className="bg-gradient-to-br from-teal-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-900 dark:to-teal-950/50 p-8 md:p-12 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-teal-100 dark:border-slate-800">
          <div className="flex justify-center mb-8">
            <img
              src="/withusync-logo.png"
              alt="WithUSync healthcare logo"
              className="w-56 h-56 object-contain drop-shadow-lg"
            />
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-white leading-tight mb-5">
            Your health,
            <br />
            in sync.
          </h2>

          <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed max-w-lg">
            Create one secure account to manage appointments, medical records,
            reports and prescriptions with your healthcare team.
          </p>

          <div className="mt-9 grid gap-3 max-w-md">
            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
              <span className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-teal-100 dark:border-slate-700 flex items-center justify-center text-teal-600">
                <ShieldCheck size={19} />
              </span>
              Secure role-based access
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
              <span className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-teal-100 dark:border-slate-700 flex items-center justify-center text-teal-600">
                <LockKeyhole size={19} />
              </span>
              Secure healthcare account
            </div>
          </div>
        </div>

        {/* Form panel */}
        <div className="p-7 md:p-12">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-teal-600 transition mb-7"
          >
            <ArrowLeft size={17} />
            Back to login
          </button>

          <div className="mb-7">
            <p className="text-xs font-bold uppercase tracking-wider text-teal-600 mb-2">
              Create your account
            </p>
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
              Create your account
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Enter your details to get started with WithUSync.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-sm rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  className="w-full px-4 py-3.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setFieldErrors((prev) => ({ ...prev, email: "" }));
                    }}
                    onBlur={() => {
                      if (email && !EMAIL_REGEX.test(email.trim())) {
                        setFieldErrors((prev) => ({ ...prev, email: "Please enter a valid email address." }));
                      }
                    }}
                    placeholder="name@example.com"
                    autoComplete="email"
                    className={`w-full px-4 py-3.5 border rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-teal-100 transition ${fieldErrors.email ? "border-rose-400 focus:border-rose-500" : "border-slate-200 dark:border-slate-700 focus:border-teal-500"}`}
                    required
                  />
                  {fieldErrors.email && <p className="text-xs text-rose-600 dark:text-rose-400 mt-1.5">{fieldErrors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                      setFieldErrors((prev) => ({ ...prev, phone: "" }));
                    }}
                    onBlur={() => {
                      if (phone && !PHONE_REGEX.test(phone)) {
                        setFieldErrors((prev) => ({ ...prev, phone: "Phone number must contain exactly 10 digits." }));
                      }
                    }}
                    placeholder="10-digit mobile number"
                    inputMode="numeric"
                    minLength={10}
                    maxLength={10}
                    pattern="[0-9]{10}"
                    autoComplete="tel"
                    className={`w-full px-4 py-3.5 border rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-teal-100 transition ${fieldErrors.phone ? "border-rose-400 focus:border-rose-500" : "border-slate-200 dark:border-slate-700 focus:border-teal-500"}`}
                    required
                  />
                  <p className={`text-xs mt-1.5 ${fieldErrors.phone ? "text-rose-600 dark:text-rose-400" : "text-slate-400"}`}>
                    {fieldErrors.phone || "Enter a valid 10-digit mobile number."}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    autoComplete="new-password"
                    minLength={6}
                    className="w-full px-4 py-3.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    autoComplete="new-password"
                    minLength={6}
                    className="w-full px-4 py-3.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Register As</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-3.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition"
                >
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                </select>
                <p className="text-xs text-slate-400 mt-1.5">Admin access is restricted to the authorized administrator account.</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-600 text-white py-3.5 rounded-xl font-semibold hover:bg-teal-700 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>
          <p className="text-center text-slate-500 dark:text-slate-400 mt-7">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-teal-600 font-semibold hover:text-teal-700"
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
