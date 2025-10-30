import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import * as api from "../services/api";

export default function Attendance() {
  const [employees, setEmployees] = useState([]);
  const [list, setList] = useState([]);
  const { user } = useAuth();

  // Logika Role
  const isAdmin = user.role === "Admin";
  const isApprover = user.role === "HR";
  const loggedInEmployeeId = user.employee_id || user.username;

  const canSeeAllData = isAdmin || user.role === "HR";
  const canSeeAllDataAndInputForAll = isAdmin;

  // State untuk absensi hari ini
  const [todayAttendance, setTodayAttendance] = useState(null);

  // Inisialisasi state form
  const [form, setForm] = useState({
    employee_id: canSeeAllDataAndInputForAll ? "" : loggedInEmployeeId || "",
    tanggal: new Date().toISOString().split("T")[0], // Hari ini otomatis
    jam_masuk: "",
    jam_pulang: "",
    status: "hadir",
    tipe_kerja: "WFO",
  });

  const refresh = () => {
    let allAttendance = api.attendance.findAll();

    // Data difilter hanya jika user BUKAN Admin dan BUKAN HR
    if (!canSeeAllData && loggedInEmployeeId) {
      allAttendance = allAttendance.filter(
        (a) => a.employee_id === loggedInEmployeeId
      );
    }
    setList(allAttendance);

    // Cek apakah sudah ada absensi hari ini
    checkTodayAttendance(allAttendance);
  };

  // Cek absensi hari ini
  const checkTodayAttendance = (allAttendance) => {
    const today = new Date().toISOString().split("T")[0];
    const todayData = allAttendance.find(
      (a) => a.employee_id === loggedInEmployeeId && a.tanggal === today
    );
    setTodayAttendance(todayData || null);
  };

  useEffect(() => {
    setEmployees(api.employees.findAll());
    refresh();
  }, [isAdmin, loggedInEmployeeId, user.role]);

  // Fungsi Absen Masuk
  const absenMasuk = () => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;
    const today = now.toISOString().split("T")[0];

    api.attendance.create({
      employee_id: loggedInEmployeeId,
      tanggal: today,
      jam_masuk: currentTime,
      jam_pulang: "",
      status: "hadir",
      tipe_kerja: form.tipe_kerja,
      // ⭐ Tambahkan field role pencatat
      recorded_by_role: user.role,
    });

    alert(`✓ Absen Masuk berhasil pada ${currentTime}`);
    refresh();
  };

  // Fungsi Absen Pulang
  const absenPulang = () => {
    if (!todayAttendance) {
      alert("⚠️ Anda belum absen masuk hari ini!");
      return;
    }

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    // Note: Update tidak perlu menambahkan recorded_by_role karena ini kelanjutan dari absen masuk
    api.attendance.update(todayAttendance.attendance_id, {
      jam_pulang: currentTime,
    });

    alert(`✓ Absen Pulang berhasil pada ${currentTime}`);
    refresh();
  };

  // Form submit untuk Admin (manual entry)
  const submitManual = (e) => {
    e.preventDefault();

    let finalEmployeeId = form.employee_id;
    if (!canSeeAllDataAndInputForAll) {
      finalEmployeeId = loggedInEmployeeId;
    }

    if (!finalEmployeeId) {
      alert("Gagal mencatat absensi. ID karyawan Anda tidak ditemukan.");
      return;
    }

    api.attendance.create({
      ...form,
      employee_id: finalEmployeeId,
      // ⭐ Tambahkan field role pencatat (role yang sedang login, Admin/HR)
      recorded_by_role: user.role,
    });

    setForm({
      employee_id: canSeeAllDataAndInputForAll ? "" : loggedInEmployeeId || "",
      tanggal: new Date().toISOString().split("T")[0],
      jam_masuk: "",
      jam_pulang: "",
      status: "hadir",
      tipe_kerja: "WFO",
    });
    refresh();
  };

  const getCurrentTime = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;
  };

  return (
    <div>
      <h1>Absensi</h1>

      {/* Quick Absen untuk Karyawan & HR (bukan Admin) */}
      {!isAdmin && (
        <div className="card" style={{ marginBottom: "1rem" }}>
          <h3 style={{ marginTop: 0 }}>⚡ Quick Absen - {getCurrentTime()}</h3>

          {/* Info Status Absen Hari Ini */}
          {todayAttendance && (
            <div
              style={{
                marginBottom: "1rem",
                padding: "1rem",
                background: "#107698ff",
                borderRadius: "8px",
                borderLeft: "4px solid #277393ff",
              }}
            >
              <strong>📋 Status Absen Hari Ini:</strong>
              <div style={{ marginTop: "0.5rem", fontSize: "14px" }}>
                🕐 Masuk: <strong>{todayAttendance.jam_masuk || "-"}</strong> |
                🕐 Pulang:{" "}
                <strong>{todayAttendance.jam_pulang || "Belum absen"}</strong> |
                📍 Tipe: <strong>{todayAttendance.tipe_kerja}</strong>
              </div>
            </div>
          )}

          {/* Tombol Absen Masuk dan Pulang */}
          <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
            <button
              className="btn"
              onClick={absenMasuk}
              disabled={todayAttendance !== null}
              style={{
                background: todayAttendance ? "#ccc" : "#4caf50",
                color: "white",
                padding: "1rem 2rem",
                fontSize: "16px",
                cursor: todayAttendance ? "not-allowed" : "pointer",
                flex: 1,
              }}
            >
              {todayAttendance
                ? "✓ Sudah Absen Masuk"
                : "🏢 Absen Masuk Sekarang"}
            </button>

            <button
              className="btn"
              onClick={absenPulang}
              disabled={!todayAttendance || todayAttendance.jam_pulang}
              style={{
                background:
                  !todayAttendance || todayAttendance?.jam_pulang
                    ? "#ccc"
                    : "#f44336",
                color: "white",
                padding: "1rem 2rem",
                fontSize: "16px",
                cursor:
                  !todayAttendance || todayAttendance?.jam_pulang
                    ? "not-allowed"
                    : "pointer",
                flex: 1,
              }}
            >
              {todayAttendance?.jam_pulang
                ? "✓ Sudah Absen Pulang"
                : "🏠 Absen Pulang Sekarang"}
            </button>
          </div>

          {/* Pilih Tipe Kerja - hanya muncul jika belum absen masuk */}
          {!todayAttendance && (
            <div style={{ marginBottom: "0.5rem" }}>
              <label
                style={{
                  fontWeight: "bold",
                  marginBottom: "0.5rem",
                  display: "block",
                }}
              >
                Tipe Kerja Hari Ini:
              </label>
              <select
                value={form.tipe_kerja}
                onChange={(e) =>
                  setForm({ ...form, tipe_kerja: e.target.value })
                }
                style={{
                  padding: "0.5rem",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  fontSize: "14px",
                  width: "100%",
                }}
              >
                <option value="WFO">WFO (Work From Office)</option>
                <option value="WFH">WFH (Work From Home)</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          )}
        </div>
      )}

      {/* Form Manual HANYA untuk Admin */}
      {isAdmin && (
        <form className="card grid cols-3" onSubmit={submitManual}>
          <h3 style={{ gridColumn: "1 / -1", marginTop: 0 }}>
            📝 Input Manual Absensi (Admin)
          </h3>

          {/* Field Karyawan */}
          <div>
            <label>Karyawan</label>
            <select
              value={form.employee_id}
              onChange={(e) =>
                setForm({ ...form, employee_id: e.target.value })
              }
            >
              <option value="">- pilih -</option>
              {employees.map((e) => (
                <option key={e.employee_id} value={e.employee_id}>
                  {e.nama_lengkap}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Tanggal</label>
            <input
              type="date"
              value={form.tanggal}
              onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
            />
          </div>
          <div>
            <label>Jam Masuk</label>
            <input
              type="time"
              value={form.jam_masuk}
              onChange={(e) => setForm({ ...form, jam_masuk: e.target.value })}
            />
          </div>
          <div>
            <label>Jam Pulang</label>
            <input
              type="time"
              value={form.jam_pulang}
              onChange={(e) => setForm({ ...form, jam_pulang: e.target.value })}
            />
          </div>
          <div>
            <label>Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option>hadir</option>
              <option>izin</option>
              <option>sakit</option>
              <option>alpa</option>
            </select>
          </div>
          <div>
            <label>Tipe Kerja</label>
            <select
              value={form.tipe_kerja}
              onChange={(e) => setForm({ ...form, tipe_kerja: e.target.value })}
            >
              <option value="WFO">WFO (Work From Office)</option>
              <option value="WFH">WFH (Work From Home)</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>
          <div className="flex">
            <button className="btn" type="submit">
              Catat Manual
            </button>
          </div>
        </form>
      )}

      {/* Bagian Informasi */}
      {user.role !== "HR" && !isAdmin && (
        <div
          className="card"
          style={{
            background: "#e3f2fd",
            border: "1px solid #2196f3",
            padding: "1rem",
            marginBottom: "1rem",
          }}
        >
          <p style={{ margin: 0, color: "#1976d2" }}>
            ℹ️ Gunakan tombol Quick Absen di atas untuk mencatat kehadiran Anda
            dengan cepat.
          </p>
        </div>
      )}

      {isApprover && (
        <div
          className="card"
          style={{
            background: "#e8f5e9",
            border: "1px solid #4caf50",
            padding: "1rem",
            marginBottom: "1rem",
          }}
        >
          <p style={{ margin: 0, color: "#2e7d32" }}>
            ✓ Anda dapat melihat data absensi semua karyawan di bawah ini.
          </p>
        </div>
      )}

      {/* Tabel Absensi */}
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Nama</th>
              <th>Masuk</th>
              <th>Pulang</th>
              <th>Status</th>
              <th>Tipe Kerja</th>
              {/* ⭐ Tampilkan Role Pencatat hanya untuk Admin/HR */}
              {canSeeAllData && <th>Role Pencatat</th>}
            </tr>
          </thead>
          <tbody>
            {list.map((a) => {
              const emp = canSeeAllData
                ? api.employees.findById(a.employee_id)
                : user;

              return (
                <tr key={a.attendance_id}>
                  <td>{a.tanggal}</td>
                  <td>
                    {emp?.nama_lengkap || emp?.username || a.employee_id || "-"}
                  </td>
                  <td>{a.jam_masuk}</td>
                  <td>{a.jam_pulang || "-"}</td>
                  <td>{a.status}</td>
                  <td>
                    <span
                      className={`badge badge-${
                        a.tipe_kerja?.toLowerCase() || "wfo"
                      }`}
                    >
                      {a.tipe_kerja || "WFO"}
                    </span>
                  </td>
                  {/* ⭐ Tampilkan data Role Pencatat hanya untuk Admin/HR */}
                  {canSeeAllData && (
                    <td>
                      {/* Default ke 'Karyawan' jika data lama/tidak ada role pencatat */}
                      {a.recorded_by_role || "Karyawan"}
                    </td>
                  )}
                </tr>
              );
            })}
            {list.length === 0 && (
              <tr>
                <td colSpan={canSeeAllData ? "7" : "6"}>
                  <i>Belum ada catatan absensi.</i>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
