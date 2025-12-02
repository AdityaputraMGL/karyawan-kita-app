import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { attendance, employee } from "../services/api";

// --- Inline Styles ---
const styles = {
  mainContainer: {
    padding: "2rem 1.5rem 1.5rem 1.5rem",
  },
  title: {
    fontSize: "2.2rem",
    fontWeight: "700",
    color: "#fff",
    marginBottom: "1.5rem",
  },
  card: {
    backgroundColor: "#2C3150",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
    padding: "1.5rem",
    marginBottom: "1.5rem",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "1.5rem 2rem",
  },
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
  },
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
  warningCard: {
    backgroundColor: "#3A4068",
    borderRadius: "8px",
    padding: "1rem",
    marginBottom: "1rem",
    borderLeft: "4px solid #FFA726",
  },
  pendingCard: {
    backgroundColor: "#3A4068",
    borderRadius: "8px",
    padding: "1rem",
    marginBottom: "1rem",
    borderLeft: "4px solid #FFA726",
  },
  approvedCard: {
    backgroundColor: "#3A4068",
    borderRadius: "8px",
    padding: "1rem",
    marginBottom: "1rem",
    borderLeft: "4px solid #4CAF50",
  },
  rejectedCard: {
    backgroundColor: "#3A4068",
    borderRadius: "8px",
    padding: "1rem",
    marginBottom: "1rem",
    borderLeft: "4px solid #f44336",
  },
};

export default function Attendance() {
  const [employeesData, setEmployeesData] = useState([]);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const isAdmin = user?.role === "Admin";
  const loggedInEmployeeId = user?.employee_id || user?.username;
  const canSeeAllData = isAdmin || user?.role === "HR";
  const canSeeAllDataAndInputForAll = isAdmin;

  const [todayAttendance, setTodayAttendance] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [pendingRequest, setPendingRequest] = useState(null);
  const [requestLoading, setRequestLoading] = useState(false);

  const watchIdRef = useRef(null);

  const [form, setForm] = useState({
    employee_id: canSeeAllDataAndInputForAll ? "" : loggedInEmployeeId || "",
    tanggal: new Date().toISOString().split("T")[0],
    jam_masuk: "",
    jam_pulang: "",
    status: "hadir",
    tipe_kerja: "WFO (Work From Office)",
  });

  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7) // format: "2024-12"
  );

  const [wfhRequestForm, setWfhRequestForm] = useState({
    tanggal: new Date().toISOString().split("T")[0],
    tipe_kerja: "WFH (Work From Home)",
  });

  const checkTodayAttendance = useCallback(
    (allAttendance) => {
      const today = new Date().toISOString().split("T")[0];
      const todayData = allAttendance.find(
        (a) =>
          a.employee_id === loggedInEmployeeId &&
          a.tanggal.split("T")[0] === today
      );
      setTodayAttendance(todayData || null);

      if (todayData && todayData.approval_status === "pending") {
        setPendingRequest(todayData);
      } else {
        setPendingRequest(null);
      }
    },
    [loggedInEmployeeId]
  );

  const getFilteredList = useCallback(() => {
    if (!selectedMonth) return list;

    return list.filter((a) => {
      const attendanceMonth = a.tanggal.slice(0, 7); // ambil "YYYY-MM"
      return attendanceMonth === selectedMonth;
    });
  }, [list, selectedMonth]);

  const getMonthlyStats = useCallback(() => {
    const filtered = getFilteredList();
    const hadirCount = filtered.filter((a) => a.status === "hadir").length;
    const izinCount = filtered.filter((a) => a.status === "izin").length;
    const sakitCount = filtered.filter((a) => a.status === "sakit").length;
    const alpaCount = filtered.filter((a) => a.status === "alpa").length;

    return {
      total: filtered.length,
      hadir: hadirCount,
      izin: izinCount,
      sakit: sakitCount,
      alpa: alpaCount,
    };
  }, [getFilteredList]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("🔄 Refreshing data...");

      const allAttendance = await attendance.findAll();
      console.log("✅ Attendance loaded:", allAttendance.length);

      let allEmployees = [];
      if (canSeeAllData) {
        try {
          allEmployees = await employee.findAll();
          console.log("✅ Employees loaded:", allEmployees.length);
        } catch (empError) {
          console.log(
            "⚠ Could not load employees (normal for Karyawan):",
            empError.message
          );
        }
      }

      let filteredAttendance = allAttendance;
      if (!canSeeAllData && loggedInEmployeeId) {
        filteredAttendance = allAttendance.filter(
          (a) => a.employee_id === loggedInEmployeeId
        );
      }

      setEmployeesData(allEmployees);
      setList(filteredAttendance);
      checkTodayAttendance(filteredAttendance);
    } catch (e) {
      let errorMessage = "Gagal memuat data absensi.";

      if (e.response) {
        const statusCode = e.response.status;
        const detailMessage =
          e.response.data?.message || e.response.data?.error || "Server Error";

        if (statusCode === 401 || statusCode === 403) {
          errorMessage = `Error ${statusCode}: Akses Ditolak (${detailMessage})`;
        } else {
          errorMessage = `Error ${statusCode}: ${detailMessage}`;
        }
        console.error("API Response Error:", e.response.data);
      } else if (e.request) {
        errorMessage =
          "Tidak ada respons dari server. Pastikan Backend berjalan di http://localhost:5000";
      } else {
        errorMessage = e.message || "Kesalahan internal saat memuat data.";
      }

      setError(errorMessage);
      console.error("❌ Error loading data:", e);
    } finally {
      setLoading(false);
    }
  }, [canSeeAllData, loggedInEmployeeId, checkTodayAttendance]);

  const startLocationTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Browser Anda tidak mendukung Geolocation");
      return;
    }

    setLocationLoading(true);

    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 30000,
      maximumAge: 0,
    };

    let bestAccuracy = Infinity;
    let bestLocation = null;
    let attempts = 0;
    const maxAttempts = 5;
    const targetAccuracy = 30;

    console.log("🔍 Starting GPS lock... (target: <30m accuracy)");

    const tryGetBetterLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          attempts++;
          const accuracy = position.coords.accuracy;

          console.log(
            `📍 Attempt ${attempts}/${maxAttempts}: Accuracy ${Math.round(
              accuracy
            )}m`
          );

          if (accuracy < bestAccuracy) {
            bestAccuracy = accuracy;
            bestLocation = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: accuracy,
              timestamp: new Date().toISOString(),
            };

            setCurrentLocation(bestLocation);
            setLocationLoading(false);
            setLocationError(null);
          }

          if (accuracy <= targetAccuracy || attempts >= maxAttempts) {
            console.log(
              `✅ GPS locked! Final accuracy: ${Math.round(bestAccuracy)}m`
            );
            setLocationLoading(false);
            startWatchingLocation();
          } else {
            setTimeout(tryGetBetterLocation, 2000);
          }
        },
        (error) => {
          setLocationLoading(false);
          let errorMessage = "Gagal mendapatkan lokasi";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage =
                "Akses lokasi ditolak. Izinkan akses lokasi di browser.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage =
                "GPS tidak tersedia. Pastikan GPS aktif dan Anda di area terbuka.";
              break;
            case error.TIMEOUT:
              errorMessage = "GPS timeout. Tunggu di area terbuka lebih lama.";
              break;
            default:
              errorMessage = "Error GPS.";
          }
          setLocationError(errorMessage);
          console.error("❌ GPS error:", error);
        },
        options
      );
    };

    const startWatchingLocation = () => {
      const id = navigator.geolocation.watchPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString(),
          };

          if (position.coords.accuracy < bestAccuracy) {
            bestAccuracy = position.coords.accuracy;
            setCurrentLocation(location);
            console.log(
              "📍 Location improved:",
              Math.round(position.coords.accuracy),
              "m"
            );
          }
        },
        (error) => {
          console.error("Watch error:", error);
        },
        options
      );

      watchIdRef.current = id;
    };

    tryGetBetterLocation();
  }, []);

  const retryLocation = () => {
    setLocationError(null);
    setLocationLoading(true);
    startLocationTracking();
  };

  useEffect(() => {
    console.log("🔵 Component mounted, loading data...");
    console.log("👤 Current user:", user);
    console.log("🔑 Token:", localStorage.getItem("hr_userToken"));

    refresh();

    if (!isAdmin) {
      startLocationTracking();
    }

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        console.log("🧹 Cleanup: Location tracking stopped");
      }
    };
  }, [isAdmin, refresh, startLocationTracking, user]);

  const requestWFH = async () => {
    if (!wfhRequestForm.tanggal || !wfhRequestForm.tipe_kerja) {
      alert("⚠ Tanggal dan tipe kerja wajib diisi!");
      return;
    }

    setRequestLoading(true);

    try {
      const TOKEN_KEY = "hr_userToken";
      const token = localStorage.getItem(TOKEN_KEY);

      console.log("📤 Requesting WFH/Hybrid...");

      const response = await fetch(
        "http://localhost:5000/api/attendance/request-wfh",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(wfhRequestForm),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal mengirim request");
      }

      console.log("✅ Request berhasil:", result);
      alert(result.message || "✅ Request berhasil dikirim!");

      setWfhRequestForm({
        tanggal: new Date().toISOString().split("T")[0],
        tipe_kerja: "WFH (Work From Home)",
      });

      refresh();
    } catch (e) {
      console.error("❌ Error requesting WFH:", e);
      alert("Gagal mengirim request: " + e.message);
    } finally {
      setRequestLoading(false);
    }
  };

  const absenMasuk = async () => {
    const selectedType = form.tipe_kerja;

    if (selectedType === "WFH (Work From Home)" || selectedType === "Hybrid") {
      if (!todayAttendance) {
        alert(
          "❌ Anda harus request WFH/Hybrid terlebih dahulu dan menunggu approval dari admin!\n\n" +
            "Gunakan tombol 'Request WFH/Hybrid' di bawah."
        );
        return;
      }

      if (todayAttendance.approval_status === "pending") {
        alert(
          "⏳ Request WFH/Hybrid Anda masih menunggu approval dari admin.\n\n" +
            "Harap tunggu hingga admin menyetujui request Anda."
        );
        return;
      }

      if (todayAttendance.approval_status === "rejected") {
        alert(
          "❌ Request WFH/Hybrid Anda ditolak oleh admin.\n\n" +
            (todayAttendance.approval_notes
              ? `Alasan: ${todayAttendance.approval_notes}`
              : "Silakan hubungi admin untuk informasi lebih lanjut.")
        );
        return;
      }

      if (todayAttendance.approval_status !== "approved") {
        alert("❌ Status approval tidak valid. Silakan request ulang.");
        return;
      }
    }

    if (!currentLocation) {
      alert(
        "⚠ Lokasi belum terdeteksi. Mohon tunggu beberapa saat atau izinkan akses lokasi."
      );
      return;
    }

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;
    const today = now.toISOString().split("T")[0];

    const lokasiMasuk = `${currentLocation.latitude},${currentLocation.longitude}`;
    const akurasiMasuk = Math.round(currentLocation.accuracy);

    console.log("📤 Sending attendance data:");
    console.log("  - employee_id:", loggedInEmployeeId);
    console.log("  - lokasi_masuk:", lokasiMasuk);
    console.log("  - akurasi_masuk:", akurasiMasuk);
    console.log("  - tipe_kerja:", selectedType);

    try {
      const TOKEN_KEY = "hr_userToken";
      const token = localStorage.getItem(TOKEN_KEY);

      const response = await fetch(
        "http://localhost:5000/api/attendance/checkin",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            employee_id: loggedInEmployeeId,
            tanggal: today,
            jam_masuk: currentTime,
            tipe_kerja: selectedType,
            lokasi_masuk: lokasiMasuk,
            akurasi_masuk: akurasiMasuk,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal absen masuk");
      }

      console.log("✅ Check-in successful:", result);
      alert(
        `✓ Absen Masuk berhasil pada ${currentTime}\nTipe: ${selectedType}\nLokasi: ${lokasiMasuk}\nAkurasi: ${akurasiMasuk}m`
      );
      refresh();
    } catch (e) {
      console.error("❌ Error check-in:", e);
      alert("Gagal Absen Masuk: " + e.message);
    }
  };

  const absenPulang = async () => {
    if (!todayAttendance) {
      alert("⚠ Anda belum absen masuk hari ini!");
      return;
    }

    if (!currentLocation) {
      alert(
        "⚠ Lokasi belum terdeteksi. Mohon tunggu beberapa saat atau izinkan akses lokasi."
      );
      return;
    }

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    try {
      const TOKEN_KEY = "hr_userToken";
      const token = localStorage.getItem(TOKEN_KEY);

      const response = await fetch(
        `http://localhost:5000/api/attendance/checkout/${todayAttendance.attendance_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            jam_pulang: currentTime,
            lokasi_pulang: `${currentLocation.latitude},${currentLocation.longitude}`,
            akurasi_pulang: Math.round(currentLocation.accuracy),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal absen pulang");
      }

      alert(`✓ Absen Pulang berhasil pada ${currentTime}`);
      refresh();
    } catch (e) {
      console.error("❌ Error check-out:", e);
      alert("Gagal Absen Pulang: " + e.message);
    }
  };

  const submitManual = async (e) => {
    e.preventDefault();

    let finalEmployeeId = form.employee_id;
    if (!canSeeAllDataAndInputForAll) {
      finalEmployeeId = loggedInEmployeeId;
    }

    if (!finalEmployeeId) {
      alert("Gagal mencatat absensi. ID karyawan Anda tidak ditemukan.");
      return;
    }

    try {
      await attendance.create({
        ...form,
        employee_id: finalEmployeeId,
        recorded_by_role: user.role,
        lokasi_masuk: "MANUAL",
        akurasi_masuk: 0,
      });

      setForm({
        employee_id: canSeeAllDataAndInputForAll
          ? ""
          : loggedInEmployeeId || "",
        tanggal: new Date().toISOString().split("T")[0],
        jam_masuk: "",
        jam_pulang: "",
        status: "hadir",
        tipe_kerja: "WFO (Work From Office)",
      });
      refresh();
      alert("✅ Absensi manual berhasil dicatat.");
    } catch (e) {
      setError(e.message || "Gagal mencatat absensi manual.");
      alert("Gagal mencatat manual: " + (e.response?.data?.error || e.message));
    }
  };

  const getCurrentTime = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;
  };

  const findEmployeeById = (empId) => {
    return employeesData.find((e) => e.employee_id === empId);
  };

  const createMapUrl = (locationString) => {
    if (!locationString || locationString === "MANUAL") return null;
    return `https://www.google.com/maps/search/?api=1&query=${locationString}`;
  };

  if (loading) {
    return (
      <div style={styles.mainContainer}>
        <div style={{ color: "#fff", fontSize: "1.2rem" }}>
          ⏳ Memuat data absensi...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.mainContainer}>
        <div style={{ ...styles.card, borderLeft: "4px solid #f44336" }}>
          <h3 style={{ color: "#fff", marginTop: 0 }}>❌ Error</h3>
          <p style={{ color: "rgba(255,255,255,0.9)", marginBottom: "1rem" }}>
            {error}
          </p>
          <button onClick={refresh} style={styles.btnPrimary}>
            🔄 Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  const needsApproval = (tipeKerja) => {
    return tipeKerja === "WFH (Work From Home)" || tipeKerja === "Hybrid";
  };

  const selectedTypeNeedsApproval = needsApproval(form.tipe_kerja);

  return (
    <div style={styles.mainContainer}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <h1 style={styles.title}>Absensi</h1>

      <div style={styles.card}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "0.5rem",
          }}
        >
          <label style={styles.label}>Filter Bulan:</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{ ...styles.inputField, width: "200px" }}
          />
          <button
            onClick={() =>
              setSelectedMonth(new Date().toISOString().slice(0, 7))
            }
            style={{ ...styles.btnPrimary, padding: "0.5rem 1rem" }}
          >
            Bulan Ini
          </button>
        </div>

        {(() => {
          const stats = getMonthlyStats();
          return (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: "1rem",
                marginTop: "1rem",
                padding: "1rem",
                backgroundColor: "#3A4068",
                borderRadius: "8px",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    color: "#4CAF50",
                  }}
                >
                  {stats.total}
                </div>
                <div
                  style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.7)" }}
                >
                  Total Absen
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    color: "#2196F3",
                  }}
                >
                  {stats.hadir}
                </div>
                <div
                  style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.7)" }}
                >
                  Hadir
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    color: "#FF9800",
                  }}
                >
                  {stats.izin}
                </div>
                <div
                  style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.7)" }}
                >
                  Izin
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    color: "#9C27B0",
                  }}
                >
                  {stats.sakit}
                </div>
                <div
                  style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.7)" }}
                >
                  Sakit
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    color: "#f44336",
                  }}
                >
                  {stats.alpa}
                </div>
                <div
                  style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.7)" }}
                >
                  Alpa
                </div>
              </div>
            </div>
          );
        })()}
      </div>

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

          {locationLoading && (
            <div style={styles.locationLoading}>
              <div style={styles.spinner}></div>
              <div style={{ color: "#fff", fontSize: "14px" }}>
                📍 Mendeteksi lokasi Anda...
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
                🌍 Koordinat:{" "}
                <a
                  href={createMapUrl(
                    `${currentLocation.latitude},${currentLocation.longitude}`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#5C9EFF", textDecoration: "underline" }}
                >
                  {currentLocation.latitude.toFixed(6)},
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
                  " ⚠ Cukup Akurat"}
                {currentLocation.accuracy >= 50 && " ⚠ Kurang Akurat"}
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

          {pendingRequest && pendingRequest.approval_status === "pending" && (
            <div style={styles.pendingCard}>
              <strong>⏳ Request WFH/Hybrid Pending</strong>
              <div
                style={{
                  marginTop: "0.5rem",
                  fontSize: "14px",
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                Tanggal:{" "}
                <strong>
                  {new Date(pendingRequest.tanggal).toLocaleDateString("id-ID")}
                </strong>
                <br />
                Tipe: <strong>{pendingRequest.tipe_kerja}</strong>
                <br />
                Status: <strong>Menunggu Approval Admin</strong>
              </div>
              <div
                style={{
                  marginTop: "0.5rem",
                  fontSize: "13px",
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                💡 Anda bisa absen setelah admin menyetujui request Anda
              </div>
            </div>
          )}

          {todayAttendance &&
            todayAttendance.approval_status === "approved" &&
            needsApproval(todayAttendance.tipe_kerja) &&
            !todayAttendance.jam_masuk && (
              <div style={styles.approvedCard}>
                <strong>✅ Request Disetujui!</strong>
                <div
                  style={{
                    marginTop: "0.5rem",
                    fontSize: "14px",
                    color: "rgba(255,255,255,0.9)",
                  }}
                >
                  Tipe: <strong>{todayAttendance.tipe_kerja}</strong>
                  <br />
                  Status: <strong>Approved - Siap Absen</strong>
                </div>
                <div
                  style={{
                    marginTop: "0.5rem",
                    fontSize: "13px",
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  🎉 Silakan absen masuk sekarang!
                </div>
              </div>
            )}

          {todayAttendance &&
            todayAttendance.approval_status === "rejected" && (
              <div style={styles.rejectedCard}>
                <strong>❌ Request Ditolak</strong>
                <div
                  style={{
                    marginTop: "0.5rem",
                    fontSize: "14px",
                    color: "rgba(255,255,255,0.9)",
                  }}
                >
                  Tipe: <strong>{todayAttendance.tipe_kerja}</strong>
                  <br />
                  Status: <strong>Rejected</strong>
                  {todayAttendance.approval_notes && (
                    <>
                      <br />
                      Alasan: <strong>{todayAttendance.approval_notes}</strong>
                    </>
                  )}
                </div>
                <div
                  style={{
                    marginTop: "0.5rem",
                    fontSize: "13px",
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  💡 Silakan hubungi admin atau request ulang
                </div>
              </div>
            )}

          {todayAttendance && todayAttendance.jam_masuk && (
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
                    href={createMapUrl(todayAttendance.lokasi_masuk)}
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
                    href={createMapUrl(todayAttendance.lokasi_pulang)}
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

          {!todayAttendance && (
            <>
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
                  <option value="WFO (Work From Office)">
                    WFO (Work From Office)
                  </option>
                  <option value="WFH (Work From Home)">
                    WFH (Work From Home)
                  </option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              {selectedTypeNeedsApproval && (
                <div style={styles.warningCard}>
                  <div
                    style={{
                      color: "#fff",
                      fontSize: "14px",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <strong>⚠ Perlu Approval Admin</strong>
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "rgba(255,255,255,0.85)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    WFH/Hybrid memerlukan persetujuan admin sebelum dapat absen.
                  </div>

                  <div
                    style={{
                      marginTop: "1rem",
                      padding: "1rem",
                      backgroundColor: "rgba(0,0,0,0.2)",
                      borderRadius: "8px",
                    }}
                  >
                    <div style={{ marginBottom: "0.8rem" }}>
                      <label
                        style={{ ...styles.label, marginBottom: "0.3rem" }}
                      >
                        Tanggal:
                      </label>
                      <input
                        type="date"
                        value={wfhRequestForm.tanggal}
                        onChange={(e) =>
                          setWfhRequestForm({
                            ...wfhRequestForm,
                            tanggal: e.target.value,
                          })
                        }
                        style={{ ...styles.inputField, width: "100%" }}
                      />
                    </div>

                    <div style={{ marginBottom: "0.8rem" }}>
                      <label
                        style={{ ...styles.label, marginBottom: "0.3rem" }}
                      >
                        Tipe:
                      </label>
                      <select
                        value={wfhRequestForm.tipe_kerja}
                        onChange={(e) =>
                          setWfhRequestForm({
                            ...wfhRequestForm,
                            tipe_kerja: e.target.value,
                          })
                        }
                        style={{ ...styles.inputField, width: "100%" }}
                      >
                        <option value="WFH (Work From Home)">
                          WFH (Work From Home)
                        </option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                    </div>

                    <button
                      onClick={requestWFH}
                      disabled={requestLoading}
                      style={{
                        ...styles.btnPrimary,
                        width: "100%",
                        backgroundColor: requestLoading ? "#666" : "#FF9800",
                        cursor: requestLoading ? "not-allowed" : "pointer",
                      }}
                    >
                      {requestLoading
                        ? "⏳ Mengirim..."
                        : "📝 Request WFH/Hybrid"}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
            <button
              onClick={absenMasuk}
              disabled={
                (todayAttendance && todayAttendance.jam_masuk) ||
                !currentLocation ||
                (selectedTypeNeedsApproval &&
                  (!todayAttendance ||
                    todayAttendance.approval_status !== "approved"))
              }
              style={{
                ...styles.absentBtn,
                background:
                  todayAttendance && todayAttendance.jam_masuk
                    ? "#444"
                    : !currentLocation
                    ? "#666"
                    : selectedTypeNeedsApproval &&
                      (!todayAttendance ||
                        todayAttendance.approval_status !== "approved")
                    ? "#666"
                    : "#4caf50",
                color: "white",
                cursor:
                  (todayAttendance && todayAttendance.jam_masuk) ||
                  !currentLocation ||
                  (selectedTypeNeedsApproval &&
                    (!todayAttendance ||
                      todayAttendance.approval_status !== "approved"))
                    ? "not-allowed"
                    : "pointer",
                opacity: !currentLocation ? 0.7 : 1,
              }}
            >
              {todayAttendance && todayAttendance.jam_masuk
                ? "✓ Sudah Absen Masuk"
                : !currentLocation
                ? "⏳ Menunggu Lokasi..."
                : selectedTypeNeedsApproval &&
                  (!todayAttendance ||
                    todayAttendance.approval_status !== "approved")
                ? "🔒 Perlu Approval"
                : "🏢 Absen Masuk Sekarang"}
            </button>

            <button
              onClick={absenPulang}
              disabled={
                !todayAttendance ||
                !todayAttendance.jam_masuk ||
                todayAttendance.jam_pulang ||
                !currentLocation
              }
              style={{
                ...styles.absentBtn,
                background:
                  !todayAttendance ||
                  !todayAttendance.jam_masuk ||
                  todayAttendance?.jam_pulang
                    ? "#444"
                    : !currentLocation
                    ? "#666"
                    : "#FF6347",
                color: "white",
                cursor:
                  !todayAttendance ||
                  !todayAttendance.jam_masuk ||
                  todayAttendance?.jam_pulang ||
                  !currentLocation
                    ? "not-allowed"
                    : "pointer",
                opacity:
                  !currentLocation &&
                  todayAttendance &&
                  todayAttendance.jam_masuk &&
                  !todayAttendance.jam_pulang
                    ? 0.7
                    : 1,
              }}
            >
              {todayAttendance?.jam_pulang
                ? "✓ Sudah Absen Pulang"
                : !todayAttendance || !todayAttendance.jam_masuk
                ? "🏠 Absen Pulang"
                : !currentLocation
                ? "⏳ Menunggu Lokasi..."
                : "🏠 Absen Pulang Sekarang"}
            </button>
          </div>
        </div>
      )}

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
              {employeesData.map((e) => (
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
              <option value="WFO (Work From Office)">
                WFO (Work From Office)
              </option>
              <option value="WFH (Work From Home)">WFH (Work From Home)</option>
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
              {canSeeAllData && <th style={styles.th}>Approval</th>}
              {canSeeAllData && <th style={styles.th}>Lokasi</th>}
              {canSeeAllData && <th style={styles.th}>Role Pencatat</th>}
            </tr>
          </thead>
          <tbody>
            {getFilteredList().map((a) => {
              const emp = canSeeAllData
                ? findEmployeeById(a.employee_id)
                : user;

              return (
                <tr
                  key={a.attendance_id}
                  style={{ borderBottom: "1px solid #3A4068" }}
                >
                  <td style={styles.td}>{a.tanggal.split("T")[0]}</td>
                  <td style={styles.td}>
                    {emp?.nama_lengkap || emp?.username || a.employee_id || "-"}
                  </td>
                  <td style={styles.td}>{a.jam_masuk || "-"}</td>
                  <td style={styles.td}>{a.jam_pulang || "-"}</td>
                  <td style={styles.td}>{a.status}</td>
                  <td style={styles.td}>{a.tipe_kerja || "WFO"}</td>
                  {canSeeAllData && (
                    <td style={styles.td}>
                      {a.approval_status === "pending" && "⏳ Pending"}
                      {a.approval_status === "approved" && "✅ Approved"}
                      {a.approval_status === "rejected" && "❌ Rejected"}
                    </td>
                  )}
                  {canSeeAllData && (
                    <td style={styles.td}>
                      {a.lokasi_masuk ? (
                        <div style={{ fontSize: "12px" }}>
                          <div style={{ marginBottom: "4px" }}>
                            <a
                              href={createMapUrl(a.lokasi_masuk)}
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
                              href={createMapUrl(a.lokasi_pulang)}
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
            {getFilteredList().length === 0 && (
              <tr>
                <td
                  colSpan={canSeeAllData ? "9" : "6"}
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
