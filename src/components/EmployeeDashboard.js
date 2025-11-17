import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as api from "../services/api";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalHadir: 0,
    totalCuti: 0,
    sisaCuti: 12,
    cutiDigunakan: 0,
    pendingApproval: 0,
    recentAttendance: [],
    recentLeave: [],
    upcomingLeave: [],
  });

  const [loading, setLoading] = useState(true);

  const loggedInEmployeeId = user.employee_id || user.username;
  const isAdmin = user.role === "Admin";
  const isHR = user.role === "HR";
  const isEmployee = user.role === "Karyawan";

  useEffect(() => {
    calculateStats();
  }, [user.role, loggedInEmployeeId]);

  // ✅ PERBAIKAN: Tambahkan async dan await
  const calculateStats = async () => {
    try {
      setLoading(true);

      // ✅ PERBAIKAN: Tambahkan await dan pastikan hasil adalah array
      const allAttendance = await api.attendance.findAll();
      const allLeave = await api.leave.findAll();

      // Pastikan data adalah array
      const attendanceArray = Array.isArray(allAttendance) ? allAttendance : [];
      const leaveArray = Array.isArray(allLeave) ? allLeave : [];

      // Data untuk user yang login
      const myAttendance = attendanceArray.filter(
        (a) => a.employee_id === loggedInEmployeeId
      );
      const myLeave = leaveArray.filter(
        (l) => l.employee_id === loggedInEmployeeId
      );

      const totalHadir = myAttendance.filter(
        (a) => a.status === "hadir"
      ).length;

      const approvedLeave = myLeave.filter(
        (l) => l.status === "approved" && l.jenis_pengajuan === "Cuti"
      );
      const cutiDigunakan = approvedLeave.length;
      const sisaCuti = 12 - cutiDigunakan;

      // Pending approval (absensi WFH/Hybrid + cuti pending)
      const pendingAttendance = myAttendance.filter(
        (a) =>
          a.status_approval === "pending" &&
          (a.tipe_kerja === "WFH" || a.tipe_kerja === "Hybrid")
      ).length;
      const pendingLeave = myLeave.filter((l) => l.status === "pending").length;
      const pendingApproval = pendingAttendance + pendingLeave;

      // Recent attendance (5 terakhir)
      const recentAttendance = myAttendance
        .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
        .slice(0, 5);

      // Recent leave (5 terakhir)
      const recentLeave = myLeave
        .sort(
          (a, b) =>
            new Date(b.tanggal_pengajuan) - new Date(a.tanggal_pengajuan)
        )
        .slice(0, 5);

      // Upcoming leave (cuti yang akan datang, status approved)
      const today = new Date();
      const upcomingLeave = myLeave
        .filter(
          (l) => l.status === "approved" && new Date(l.tanggal_mulai) >= today
        )
        .sort((a, b) => new Date(a.tanggal_mulai) - new Date(b.tanggal_mulai))
        .slice(0, 3);

      setStats({
        totalHadir,
        totalCuti: myLeave.length,
        sisaCuti,
        cutiDigunakan,
        pendingApproval,
        recentAttendance,
        recentLeave,
        upcomingLeave,
      });
    } catch (error) {
      console.error("Error calculating stats:", error);
      // Set default values jika error
      setStats({
        totalHadir: 0,
        totalCuti: 0,
        sisaCuti: 12,
        cutiDigunakan: 0,
        pendingApproval: 0,
        recentAttendance: [],
        recentLeave: [],
        upcomingLeave: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const options = { day: "numeric", month: "short", year: "numeric" };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  // --- INLINE STYLES YANG DIRAPIKAN ---
  const styles = {
    mainContainer: { padding: "2rem 1.5rem 1.5rem 1.5rem" },

    headerCard: {
      backgroundColor: "#3A4068",
      color: "white",
      borderRadius: "12px",
      padding: "1.5rem",
      marginBottom: "2rem",
    },
    greeting: {
      fontSize: "2.2rem",
      fontWeight: "700",
      margin: "0 0 0.25rem 0",
    },
    subtitle: { fontSize: "1rem", margin: 0, opacity: 0.8 },

    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: "1.2rem",
      marginBottom: "2rem",
    },
    statCard: (color) => ({
      backgroundColor: color,
      borderRadius: "12px",
      padding: "1.5rem",
      color: "white",
      textAlign: "center",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
    }),
    cardValue: {
      fontSize: "3.5rem",
      fontWeight: "bold",
      lineHeight: 1,
      marginBottom: "0.25rem",
    },
    cardTitle: { fontSize: "1rem", opacity: 0.9 },

    actionsHeader: {
      fontSize: "1.5rem",
      fontWeight: "600",
      color: "#fff",
      margin: "0 0 1rem 0",
    },
    actionsGrid: { display: "flex", gap: "1.5rem", marginBottom: "2rem" },
    actionButton: (color) => ({
      flex: 1,
      padding: "1.5rem",
      borderRadius: "12px",
      backgroundColor: color,
      color: "white",
      fontSize: "1.1rem",
      fontWeight: "600",
      cursor: "pointer",
      textAlign: "center",
      border: "none",
      transition: "opacity 0.2s",
    }),

    bottomGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "1.5rem",
    },
    tableHeader: {
      fontSize: "1.2rem",
      fontWeight: "600",
      color: "#fff",
      margin: "0 0 1rem 0",
    },
    tableCard: {
      backgroundColor: "#2C3150",
      borderRadius: "12px",
      padding: "0",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
      overflow: "hidden",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      color: "white",
    },
    th: {
      padding: "0.8rem 1.2rem",
      fontSize: "0.85rem",
      fontWeight: "600",
      color: "rgba(255, 255, 255, 0.8)",
      textAlign: "left",
      backgroundColor: "#3A4068",
    },
    td: {
      padding: "0.8rem 1.2rem",
      fontSize: "0.85rem",
      borderBottom: "1px solid #3A4068",
      whiteSpace: "nowrap",
    },
  };

  // ✅ Tambahkan loading state
  if (loading) {
    return (
      <div style={{ padding: "2rem", color: "white", textAlign: "center" }}>
        <h2>Memuat data...</h2>
      </div>
    );
  }

  return (
    <div style={styles.mainContainer}>
      {/* Header Welcome */}
      <div style={styles.headerCard}>
        <h2 style={styles.greeting}>
          {getGreeting()}, {user.nama_lengkap || user.username}! 👋
        </h2>
        <p style={styles.subtitle}>
          {isAdmin
            ? "Anda login sebagai Admin - Kelola sistem HR dengan bijak"
            : isHR
            ? "Anda login sebagai HR - Kelola karyawan dan approval"
            : "Selamat datang di dashboard Anda"}
        </p>
      </div>

      {/* Statistik Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard("#5C54A4")}>
          <div style={styles.cardValue}>{stats.totalHadir}</div>
          <div style={styles.cardTitle}>Total Kehadiran</div>
        </div>

        <div style={styles.statCard("#FF6384")}>
          <div style={styles.cardValue}>{stats.sisaCuti}</div>
          <div style={styles.cardTitle}>
            Sisa Cuti ({stats.cutiDigunakan} digunakan)
          </div>
        </div>

        <div style={styles.statCard("#4facfe")}>
          <div style={styles.cardValue}>{stats.pendingApproval}</div>
          <div style={styles.cardTitle}>Menunggu Approval</div>
        </div>

        <div style={styles.statCard("#3CB371")}>
          <div style={styles.cardValue}>{stats.totalCuti}</div>
          <div style={styles.cardTitle}>Total Pengajuan Cuti</div>
        </div>
      </div>

      {/* Quick Actions */}
      <h3 style={styles.actionsHeader}>⚡ Quick Actions</h3>
      <div style={styles.actionsGrid}>
        {!isAdmin && (
          <>
            <button
              style={styles.actionButton("#5C54A4")}
              onClick={() => navigate("/attendance")}
            >
              📝 Catat Absensi
            </button>
            <button
              style={styles.actionButton("#FF6347")}
              onClick={() => navigate("/leave")}
            >
              ✈️ Ajukan Cuti/Izin
            </button>
          </>
        )}

        {(isAdmin || isHR) && (
          <>
            <button
              style={styles.actionButton("#43e97b")}
              onClick={() => navigate("/attendance")}
            >
              👥 Kelola Absensi
            </button>
            <button
              style={styles.actionButton("#4facfe")}
              onClick={() => navigate("/leave")}
            >
              📋 Kelola Cuti
            </button>
          </>
        )}
      </div>

      {/* Bagian Bawah: Cuti Yang Akan Datang & Pengajuan Terbaru */}
      <div style={styles.bottomGrid}>
        {!isAdmin && (
          <div>
            <h3 style={styles.tableHeader}>📅 Cuti Yang Akan Datang</h3>
            <div style={styles.tableCard}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Jenis</th>
                    <th style={styles.th}>Periode</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.upcomingLeave.length > 0 ? (
                    stats.upcomingLeave.map((l) => (
                      <tr key={l.leave_id}>
                        <td style={styles.td}>{l.jenis_pengajuan}</td>
                        <td style={styles.td}>
                          {formatDate(l.tanggal_mulai)} s/d{" "}
                          {formatDate(l.tanggal_selesai)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="2"
                        style={{
                          ...styles.td,
                          textAlign: "center",
                          color: "rgba(255, 255, 255, 0.6)",
                          borderBottom: "none",
                        }}
                      >
                        Tidak ada cuti/izin yang akan datang.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div style={{ gridColumn: isAdmin ? "1 / -1" : "auto" }}>
          <h3 style={styles.tableHeader}>
            {isAdmin || isHR ? "📋 Pengajuan Terbaru" : "🕐 Absensi Terbaru"}
          </h3>

          <div style={styles.tableCard}>
            {(isAdmin || isHR) && (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Tanggal</th>
                    <th style={styles.th}>Jenis</th>
                    <th style={styles.th}>Periode</th>
                    <th style={styles.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentLeave.length > 0 ? (
                    stats.recentLeave.map((l) => (
                      <tr key={l.leave_id}>
                        <td style={styles.td}>
                          {formatDate(l.tanggal_pengajuan)}
                        </td>
                        <td style={styles.td}>{l.jenis_pengajuan || "Cuti"}</td>
                        <td style={styles.td}>
                          {formatDate(l.tanggal_mulai)} →{" "}
                          {formatDate(l.tanggal_selesai)}
                        </td>
                        <td style={styles.td}>
                          <span
                            style={{
                              padding: "4px 8px",
                              borderRadius: "4px",
                              fontSize: "12px",
                              fontWeight: "500",
                              background:
                                l.status === "approved"
                                  ? "#4caf50"
                                  : l.status === "rejected"
                                  ? "#f44336"
                                  : "#ff9800",
                              color: "white",
                            }}
                          >
                            {l.status === "approved"
                              ? "✓ Approved"
                              : l.status === "rejected"
                              ? "✗ Rejected"
                              : "⏳ Pending"}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        style={{
                          ...styles.td,
                          textAlign: "center",
                          color: "rgba(255, 255, 255, 0.6)",
                          borderBottom: "none",
                        }}
                      >
                        Belum ada pengajuan cuti/izin terbaru.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {isEmployee && (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Tanggal</th>
                    <th style={styles.th}>Masuk</th>
                    <th style={styles.th}>Pulang</th>
                    <th style={styles.th}>Tipe</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentAttendance.length > 0 ? (
                    stats.recentAttendance.map((a) => (
                      <tr key={a.attendance_id}>
                        <td style={styles.td}>{formatDate(a.tanggal)}</td>
                        <td style={styles.td}>{a.jam_masuk || "-"}</td>
                        <td style={styles.td}>{a.jam_pulang || "-"}</td>
                        <td style={styles.td}>{a.tipe_kerja || "WFO"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        style={{
                          ...styles.td,
                          textAlign: "center",
                          color: "rgba(255, 255, 255, 0.6)",
                          borderBottom: "none",
                        }}
                      >
                        Belum ada data absensi.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div
        style={{
          marginTop: "2rem",
          background: "#3A4068",
          textAlign: "center",
          padding: "1rem",
          border: "1px solid #5C54A4",
          borderRadius: "12px",
        }}
      >
        <p
          style={{
            margin: 0,
            color: "rgba(255, 255, 255, 0.7)",
            fontSize: "14px",
          }}
        >
          💼 HR Platform - Sistem Manajemen Karyawan | Role:{" "}
          <strong style={{ color: "#fff" }}>{user.role}</strong>
        </p>
      </div>
    </div>
  );
}
