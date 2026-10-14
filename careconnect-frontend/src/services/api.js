// WithUSync API Client
const API_BASE_URL = "/api";

// Helper to retrieve token from localStorage
export const getStoredToken = () => {
  return localStorage.getItem("careconnect_token");
};

export const getStoredUser = () => {
  const user = localStorage.getItem("careconnect_user");

  if (!user) return null;

  try {
    return JSON.parse(user);
  } catch {
    clearAuthSession();
    return null;
  }
};

export const setAuthSession = (token, user) => {
  localStorage.setItem("careconnect_token", token);
  localStorage.setItem("careconnect_user", JSON.stringify(user));
};

export const clearAuthSession = () => {
  localStorage.removeItem("careconnect_token");
  localStorage.removeItem("careconnect_user");
};

// Generic fetch wrapper with automatic Authorization header
async function request(endpoint, options = {}) {
  const token = getStoredToken();

  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(!isFormData ? { "Content-Type": "application/json" } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      data.message || `Request failed with status ${response.status}`
    );

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
}
export const api = {
  // Authentication
  auth: {
    login: async (email, password) => {
      const res = await request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      if (res.token && res.user) {
        setAuthSession(res.token, res.user);
      }
      return res;
    },
    register: async (userData) => {
      const res = await request("/auth/register", {
        method: "POST",
        body: JSON.stringify(userData),
      });
      if (res.token && res.user) {
        setAuthSession(res.token, res.user);
      }
      return res;
    },
    me: () => request("/auth/me"),
    updatePassword: (currentPassword, newPassword) =>
      request("/auth/update-password", {
        method: "PUT",
        body: JSON.stringify({ currentPassword, newPassword }),
      }),
    forgotPassword: (emailOrData, newPassword) => {
      const data =
        typeof emailOrData === "object" && emailOrData !== null
          ? emailOrData
          : { email: emailOrData, newPassword };

      return request("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    logout: () => {
      clearAuthSession();
    },
  },

  // Users & Doctors & Patients
  users: {
    getDoctors: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/users/doctors${query ? `?${query}` : ""}`);
    },
    getDoctorById: (id) => request(`/users/doctors/${id}`),
    getPatients: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/users/patients${query ? `?${query}` : ""}`);
    },
    getPatientById: (id) => request(`/users/patients/${id}`),
    updatePatientDetails: (id, details) =>
      request(`/users/patients/${id}`, {
        method: "PUT",
        body: JSON.stringify(details),
      }),
    updateProfile: (profileData) =>
      request("/users/profile", {
        method: "PUT",
        body: JSON.stringify(profileData),
      }),
    uploadAvatar: (formData) =>
      request("/users/profile/avatar", {
        method: "POST",
        body: formData,
      }),
  },

  // Appointments
  appointments: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/appointments${query ? `?${query}` : ""}`);
    },
    getById: (id) => request(`/appointments/${id}`),
    create: (appointmentData) =>
      request("/appointments", {
        method: "POST",
        body: JSON.stringify(appointmentData),
      }),
    updateStatus: (id, status, doctorNotes = "") =>
      request(`/appointments/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, doctorNotes }),
      }),
    cancel: (id) =>
      request(`/appointments/${id}`, {
        method: "DELETE",
      }),
  },

  // Prescriptions
  prescriptions: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/prescriptions${query ? `?${query}` : ""}`);
    },
    create: (prescriptionData) =>
      request("/prescriptions", {
        method: "POST",
        body: JSON.stringify(prescriptionData),
      }),
    getById: (id) => request(`/prescriptions/${id}`),
    updateStatus: (id, status) =>
      request(`/prescriptions/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
  },



  // Medical Reports
  reports: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/reports${query ? `?${query}` : ""}`);
    },
    getById: (id) => request(`/reports/${id}`),
    create: (reportData) =>
      request("/reports", {
        method: "POST",
        body: reportData,
      }),

    remove: (id) =>
    request(`/reports/${id}`, {
      method: "DELETE",
    }),
    review: (id, findings, doctorNotes, status = "Reviewed") =>
      request(`/reports/${id}/review`, {
        method: "PUT",
        body: JSON.stringify({ findings, doctorNotes, status }),
      }),
  },

  // Health Vitals
  vitals: {
    getPatient: (patientId) =>
    request(`/vitals/patient/${patientId}`),
    getLatest: (patientId) => {
      const query = patientId ? `?patientId=${patientId}` : "";
      return request(`/vitals/latest${query}`);
    },
    getHistory: (patientId) => {
      const query = patientId ? `?patientId=${patientId}` : "";
      return request(`/vitals/history${query}`);
    },
    record: (vitalsData) =>
      request("/vitals", {
        method: "POST",
        body: JSON.stringify(vitalsData),
      }),
    update: (id, vitalData) =>
      request(`/vitals/${id}`, {
        method: "PUT",
        body: JSON.stringify(vitalData),
      }),
    remove: (id) =>
      request(`/vitals/${id}`, { method: "DELETE" }),
  },

  // Dashboards
  dashboard: {
    getPatient: () => request("/dashboard/patient"),
    getDoctor: () => request("/dashboard/doctor"),
  },


  // Admin
  admin: {
    getStats: () => request("/admin/stats"),
    getDoctors: () => request("/admin/doctors"),
    createDoctor: (doctorData) =>
      request("/admin/doctors", {
        method: "POST",
        body: JSON.stringify(doctorData),
      }),
    deleteDoctor: (id) =>
      request(`/admin/doctors/${id}`, { method: "DELETE" }),
    getPatients: () => request("/admin/patients"),
    createPatient: (patientData) =>
      request("/admin/patients", {
        method: "POST",
        body: JSON.stringify(patientData),
      }),
    deletePatient: (id) =>
      request(`/admin/patients/${id}`, { method: "DELETE" }),
    assignPatient: (patientId, doctorId) =>
      request(`/admin/patients/${patientId}/assign`, {
        method: "PUT",
        body: JSON.stringify({ doctorId }),
      }),
    getAppointments: () => request("/admin/appointments"),
  },

  // Notifications
  notifications: {
    getAll: () => request("/notifications"),
    markRead: (id) => request(`/notifications/${id}/read`, { method: "PATCH" }),
    markAllRead: () => request("/notifications/read-all", { method: "PATCH" }),
  },
};

export default api;
