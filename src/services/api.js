import axios from "axios";

// BASE URL API
const API_BASE_URL = "http://localhost:5000/api";

// Key untuk menyimpan Token dan Data User di LocalStorage
const LS = {
  userToken: "hr_userToken",
  currentUser: "hr_currentUser",
};

// -----------------------------------------------------------
// 1. AXIOS INSTANCE & INTERCEPTORS
// -----------------------------------------------------------

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor Permintaan
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(LS.userToken);

    console.log("📤 Request interceptor:");
    console.log("  - URL:", config.baseURL + config.url);

    if (token) {
      console.log("  - ✅ Token found, adding to headers");
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log("  - ⚠ No token found in localStorage");
    }

    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Fungsi Logout global
export function logout() {
  console.log("🚪 Logging out...");
  localStorage.removeItem(LS.userToken);
  localStorage.removeItem(LS.currentUser);

  // Redirect ke halaman login
  if (
    window.location.pathname !== "/login" &&
    window.location.pathname !== "/"
  ) {
    window.location.href = "/login";
  }
}

// Interceptor Respon - DIPERBAIKI
apiClient.interceptors.response.use(
  (response) => {
    console.log("✅ Response received:", response.config.url);
    return response;
  },
  (error) => {
    console.error("❌ Response error:", error);

    // Cek jika error karena network (backend tidak berjalan)
    if (!error.response) {
      console.error("❌ Backend tidak dapat dijangkau!");
      return Promise.reject(
        new Error(
          "Backend tidak dapat dijangkau. Pastikan server berjalan di port 5000."
        )
      );
    }

    const status = error.response.status;
    const errorData = error.response.data;

    console.error("  - Status:", status);
    console.error("  - Error data:", errorData);

    // PENTING: Hanya logout jika benar-benar masalah autentikasi
    if (status === 401) {
      console.error("❌ Auth error 401: Token invalid atau expired");

      // Cek apakah ini endpoint login (jangan logout saat login gagal)
      if (!error.config.url.includes("/login")) {
        logout();
        return Promise.reject(
          new Error("Sesi berakhir. Silakan login kembali.")
        );
      }
    }

    if (status === 403) {
      console.error("❌ Auth error 403: Akses ditolak");
      return Promise.reject(
        new Error("Anda tidak memiliki akses ke resource ini.")
      );
    }

    return Promise.reject(error);
  }
);

// -----------------------------------------------------------
// 2. FUNGSI AUTHENTIKASI
// -----------------------------------------------------------

export async function login(username, password) {
  try {
    console.log("🔐 Attempting login for:", username);
    const res = await apiClient.post("/users/login", { username, password });
    console.log("✅ Login response:", res.data);

    const { token, user } = res.data;

    if (!token) {
      throw new Error("Server tidak mengirim token");
    }

    console.log("💾 Saving token to localStorage");

    // Simpan token
    localStorage.setItem(LS.userToken, token);
    localStorage.setItem(LS.currentUser, JSON.stringify(user));

    // Verify
    const savedToken = localStorage.getItem(LS.userToken);
    console.log("✅ Token saved:", savedToken ? "YES" : "NO");

    if (!savedToken) {
      throw new Error("Gagal menyimpan token ke localStorage");
    }

    return user;
  } catch (error) {
    console.error("❌ Login error:", error);
    const errorMsg =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Login gagal";
    throw new Error(errorMsg);
  }
}

export async function register(payload) {
  try {
    console.log("📝 Attempting registration...");
    const res = await apiClient.post("/users/register", payload);
    const { token, user } = res.data;

    localStorage.setItem(LS.userToken, token);
    localStorage.setItem(LS.currentUser, JSON.stringify(user));
    console.log("✅ Registration successful");

    return user;
  } catch (error) {
    console.error("❌ Registration error:", error);
    const errorMsg =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Registrasi gagal";
    throw new Error(errorMsg);
  }
}

export function getCurrentUser() {
  const user = localStorage.getItem(LS.currentUser);
  return user ? JSON.parse(user) : null;
}

export function isAuthenticated() {
  const token = localStorage.getItem(LS.userToken);
  const user = getCurrentUser();
  return !!(token && user);
}

export function forgotPassword(email) {
  return apiClient.post("/users/forgot-password", { email });
}

export function resetPassword(token, newPassword) {
  return apiClient.post("/users/reset-password", { token, newPassword });
}

// ✅ TAMBAHAN: Fix Employee - create employee for existing user
export async function fixEmployee() {
  try {
    console.log("🔧 Attempting to fix employee...");
    const res = await apiClient.post("/users/fix-employee");
    console.log("✅ Fix employee response:", res.data);

    const { token, employee_id, message } = res.data;

    // Update token jika ada token baru
    if (token) {
      console.log("💾 Updating token in localStorage");
      localStorage.setItem(LS.userToken, token);

      // Update current user data dengan employee_id baru
      const currentUser = getCurrentUser();
      if (currentUser) {
        currentUser.employee_id = employee_id;
        localStorage.setItem(LS.currentUser, JSON.stringify(currentUser));
        console.log("✅ User data updated with employee_id:", employee_id);
      }
    }

    return res.data;
  } catch (error) {
    console.error("❌ Fix employee error:", error);
    const errorMsg =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Gagal membuat employee";
    throw new Error(errorMsg);
  }
}

// Helper untuk memastikan response adalah array
const ensureArray = (data) => {
  if (data && typeof data === "object" && Array.isArray(data.data)) {
    return data.data;
  }
  if (Array.isArray(data)) {
    return data;
  }
  return [];
};

// -----------------------------------------------------------
// 3. FUNGSI API LAINNYA
// -----------------------------------------------------------

// EMPLOYEE
export const employee = {
  findAll: async () => {
    try {
      console.log("📡 Fetching all employees...");
      const res = await apiClient.get("/employees");
      const employees = ensureArray(res.data);
      console.log(`✅ Loaded ${employees.length} employees`);
      return employees;
    } catch (error) {
      console.error("❌ Error fetching employees:", error.message);
      throw error;
    }
  },

  findById: async (id) => {
    try {
      const res = await apiClient.get(`/employees/${id}`);
      return res.data;
    } catch (error) {
      const errorMsg =
        error.response?.data?.error ||
        error.message ||
        "Gagal mengambil data karyawan.";
      throw new Error(errorMsg);
    }
  },

  create: async (payload) => {
    try {
      console.log("📤 Creating employee:", payload);
      const res = await apiClient.post("/employees", payload);
      console.log("✅ Employee created:", res.data);
      return res.data;
    } catch (error) {
      console.error("❌ Error creating employee:", error);
      const errorMsg =
        error.response?.data?.error ||
        error.message ||
        "Gagal menambahkan karyawan.";
      const errorDetails = error.response?.data?.details;
      const fullError = errorDetails
        ? `${errorMsg}\n${errorDetails}`
        : errorMsg;
      throw new Error(fullError);
    }
  },

  update: async (id, payload) => {
    try {
      const res = await apiClient.put(`/employees/${id}`, payload);
      return res.data;
    } catch (error) {
      const errorMsg =
        error.response?.data?.error ||
        error.message ||
        "Gagal mengupdate karyawan.";
      throw new Error(errorMsg);
    }
  },

  delete: async (id) => {
    try {
      console.log(`📤 Deleting employee ID: ${id}`);
      await apiClient.delete(`/employees/${id}`);
      console.log("✅ Employee deleted");
    } catch (error) {
      console.error("❌ Error deleting employee:", error);
      const errorMsg =
        error.response?.data?.error ||
        error.message ||
        "Gagal menghapus employee.";
      throw new Error(errorMsg);
    }
  },
};

// ATTENDANCE
export const attendance = {
  findAll: async () => {
    try {
      console.log("📡 Fetching all attendance...");
      const res = await apiClient.get("/attendance");
      const attendanceList = ensureArray(res.data);
      console.log(`✅ Loaded ${attendanceList.length} attendance records`);
      return attendanceList;
    } catch (error) {
      console.error("❌ Error fetching attendance:", error);
      console.error("  - Status:", error.response?.status);
      console.error("  - Data:", error.response?.data);
      throw error;
    }
  },

  findById: async (id) => {
    try {
      console.log(`📡 Fetching attendance ID: ${id}`);
      const res = await apiClient.get(`/attendance/${id}`);
      console.log("✅ Attendance loaded:", res.data);
      return res.data;
    } catch (error) {
      console.error("❌ Error fetching attendance:", error);
      const errorMsg =
        error.response?.data?.error ||
        error.message ||
        "Gagal mengambil data absensi.";
      throw new Error(errorMsg);
    }
  },

  create: async (payload) => {
    try {
      console.log("📤 Creating attendance:", payload);
      const res = await apiClient.post("/attendance", payload);
      console.log("✅ Attendance created:", res.data);
      return res.data;
    } catch (error) {
      console.error("❌ Error creating attendance:", error);
      const errorMsg =
        error.response?.data?.error ||
        error.message ||
        "Gagal menambahkan absensi.";
      const errorDetails = error.response?.data?.details;
      const fullError = errorDetails
        ? `${errorMsg}\n${errorDetails}`
        : errorMsg;
      throw new Error(fullError);
    }
  },

  update: async (id, payload) => {
    try {
      console.log(`📤 Updating attendance ID ${id}:`, payload);
      const res = await apiClient.put(`/attendance/${id}`, payload);
      console.log("✅ Attendance updated:", res.data);
      return res.data;
    } catch (error) {
      console.error("❌ Error updating attendance:", error);
      const errorMsg =
        error.response?.data?.error ||
        error.message ||
        "Gagal mengupdate absensi.";
      const errorDetails = error.response?.data?.details;
      const fullError = errorDetails
        ? `${errorMsg}\n${errorDetails}`
        : errorMsg;
      throw new Error(fullError);
    }
  },

  delete: async (id) => {
    try {
      console.log(`📤 Deleting attendance ID: ${id}`);
      await apiClient.delete(`/attendance/${id}`);
      console.log("✅ Attendance deleted");
    } catch (error) {
      console.error("❌ Error deleting attendance:", error);
      const errorMsg =
        error.response?.data?.error ||
        error.message ||
        "Gagal menghapus absensi.";
      throw new Error(errorMsg);
    }
  },

  checkin: async (payload) => {
    try {
      console.log("📤 Check-in:", payload);
      const res = await apiClient.post("/attendance/checkin", payload);
      console.log("✅ Check-in successful:", res.data);
      return res.data;
    } catch (error) {
      console.error("❌ Error during check-in:", error);
      const errorMsg =
        error.response?.data?.error ||
        error.message ||
        "Gagal melakukan check-in.";
      throw new Error(errorMsg);
    }
  },

  checkout: async (id, payload) => {
    try {
      console.log(`📤 Check-out for attendance ID ${id}:`, payload);
      const res = await apiClient.put(`/attendance/checkout/${id}`, payload);
      console.log("✅ Check-out successful:", res.data);
      return res.data;
    } catch (error) {
      console.error("❌ Error during check-out:", error);
      const errorMsg =
        error.response?.data?.error ||
        error.message ||
        "Gagal melakukan check-out.";
      throw new Error(errorMsg);
    }
  },
};

// PAYROLL - LENGKAP DENGAN DELETE
export const payroll = {
  findAll: async (period = "") => {
    try {
      console.log("📡 Fetching all payroll...");
      const res = await apiClient.get(`/payroll?period=${period}`);
      const payrollList = ensureArray(res.data);
      console.log(`✅ Loaded ${payrollList.length} payroll records`);
      return payrollList;
    } catch (error) {
      console.error("❌ Error fetching payroll:", error.message);
      throw error;
    }
  },

  findById: async (id) => {
    try {
      console.log(`📡 Fetching payroll ID: ${id}`);
      const res = await apiClient.get(`/payroll/${id}`);
      console.log("✅ Payroll loaded:", res.data);
      return res.data;
    } catch (error) {
      console.error("❌ Error fetching payroll:", error);
      const errorMsg =
        error.response?.data?.error ||
        error.message ||
        "Gagal mengambil data payroll.";
      throw new Error(errorMsg);
    }
  },

  create: async (payload) => {
    try {
      console.log("📤 Creating payroll:", payload);
      const res = await apiClient.post("/payroll", payload);
      console.log("✅ Payroll created:", res.data);
      return res.data;
    } catch (error) {
      console.error("❌ Error creating payroll:", error);
      const errorMsg =
        error.response?.data?.error ||
        error.message ||
        "Gagal menambahkan payroll.";
      const errorDetails = error.response?.data?.details;
      const fullError = errorDetails
        ? `${errorMsg}\n${errorDetails}`
        : errorMsg;
      throw new Error(fullError);
    }
  },

  update: async (id, payload) => {
    try {
      console.log(`📤 Updating payroll ID ${id}:`, payload);
      const res = await apiClient.put(`/payroll/${id}`, payload);
      console.log("✅ Payroll updated:", res.data);
      return res.data;
    } catch (error) {
      console.error("❌ Error updating payroll:", error);
      const errorMsg =
        error.response?.data?.error ||
        error.message ||
        "Gagal mengupdate payroll.";
      const errorDetails = error.response?.data?.details;
      const fullError = errorDetails
        ? `${errorMsg}\n${errorDetails}`
        : errorMsg;
      throw new Error(fullError);
    }
  },

  delete: async (id) => {
    try {
      console.log(`📤 Deleting payroll ID: ${id}`);
      await apiClient.delete(`/payroll/${id}`);
      console.log("✅ Payroll deleted");
    } catch (error) {
      console.error("❌ Error deleting payroll:", error);
      const errorMsg =
        error.response?.data?.error ||
        error.message ||
        "Gagal menghapus payroll.";
      throw new Error(errorMsg);
    }
  },

  // Fungsi helper untuk membersihkan data (jika diperlukan)
  cleanData: (payrollList) => {
    return payrollList.filter((p) => p && p.payroll_id);
  },
};

// LEAVE
export const leave = {
  findAll: async () => {
    try {
      const res = await apiClient.get("/leave");
      return ensureArray(res.data);
    } catch (error) {
      console.error("Error fetching leave:", error.message);
      throw error;
    }
  },
  create: async (payload) => {
    try {
      const res = await apiClient.post("/leave", payload);
      return res.data;
    } catch (error) {
      const errorMsg =
        error.response?.data?.error ||
        error.message ||
        "Gagal mengajukan cuti.";
      throw new Error(errorMsg);
    }
  },
  update: async (id, status) => {
    try {
      const res = await apiClient.put(`/leave/${id}`, { status });
      return res.data;
    } catch (error) {
      const errorMsg =
        error.response?.data?.error ||
        error.message ||
        "Gagal mengupdate cuti.";
      throw new Error(errorMsg);
    }
  },
  updateStatus: async (id, status) => {
    try {
      const res = await apiClient.put(`/leave/${id}/status`, { status });
      return res.data;
    } catch (error) {
      const errorMsg =
        error.response?.data?.error ||
        error.message ||
        "Gagal mengupdate status cuti.";
      throw new Error(errorMsg);
    }
  },
};

// PERFORMANCE
export const performance = {
  findAll: async () => {
    try {
      const res = await apiClient.get("/performance");
      return ensureArray(res.data);
    } catch (error) {
      console.error("Error fetching performance:", error.message);
      throw error;
    }
  },
  create: async (payload) => {
    try {
      const res = await apiClient.post("/performance", payload);
      return res.data;
    } catch (error) {
      const errorMsg =
        error.response?.data?.error ||
        error.message ||
        "Gagal menambahkan data performa.";
      throw new Error(errorMsg);
    }
  },
  update: async (id, payload) => {
    try {
      const res = await apiClient.put(`/performance/${id}`, payload);
      return res.data;
    } catch (error) {
      const errorMsg =
        error.response?.data?.error ||
        error.message ||
        "Gagal mengupdate data performa.";
      throw new Error(errorMsg);
    }
  },
};

// DASHBOARD STATS
export const stats = {
  getDashboard: async () => {
    try {
      const res = await apiClient.get("/stats/dashboard");
      const data = res.data;

      return {
        emp: data.emp || 0,
        hadir: data.hadir || 0,
        izin: data.izin || 0,
        cutiPending: data.cutiPending || 0,
        gajiBulanIni: data.gajiBulanIni || 0,
      };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      return {
        emp: 0,
        hadir: 0,
        izin: 0,
        cutiPending: 0,
        gajiBulanIni: 0,
      };
    }
  },
};
