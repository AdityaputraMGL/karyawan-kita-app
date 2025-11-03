import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import * as api from "../services/api";

// --- Inline Styles untuk Kerapian dan Konsistensi ---
const styles = {
  // Global Padding
  mainContainer: {
    padding: "2rem 1.5rem 1.5rem 1.5rem",
  },
  title: {
    fontSize: "2.2rem",
    fontWeight: "700",
    color: "#fff",
    marginBottom: "1.5rem",
  },
  // Form Manual Admin (Card)
  card: {
    backgroundColor: "#2C3150",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
    padding: "1.5rem",
    marginBottom: "1.5rem",
  },
  // Grid layout untuk form manual
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "1.5rem 2rem",
  },
  // Style untuk Label dan Input/Select
  formElement: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
  },
  label: {
    fontSize: "0.9rem",
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.7)",
  },
  inputField: {
    padding: "0.6rem 0.8rem",
    borderRadius: "8px",
    border: "1px solid #3A4068",
    backgroundColor: "#3A4068",
    color: "white",
    fontSize: "0.9rem",
    appearance: "none",
  },
  // Tombol Submit
  btnPrimary: {
    padding: "0.6rem 1rem",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    border: "none",
    fontSize: "0.9rem",
    backgroundColor: "#5C54A4",
    color: "#fff",
  },
  // Tabel Styling
  table: {
    width: "100%",
    borderCollapse: "collapse",
    color: "white",
  },
  tableHeader: {
    backgroundColor: "#3A4068",
    textAlign: "left",
  },
  th: {
    padding: "0.8rem 1.5rem",
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.8)",
  },
  td: {
    padding: "0.8rem 1.5rem",
    fontSize: "0.9rem",
    borderBottom: "1px solid #3A4068",
  },
  // Quick Absen Styling
  quickAbsenCard: {
    backgroundColor: "#2C3150",
    borderRadius: "12px",
    padding: "1.5rem",
    marginBottom: "1.5rem",
  },
  absentBtn: {
    padding: "0.8rem 1.5rem",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "15px",
    flex: 1,
    border: "none",
    transition: "background-color 0.2s",
  },
  locationCard: {
    backgroundColor: "#3A4068",
    borderRadius: "8px",
    padding: "1rem",
    marginBottom: "1rem",
    borderLeft: "4px solid #2196F3",
  },
  locationLoading: {
    backgroundColor: "#3A4068",
    borderRadius: "8px",
    padding: "1rem",
    marginBottom: "1rem",
    borderLeft: "4px solid #FFA726",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  locationError: {
    backgroundColor: "#3A4068",
    borderRadius: "8px",
    padding: "1rem",
    marginBottom: "1rem",
    borderLeft: "4px solid #f44336",
  },
  spinner: {
    width: "16px",
    height: "16px",
    border: "3px solid rgba(255,255,255,0.3)",
    borderTop: "3px solid #FFA726",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
};
// --- End Inline Styles ---

export default function Attendance() {
  const [employees, setEmployees] = useState([]);
  const [list, setList] = useState([]);
  const { user } = useAuth();

  const isAdmin = user.role === "Admin";
  const isApprover = user.role === "HR";
  const loggedInEmployeeId = user.employee_id || user.username;

  const canSeeAllData = isAdmin || user.role === "HR";
  const canSeeAllDataAndInputForAll = isAdmin;

  const [todayAttendance, setTodayAttendance] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [watchId, setWatchId] = useState(null);

  const [form, setForm] = useState({
    employee_id: canSeeAllDataAndInputForAll ? "" : loggedInEmployeeId || "",
    tanggal: new Date().toISOString().split("T")[0],
    jam_masuk: "",
    jam_pulang: "",
    status: "hadir",
    tipe_kerja: "WFO",
  });

  const refresh = () => {
    let allAttendance = api.attendance.findAll();

    if (!canSeeAllData && loggedInEmployeeId) {
      allAttendance = allAttendance.filter(
        (a) => a.employee_id === loggedInEmployeeId
      );
    }
    setList(allAttendance);
    checkTodayAttendance(allAttendance);
  };

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

    // Auto-start location tracking untuk non-admin
    if (!isAdmin) {
      startLocationTracking();
    }

    // Cleanup saat component unmount
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isAdmin, loggedInEmployeeId, user.role]);

  // ============= AUTO LOCATION TRACKING =============
  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      setLocationError("Browser Anda tidak mendukung Geolocation");
      return;
    }

    setLocationLoading(true);

    // Watch position untuk update realtime
    const id = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString(),
        };
        setCurrentLocation(location);
        setLocationLoading(false);
        setLocationError(null);
      },
      (error) => {
        setLocationLoading(false);
        let errorMessage = "Gagal mendapatkan lokasi";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Akses lokasi ditolak. Mohon izinkan akses lokasi di browser Anda untuk menggunakan fitur absensi.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage =
              "Informasi lokasi tidak tersedia. Pastikan GPS perangkat Anda aktif.";
            break;
          case error.TIMEOUT:
            errorMessage =
              "Waktu habis saat mencoba mendapatkan lokasi. Coba refresh halaman.";
            break;
        }
        setLocationError(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000, // Cache location for 5 seconds
      }
    );

    setWatchId(id);
  };

  const retryLocation = () => {
    setLocationError(null);
    setLocationLoading(true);
    startLocationTracking();
  };

  // ============= ATTENDANCE FUNCTIONS WITH LOCATION =============
  const absenMasuk = () => {
    if (!currentLocation) {
      alert(
        "⚠️ Lokasi belum terdeteksi. Mohon tunggu beberapa saat atau izinkan akses lokasi."
      );
      return;
    }

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
      recorded_by_role: user.role,
      lokasi_masuk: `${currentLocation.latitude},${currentLocation.longitude}`,
      akurasi_masuk: Math.round(currentLocation.accuracy),
    });

    alert(
      `✓ Absen Masuk berhasil pada ${currentTime}\n📍 Lokasi: ${currentLocation.latitude.toFixed(
        6
      )}, ${currentLocation.longitude.toFixed(6)}\n📏 Akurasi: ${Math.round(
        currentLocation.accuracy
      )}m`
    );
    refresh();
  };

  const absenPulang = () => {
    if (!todayAttendance) {
      alert("⚠️ Anda belum absen masuk hari ini!");
      return;
    }

    if (!currentLocation) {
      alert(
        "⚠️ Lokasi belum terdeteksi. Mohon tunggu beberapa saat atau izinkan akses lokasi."
      );
      return;
    }

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    api.attendance.update(todayAttendance.attendance_id, {
      jam_pulang: currentTime,
      lokasi_pulang: `${currentLocation.latitude},${currentLocation.longitude}`,
      akurasi_pulang: Math.round(currentLocation.accuracy),
    });

    alert(
      `✓ Absen Pulang berhasil pada ${currentTime}\n📍 Lokasi: ${currentLocation.latitude.toFixed(
        6
      )}, ${currentLocation.longitude.toFixed(6)}\n📏 Akurasi: ${Math.round(
        currentLocation.accuracy
      )}m`
    );
    refresh();
  };

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
    <div style={styles.mainContainer}>
      {/* CSS Animation untuk spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <h1 style={styles.title}>Absensi</h1>

      {/* Quick Absen untuk Karyawan & HR (bukan Admin) */}
      {!isAdmin && (
        <div style={styles.quickAbsenCard}>
          <h3
            style={{
              marginTop: 0,
              color: "#fff",
              fontSize: "1.2rem",
              marginBottom: "1rem",
            }}
          >
            ⚡ Quick Absen - {getCurrentTime()}
          </h3>

          {/* Real-time Location Display */}
          {locationLoading && (
            <div style={styles.locationLoading}>
              <div style={styles.spinner}></div>
              <div style={{ color: "#fff", fontSize: "14px" }}>
                🔍 Mendeteksi lokasi Anda...
              </div>
            </div>
          )}

          {locationError && (
            <div style={styles.locationError}>
              <div
                style={{
                  color: "#fff",
                  fontSize: "14px",
                  marginBottom: "0.5rem",
                }}
              >
                <strong>❌ Error Lokasi:</strong>
                <div
                  style={{
                    marginTop: "0.3rem",
                    color: "rgba(255,255,255,0.8)",
                  }}
                >
                  {locationError}
                </div>
              </div>
              <button
                onClick={retryLocation}
                style={{
                  ...styles.btnPrimary,
                  backgroundColor: "#FF9800",
                  marginTop: "0.5rem",
                  fontSize: "13px",
                  padding: "0.5rem 1rem",
                }}
              >
                🔄 Coba Lagi
              </button>
            </div>
          )}

          {currentLocation && !locationError && (
            <div style={styles.locationCard}>
              <div
                style={{
                  color: "#fff",
                  fontSize: "14px",
                  marginBottom: "0.5rem",
                }}
              >
                <strong>📍 Lokasi Anda Saat Ini:</strong>
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.85)",
                  marginBottom: "0.3rem",
                }}
              >
                🌐 Koordinat:{" "}
                <a
                  href={`https://www.google.com/maps?q=${currentLocation.latitude},${currentLocation.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#5C9EFF", textDecoration: "underline" }}
                >
                  {currentLocation.latitude.toFixed(6)},{" "}
                  {currentLocation.longitude.toFixed(6)}
                </a>
              </div>
              <div
                style={{ fontSize: "13px", color: "rgba(255,255,255,0.85)" }}
              >
                📏 Akurasi:{" "}
                <strong>{Math.round(currentLocation.accuracy)}m</strong>
                {currentLocation.accuracy < 20 && " ✓ Sangat Akurat"}
                {currentLocation.accuracy >= 20 &&
                  currentLocation.accuracy < 50 &&
                  " ⚠️ Cukup Akurat"}
                {currentLocation.accuracy >= 50 && " ⚠️ Kurang Akurat"}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.6)",
                  marginTop: "0.5rem",
                }}
              >
                💡 Lokasi ini akan dicatat saat Anda melakukan absensi
              </div>
            </div>
          )}

          {/* Info Status Absen Hari Ini */}
          {todayAttendance && (
            <div
              style={{
                marginBottom: "1rem",
                padding: "1rem",
                background: "#3A4068",
                borderRadius: "8px",
                borderLeft: "4px solid #4CAF50",
                color: "#fff",
              }}
            >
              <strong>📋 Status Absen Hari Ini:</strong>
              <div style={{ marginTop: "0.5rem", fontSize: "14px" }}>
                🕐 Masuk: <strong>{todayAttendance.jam_masuk || "-"}</strong> |
                🕐 Pulang:{" "}
                <strong>{todayAttendance.jam_pulang || "Belum absen"}</strong> |
                📍 Tipe: <strong>{todayAttendance.tipe_kerja}</strong>
              </div>
              {todayAttendance.lokasi_masuk && (
                <div
                  style={{
                    marginTop: "0.5rem",
                    fontSize: "13px",
                    color: "rgba(255,255,255,0.8)",
                  }}
                >
                  📍 Lokasi Masuk:{" "}
                  <a
                    href={`https://www.google.com/maps?q=${todayAttendance.lokasi_masuk}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#5C9EFF", textDecoration: "underline" }}
                  >
                    {todayAttendance.lokasi_masuk}
                  </a>{" "}
                  ({todayAttendance.akurasi_masuk}m)
                </div>
              )}
              {todayAttendance.lokasi_pulang && (
                <div
                  style={{
                    marginTop: "0.3rem",
                    fontSize: "13px",
                    color: "rgba(255,255,255,0.8)",
                  }}
                >
                  📍 Lokasi Pulang:{" "}
                  <a
                    href={`https://www.google.com/maps?q=${todayAttendance.lokasi_pulang}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#5C9EFF", textDecoration: "underline" }}
                  >
                    {todayAttendance.lokasi_pulang}
                  </a>{" "}
                  ({todayAttendance.akurasi_pulang}m)
                </div>
              )}
            </div>
          )}

          {/* Pilih Tipe Kerja - hanya muncul jika belum absen masuk */}
          {!todayAttendance && (
            <div style={{ marginBottom: "1rem" }}>
              <label style={styles.label}>Tipe Kerja Hari Ini:</label>
              <select
                value={form.tipe_kerja}
                onChange={(e) =>
                  setForm({ ...form, tipe_kerja: e.target.value })
                }
                style={{
                  ...styles.inputField,
                  width: "100%",
                  marginBottom: "1rem",
                }}
              >
                <option value="WFO">WFO (Work From Office)</option>
                <option value="WFH">WFH (Work From Home)</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          )}

          {/* Tombol Absen Masuk dan Pulang */}
          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              onClick={absenMasuk}
              disabled={todayAttendance !== null || !currentLocation}
              style={{
                ...styles.absentBtn,
                background: todayAttendance
                  ? "#444"
                  : !currentLocation
                  ? "#666"
                  : "#4caf50",
                color: "white",
                cursor:
                  todayAttendance || !currentLocation
                    ? "not-allowed"
                    : "pointer",
                opacity: !currentLocation && !todayAttendance ? 0.7 : 1,
              }}
            >
              {todayAttendance
                ? "✓ Sudah Absen Masuk"
                : !currentLocation
                ? "⏳ Menunggu Lokasi..."
                : "🏢 Absen Masuk Sekarang"}
            </button>

            <button
              onClick={absenPulang}
              disabled={
                !todayAttendance ||
                todayAttendance.jam_pulang ||
                !currentLocation
              }
              style={{
                ...styles.absentBtn,
                background:
                  !todayAttendance || todayAttendance?.jam_pulang
                    ? "#444"
                    : !currentLocation
                    ? "#666"
                    : "#FF6347",
                color: "white",
                cursor:
                  !todayAttendance ||
                  todayAttendance?.jam_pulang ||
                  !currentLocation
                    ? "not-allowed"
                    : "pointer",
                opacity:
                  !currentLocation &&
                  todayAttendance &&
                  !todayAttendance.jam_pulang
                    ? 0.7
                    : 1,
              }}
            >
              {todayAttendance?.jam_pulang
                ? "✓ Sudah Absen Pulang"
                : !todayAttendance
                ? "🏠 Absen Pulang"
                : !currentLocation
                ? "⏳ Menunggu Lokasi..."
                : "🏠 Absen Pulang Sekarang"}
            </button>
          </div>
        </div>
      )}

      {/* Form Manual HANYA untuk Admin */}
      {isAdmin && (
        <form
          style={{ ...styles.card, ...styles.formGrid }}
          onSubmit={submitManual}
        >
          <h3
            style={{
              gridColumn: "1 / -1",
              marginTop: 0,
              color: "#fff",
              fontSize: "1.2rem",
            }}
          >
            📝 Input Manual Absensi (Admin)
          </h3>

          {/* Field Karyawan */}
          <div style={styles.formElement}>
            <label style={styles.label}>Karyawan</label>
            <select
              style={styles.inputField}
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

          <div style={styles.formElement}>
            <label style={styles.label}>Tanggal</label>
            <input
              style={styles.inputField}
              type="date"
              value={form.tanggal}
              onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
            />
          </div>
          <div style={styles.formElement}>
            <label style={styles.label}>Jam Masuk</label>
            <input
              style={styles.inputField}
              type="time"
              value={form.jam_masuk}
              onChange={(e) => setForm({ ...form, jam_masuk: e.target.value })}
            />
          </div>
          <div style={styles.formElement}>
            <label style={styles.label}>Jam Pulang</label>
            <input
              style={styles.inputField}
              type="time"
              value={form.jam_pulang}
              onChange={(e) => setForm({ ...form, jam_pulang: e.target.value })}
            />
          </div>
          <div style={styles.formElement}>
            <label style={styles.label}>Status</label>
            <select
              style={styles.inputField}
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option>hadir</option>
              <option>izin</option>
              <option>sakit</option>
              <option>alpa</option>
            </select>
          </div>
          <div style={styles.formElement}>
            <label style={styles.label}>Tipe Kerja</label>
            <select
              style={styles.inputField}
              value={form.tipe_kerja}
              onChange={(e) => setForm({ ...form, tipe_kerja: e.target.value })}
            >
              <option value="WFO">WFO (Work From Office)</option>
              <option value="WFH">WFH (Work From Home)</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>
          <div
            style={{
              ...styles.formElement,
              flexDirection: "row",
              alignItems: "flex-end",
            }}
          >
            <button style={styles.btnPrimary} type="submit">
              Catat Manual
            </button>
          </div>
        </form>
      )}

      {/* Tabel Absensi */}
      <div style={{ ...styles.card, padding: "0" }}>
        <table style={styles.table}>
          <thead style={styles.tableHeader}>
            <tr>
              <th style={styles.th}>Tanggal</th>
              <th style={styles.th}>Nama</th>
              <th style={styles.th}>Masuk</th>
              <th style={styles.th}>Pulang</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Tipe Kerja</th>
              {canSeeAllData && <th style={styles.th}>Lokasi</th>}
              {canSeeAllData && <th style={styles.th}>Role Pencatat</th>}
            </tr>
          </thead>
          <tbody>
            {list.map((a) => {
              const emp = canSeeAllData
                ? api.employees.findById(a.employee_id)
                : user;

              return (
                <tr
                  key={a.attendance_id}
                  style={{ borderBottom: "1px solid #3A4068" }}
                >
                  <td style={styles.td}>{a.tanggal}</td>
                  <td style={styles.td}>
                    {emp?.nama_lengkap || emp?.username || a.employee_id || "-"}
                  </td>
                  <td style={styles.td}>{a.jam_masuk}</td>
                  <td style={styles.td}>{a.jam_pulang || "-"}</td>
                  <td style={styles.td}>{a.status}</td>
                  <td style={styles.td}>{a.tipe_kerja || "WFO"}</td>
                  {canSeeAllData && (
                    <td style={styles.td}>
                      {a.lokasi_masuk ? (
                        <div style={{ fontSize: "12px" }}>
                          <div style={{ marginBottom: "4px" }}>
                            <a
                              href={`https://www.google.com/maps?q=${a.lokasi_masuk}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: "#5C9EFF",
                                textDecoration: "none",
                              }}
                            >
                              📍 Masuk
                            </a>
                          </div>
                          {a.lokasi_pulang && (
                            <a
                              href={`https://www.google.com/maps?q=${a.lokasi_pulang}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: "#5C9EFF",
                                textDecoration: "none",
                              }}
                            >
                              📍 Pulang
                            </a>
                          )}
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                  )}
                  {canSeeAllData && (
                    <td style={styles.td}>
                      {a.recorded_by_role || "Karyawan"}
                    </td>
                  )}
                </tr>
              );
            })}
            {list.length === 0 && (
              <tr>
                <td
                  colSpan={canSeeAllData ? "8" : "6"}
                  style={{ ...styles.td, textAlign: "center" }}
                >
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
