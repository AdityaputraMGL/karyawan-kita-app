const LS = {
  users: "hr_users",
  employees: "hr_employees",
  attendance: "hr_attendance",
  payroll: "hr_payroll",
  leave: "hr_leave",
  performance: "hr_performance",
  session: "hr_session",
  resetTokens: "hr_reset_tokens",
};

const uid = (prefix = "id") =>
  prefix + "_" + Math.random().toString(36).slice(2, 9);
const get = (k) => JSON.parse(localStorage.getItem(k) || "[]");
const set = (k, v) => localStorage.setItem(k, JSON.stringify(v));

/** Seed data demo (hanya sekali, saat key belum ada) */
export function seed() {
  if (!localStorage.getItem(LS.users)) {
    set(LS.users, [
      {
        user_id: "u1",
        username: "admin",
        password: "admin123",
        email: "admin@x.com",
        role: "Admin",
      },
      {
        user_id: "u2",
        username: "hr",
        password: "hr123",
        email: "hr@x.com",
        role: "HR",
      },
      {
        user_id: "u3",
        username: "staff",
        password: "staff123",
        email: "s@x.com",
        role: "Karyawan",
      },
    ]);
  }
  if (!localStorage.getItem(LS.employees)) {
    set(LS.employees, [
      {
        employee_id: "e1",
        user_id: "u3",
        nama_lengkap: "Septian Naim",
        alamat: "Malang",
        no_hp: "08123",
        jabatan: "Frontend Dev",
        tanggal_masuk: "2024-02-01",
        status_karyawan: "tetap",
        // ⭐ Ditambahkan: Role untuk Karyawan
        role: "Karyawan",
      },
      {
        employee_id: "e2",
        user_id: null,
        nama_lengkap: "Ayu Lestari",
        alamat: "Jakarta",
        no_hp: "08111",
        jabatan: "HR Generalist",
        tanggal_masuk: "2023-06-12",
        status_karyawan: "tetap",
        // ⭐ Ditambahkan: Role untuk HR
        role: "HR",
      },
    ]);
  }
  ["attendance", "payroll", "leave", "performance", "resetTokens"].forEach(
    (key) => {
      if (!localStorage.getItem(LS[key])) set(LS[key], []);
    }
  );
}

/** Session */
export function getCurrentUser() {
  return JSON.parse(localStorage.getItem(LS.session) || "null");
}

/** === REGISTER === */
export function register({ username, password, email, role = "Karyawan" }) {
  const users = get(LS.users);

  if (!username || !password)
    throw new Error("Username dan password wajib diisi");
  const exists = users.some(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  );
  if (exists) throw new Error("Username sudah digunakan");

  const newUser = {
    user_id: uid("u"),
    username: username.trim(),
    password,
    email: (email || "").trim(),
    role,
  };
  users.push(newUser);
  set(LS.users, users);

  const emps = get(LS.employees);
  emps.push({
    employee_id: uid("emp"),
    user_id: newUser.user_id,
    nama_lengkap: newUser.username,
    alamat: "",
    no_hp: "",
    jabatan: role === "HR" ? "HR" : "Karyawan",
    tanggal_masuk: new Date().toISOString().slice(0, 10),
    status_karyawan: "magang",
    // ⭐ Ditambahkan: Role karyawan saat register
    role: role,
  });
  set(LS.employees, emps);

  const token = btoa(
    JSON.stringify({ sub: newUser.user_id, role: newUser.role, ts: Date.now() })
  );
  const session = {
    user_id: newUser.user_id,
    username: newUser.username,
    role: newUser.role,
    token,
  };
  localStorage.setItem(LS.session, JSON.stringify(session));
  return session;
}

/** === LOGIN === */
export async function login(username, password) {
  // ... (tidak ada perubahan di sini)
  const users = get(LS.users);
  const found = users.find(
    (u) => u.username === username && u.password === password
  );
  if (!found) throw new Error("Username/password salah");

  const token = btoa(
    JSON.stringify({ sub: found.user_id, role: found.role, ts: Date.now() })
  );
  const session = {
    user_id: found.user_id,
    username: found.username,
    role: found.role,
    token,
  };
  localStorage.setItem(LS.session, JSON.stringify(session));
  return session;
}

export function logout() {
  localStorage.removeItem(LS.session);
}

/** === FORGOT PASSWORD === */
// ... (tidak ada perubahan di sini)
export async function forgotPassword(email) {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const users = get(LS.users);
  const user = users.find(
    (u) => u.email && u.email.toLowerCase() === email.toLowerCase()
  );

  if (!user) {
    throw new Error("Email tidak terdaftar");
  }

  const token = generateResetToken();
  const resetData = {
    email: email.toLowerCase(),
    token: token,
    expiresAt: Date.now() + 3600000,
    createdAt: Date.now(),
  };

  const resetTokens = get(LS.resetTokens);
  const filteredTokens = resetTokens.filter(
    (rt) => rt.email !== email.toLowerCase()
  );
  filteredTokens.push(resetData);
  set(LS.resetTokens, filteredTokens);

  console.log("🔑 Reset Token (copy ini untuk testing):", token);
  console.log("📧 Email:", email);
  console.log("⏰ Expired dalam 1 jam");

  return {
    success: true,
    message: "Link reset password telah dikirim ke email Anda",
    devToken: token,
  };
}

/** === RESET PASSWORD === */
// ... (tidak ada perubahan di sini)
export async function resetPassword(token, newPassword) {
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (!newPassword || newPassword.length < 6) {
    throw new Error("Password minimal 6 karakter");
  }

  const resetTokens = get(LS.resetTokens);
  const resetData = resetTokens.find(
    (rt) => rt.token === token && rt.expiresAt > Date.now()
  );

  if (!resetData) {
    throw new Error("Token tidak valid atau sudah expired");
  }

  const users = get(LS.users);
  const userIndex = users.findIndex(
    (u) => u.email && u.email.toLowerCase() === resetData.email
  );

  if (userIndex === -1) {
    throw new Error("User tidak ditemukan");
  }

  users[userIndex].password = newPassword;
  set(LS.users, users);

  const updatedTokens = resetTokens.filter((rt) => rt.token !== token);
  set(LS.resetTokens, updatedTokens);

  console.log("✅ Password berhasil direset untuk:", resetData.email);

  return {
    success: true,
    message: "Password berhasil direset",
  };
}

function generateResetToken() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

export function cleanupExpiredTokens() {
  const resetTokens = get(LS.resetTokens);
  const validTokens = resetTokens.filter((rt) => rt.expiresAt > Date.now());
  set(LS.resetTokens, validTokens);
  console.log(
    `🧹 Cleanup: ${
      resetTokens.length - validTokens.length
    } expired tokens removed`
  );
}

/* ================= EMPLOYEES ================= */
export const employees = {
  findAll(q = "") {
    const data = get(LS.employees);
    if (!q) return data;
    const s = q.toLowerCase();
    return data.filter(
      (d) =>
        d.nama_lengkap.toLowerCase().includes(s) ||
        (d.jabatan || "").toLowerCase().includes(s)
    );
  },
  findById(id) {
    const employee = get(LS.employees).find(
      (e) => String(e.employee_id) === String(id)
    );
    // ⭐ Ambil role dari data users jika role employee belum tersedia
    if (employee && !employee.role && employee.user_id) {
      const user = get(LS.users).find((u) => u.user_id === employee.user_id);
      if (user) {
        return { ...employee, role: user.role };
      }
    }
    return employee;
  },
  create(payload) {
    const data = get(LS.employees);
    const employee = { employee_id: uid("emp"), ...payload };
    data.push(employee);
    set(LS.employees, data);
    return employee;
  },
  update(id, payload) {
    const data = get(LS.employees);
    const i = data.findIndex((e) => e.employee_id === id);
    if (i >= 0) {
      data[i] = { ...data[i], ...payload };
      set(LS.employees, data);
    }
  },
  remove(id) {
    set(
      LS.employees,
      get(LS.employees).filter((e) => e.employee_id !== id)
    );
  },
};

/* ================= ATTENDANCE ================= */
export const attendance = {
  // ... (tidak ada perubahan di sini)
  findAll() {
    return get(LS.attendance).sort((a, b) => (a.tanggal < b.tanggal ? -1 : 1));
  },
  create(payload) {
    const data = get(LS.attendance);
    const row = { attendance_id: uid("att"), ...payload };
    data.push(row);
    set(LS.attendance, data);
  }, // METHOD BARU: Update untuk approval status
  update(id, payload) {
    const data = get(LS.attendance);
    const i = data.findIndex((a) => a.attendance_id === id);
    if (i >= 0) {
      data[i] = { ...data[i], ...payload };
      set(LS.attendance, data);
    }
  }, // METHOD LAMA (bisa dihapus atau tetap dipertahankan untuk backward compatibility)
  approve(id, status) {
    const data = get(LS.attendance);
    const i = data.findIndex((a) => a.attendance_id === id);
    if (i >= 0) {
      data[i].status = status;
      set(LS.attendance, data);
    }
  },
};

/* ================= PAYROLL ================= */
// ... (tidak ada perubahan di sini)
export const payroll = {
  findAll() {
    return get(LS.payroll).sort((a, b) => (a.periode < b.periode ? 1 : -1));
  },
  create(payload) {
    const data = get(LS.payroll);
    const row = { payroll_id: uid("pay"), ...payload };
    data.push(row);
    set(LS.payroll, data);
  },
};

/* ================= LEAVE ================= */
// ... (tidak ada perubahan di sini)
export const leave = {
  findAll() {
    return get(LS.leave).sort((a, b) =>
      a.tanggal_pengajuan < b.tanggal_pengajuan ? 1 : -1
    );
  },
  create(payload) {
    const data = get(LS.leave);
    const row = { leave_id: uid("lv"), ...payload };
    data.push(row);
    set(LS.leave, data);
  },
  update(id, payload) {
    const data = get(LS.leave);
    const i = data.findIndex((x) => x.leave_id === id);
    if (i >= 0) {
      data[i] = { ...data[i], ...payload };
      set(LS.leave, data);
    }
  },
};

/* ================= PERFORMANCE ================= */
// ... (tidak ada perubahan di sini)
export const performance = {
  findAll() {
    return get(LS.performance);
  },
  create(payload) {
    const data = get(LS.performance);
    const row = { performance_id: uid("pf"), ...payload };
    data.push(row);
    set(LS.performance, data);
  },
};

/* ================= DASHBOARD STATS ================= */
// ... (tidak ada perubahan di sini)
export function stats() {
  const emps = employees.findAll();
  const today = new Date().toISOString().slice(0, 10);
  const atts = attendance.findAll().filter((a) => a.tanggal === today);
  const izin = atts.filter((a) => a.status !== "hadir").length;
  const cutiPending = leave
    .findAll()
    .filter((l) => l.status === "pending").length;
  const period = new Date().toISOString().slice(0, 7);
  const gajiBulanIni = payroll
    .findAll()
    .filter((p) => p.periode === period)
    .reduce((s, p) => s + Number(p.total_gaji || 0), 0);

  return {
    emp: emps.length,
    hadir: atts.length - izin,
    izin,
    cutiPending,
    gajiBulanIni,
  };
}
