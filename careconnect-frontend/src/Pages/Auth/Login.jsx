import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import ThemeToggle from "../../components/ThemeToggle";

const Login = () => {
  // Store email and password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotPassword, setForgotPassword] = useState("");
  const [forgotConfirm, setForgotConfirm] = useState("");
  const [resetting, setResetting] = useState(false);
  const navigate = useNavigate();

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return alert("Please enter your registered email.");
    if (forgotPassword.length < 6) return alert("New password must be at least 6 characters.");
    if (forgotPassword !== forgotConfirm) return alert("Passwords do not match.");

    try {
      setResetting(true);
      const response = await api.auth.forgotPassword(forgotEmail, forgotPassword);
      alert(response.message || "Password reset successfully.");
      setShowForgot(false);
      setEmail(forgotEmail);
      setPassword("");
      setForgotPassword("");
      setForgotConfirm("");
    } catch (err) {
      alert(err.message || "Could not reset password.");
    } finally {
      setResetting(false);
    }
  };

  // Handle login form
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email.trim())) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setEmailError("");
    setLoading(true);

    try {
      const data = await api.auth.login(email, password);
      if (data.user?.role === "admin") {
        navigate("/admin/dashboard");
      } else if (data.user?.role === "doctor") {
        navigate("/doctor/dashboard");
      } else {
        navigate("/patient/dashboard");
      }
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">

      <div className="fixed top-5 right-5 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden grid md:grid-cols-2">

        {/* ================= LEFT SECTION ================= */}
        <div className="bg-teal-50 p-10 md:p-14 flex flex-col justify-center">

          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">

            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white flex items-center justify-center border border-teal-100 shadow-sm">
              <img src="/withusync-logo.png" alt="WithUSync logo" className="w-full h-full object-contain" />
            </div>

            <h1 className="text-2xl font-bold text-teal-700">
              WithUSync
            </h1>

          </div>

          {/* Main Heading */}
          <h2 className="text-4xl font-bold text-slate-800 leading-tight mb-5">
            Your health,
            <br />
            connected.
          </h2>

          {/* Description */}
          <p className="text-slate-600 text-lg leading-relaxed max-w-md">
            Manage your medical records, appointments and
            healthcare information in one secure place.
          </p>

          {/* Healthcare Illustration */}
          <div className="mt-10 flex justify-center">
            <img
              src="/withusync-logo.png"
              alt="WithUSync healthcare logo"
              className="w-64 h-64 object-contain drop-shadow-lg"
            />
          </div>

        </div>


        {/* ================= RIGHT SECTION ================= */}
        <div className="p-8 md:p-14 flex flex-col justify-center">

          {/* Heading */}
          <h2 className="text-3xl font-bold text-slate-800">
            Welcome Back
          </h2>

          <p className="text-slate-500 mt-2 mb-6">
            Login to access your WithUSync account.
          </p>

          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl">
              {error}
            </div>
          )}
          {/* ================= LOGIN FORM ================= */}
          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >

            {/* Email */}
            <div>

              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError("");
                }}
                onBlur={() => {
                  if (email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
                    setEmailError("Please enter a valid email address.");
                  }
                }}
                className={`w-full px-4 py-3.5 border rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-teal-100 transition ${emailError ? "border-rose-400 focus:border-rose-500" : "border-slate-200 focus:border-teal-500"}`}
                required
              />
              {emailError && (
                <p className="text-xs text-rose-600 mt-1.5">{emailError}</p>
              )}

            </div>


            {/* Password */}
            <div>

              <div className="flex justify-between items-center mb-2">

                <label className="text-sm font-semibold text-slate-700">
                  Password
                </label>

                <button
                  type="button"
                  onClick={() => { setForgotEmail(email); setShowForgot(true); }}
                  className="text-sm text-teal-600 font-medium hover:text-teal-700"
                >
                  Forgot Password?
                </button>

              </div>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition"
                required
              />

            </div>


            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 text-white py-3.5 rounded-xl font-semibold hover:bg-teal-700 transition duration-200 shadow-sm disabled:opacity-70"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

          </form>


          {/* Register */}
          <p className="text-center text-slate-500 mt-7">

            Don't have an account?{" "}

            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-teal-600 font-semibold hover:text-teal-700"
            >
              Create Account
            </button>

          </p>

        </div>

      </div>


      {showForgot && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Reset Password</h3>
              <button type="button" onClick={() => setShowForgot(false)} className="text-slate-400 text-xl">×</button>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Enter your registered email and choose a new password.</p>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="Registered email" required className="w-full p-3.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 dark:text-white" />
              <input type="password" value={forgotPassword} onChange={(e) => setForgotPassword(e.target.value)} placeholder="New password" required minLength={6} className="w-full p-3.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 dark:text-white" />
              <input type="password" value={forgotConfirm} onChange={(e) => setForgotConfirm(e.target.value)} placeholder="Confirm new password" required minLength={6} className="w-full p-3.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 dark:text-white" />
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForgot(false)} className="px-5 py-2.5 border border-slate-300 rounded-lg text-slate-700 dark:text-slate-200">Cancel</button>
                <button disabled={resetting} className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg disabled:opacity-60">{resetting ? "Resetting..." : "Reset Password"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Login;
