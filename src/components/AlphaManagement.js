import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

// ========================================
// INLINE STYLES
// ========================================
const styles = {
  mainContainer: {
    padding: "2rem 1.5rem 1.5rem 1.5rem",
    minHeight: "100vh",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
    flexWrap: "wrap",
    gap: "1rem",
  },
  title: {
    fontSize: "2.2rem",
    fontWeight: "700",
    color: "#fff",
    margin: 0,
  },
  card: {
    backgroundColor: "#2C3150",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
    padding: "1.5rem",
    marginBottom: "1.5rem",
  },
  alertCard: {
    backgroundColor: "#4A2A2A",
    border: "2px solid #FF6347",
    borderRadius: "10px",
    padding: "1.5rem",
    marginBottom: "1.5rem",
    color: "rgba(255, 255, 255, 0.9)",
  },
  infoCard: {
    backgroundColor: "#2A3A4A",
    border: "2px solid #2196F3",
    borderRadius: "10px",
    padding: "1.5rem",
    marginBottom: "1.5rem",
    color: "rgba(255, 255, 255, 0.9)",
  },
  successCard: {
    backgroundColor: "#2A4A2A",
    border: "2px solid #4CAF50",
    borderRadius: "10px",
    padding: "1.5rem",
    marginBottom: "1.5rem",
    color: "rgba(255, 255, 255, 0.9)",
  },
  warningCard: {
    backgroundColor: "#4A3A2A",
    border: "2px solid #FFA726",
    borderRadius: "10px",
    padding: "1.5rem",
    marginBottom: "1.5rem",
    color: "rgba(255, 255, 255, 0.9)",
  },
  btn: {
    padding: "0.6rem 1rem",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    border: "none",
    fontSize: "0.9rem",
    backgroundColor: "#5C54A4",
    color: "#fff",
    transition: "all 0.2s",
  },
  btnPrimary: {
    padding: "0.6rem 1rem",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    border: "none",
    fontSize: "0.9rem",
    backgroundColor: "#2196F3",
    color: "#fff",
    transition: "all 0.2s",
  },
  btnWarning: {
    padding: "0.6rem 1rem",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    border: "none",
    fontSize: "0.9rem",
    backgroundColor: "#FF9800",
    color: "#fff",
    transition: "all 0.2s",
  },
  btnDanger: {
    padding: "0.6rem 1rem",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    border: "none",
    fontSize: "0.9rem",
    backgroundColor: "#FF6347",
    color: "#fff",
    transition: "all 0.2s",
  },
  btnSuccess: {
    padding: "0.6rem 1rem",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    border: "none",
    fontSize: "0.9rem",
    backgroundColor: "#4CAF50",
    color: "#fff",
    transition: "all 0.2s",
  },
  btnDisabled: {
    padding: "0.6rem 1rem",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "not-allowed",
    border: "none",
    fontSize: "0.9rem",
    backgroundColor: "#666",
    color: "#999",
    opacity: 0.6,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "1.5rem",
    marginBottom: "1.5rem",
  },
  statBox: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: "12px",
    padding: "1.5rem",
    textAlign: "center",
    color: "#fff",
    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
  },
  statBoxAlt1: {
    background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    borderRadius: "12px",
    padding: "1.5rem",
    textAlign: "center",
    color: "#fff",
    boxShadow: "0 4px 12px rgba(240, 147, 251, 0.3)",
  },
  statBoxAlt2: {
    background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    borderRadius: "12px",
    padding: "1.5rem",
    textAlign: "center",
    color: "#fff",
    boxShadow: "0 4px 12px rgba(79, 172, 254, 0.3)",
  },
  statBoxAlt3: {
    background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    borderRadius: "12px",
    padding: "1.5rem",
    textAlign: "center",
    color: "#fff",
    boxShadow: "0 4px 12px rgba(67, 233, 123, 0.3)",
  },
  statIcon: {
    fontSize: "2.5rem",
    marginBottom: "0.5rem",
  },
  statValue: {
    fontSize: "2rem",
    fontWeight: "bold",
    marginBottom: "0.3rem",
  },
  statLabel: {
    fontSize: "0.9rem",
    opacity: 0.9,
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
    padding: "0.8rem 1rem",
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.8)",
  },
  td: {
    padding: "0.8rem 1rem",
    fontSize: "0.9rem",
    borderBottom: "1px solid #3A4068",
  },
  formElement: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
    marginBottom: "1rem",
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
  filterGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1rem",
    marginBottom: "1rem",
  },
  badge: {
    padding: "0.3rem 0.6rem",
    borderRadius: "4px",
    fontSize: "0.8rem",
    fontWeight: "600",
  },
  badgeSuccess: {
    backgroundColor: "#4CAF50",
    color: "white",
  },
  badgeDanger: {
    backgroundColor: "#FF6347",
    color: "white",
  },
  badgeWarning: {
    backgroundColor: "#FF9800",
    color: "white",
  },
  badgeInfo: {
    backgroundColor: "#2196F3",
    color: "white",
  },
  actionButtons: {
    display: "flex",
    gap: "0.5rem",
    flexWrap: "wrap",
  },
  loadingOverlay: {
    textAlign: "center",
    padding: "3rem",
    color: "#fff",
    fontSize: "1.2rem",
  },
  emptyState: {
    textAlign: "center",
    padding: "3rem",
    color: "rgba(255, 255, 255, 0.6)",
  },
  emptyIcon: {
    fontSize: "4rem",
    marginBottom: "1rem",
  },
};

// ========================================
// MAIN COMPONENT
// ========================================
export default function AlphaManagement() {
  const [status, setStatus] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkLoading, setCheckLoading] = useState(false);
  const { user } = useAuth();

  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [useCustomDate, setUseCustomDate] = useState(false);
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const TOKEN_KEY = "hr_userToken";

  // ========================================
  // HELPER FUNCTIONS
  // ========================================

  // Format Rupiah
  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  // Format Date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Get Month Name
  const getMonthName = (monthNum) => {
    return new Date(2025, monthNum - 1).toLocaleString("id-ID", {
      month: "long",
    });
  };

  // ========================================
  // API FUNCTIONS
  // ========================================

  // Fetch Status
  const fetchStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const response = await fetch("http://localhost:5000/api/alpha/status", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Gagal mengambil status");
      }

      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error("Error fetching status:", error);
      // Don't show alert for status errors
    }
  }, []);

  // Fetch Stats
  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem(TOKEN_KEY);

      let url;
      if (useCustomDate && customStartDate && customEndDate) {
        // Use custom date range
        url = `http://localhost:5000/api/alpha/stats?start_date=${customStartDate}&end_date=${customEndDate}`;
      } else {
        // Use month/year
        url = `http://localhost:5000/api/alpha/stats?month=${filterMonth}&year=${filterYear}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Gagal mengambil statistik");
      }

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
      alert("Gagal mengambil statistik alpha: " + error.message);
    } finally {
      setLoading(false);
    }
  }, [filterMonth, filterYear, useCustomDate, customStartDate, customEndDate]);

  // Manual Check Alpha
  const manualCheckAlpha = async () => {
    if (!window.confirm("Jalankan alpha check manual untuk kemarin?")) return;

    setCheckLoading(true);
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const response = await fetch("http://localhost:5000/api/alpha/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal melakukan check");
      }

      alert(
        `✅ Alpha check selesai!\n\n` +
          `Tanggal: ${result.date}\n` +
          `Total Alpha: ${result.total_alpha}\n\n` +
          `Detail:\n` +
          `- Total Karyawan: ${result.total_employees}\n` +
          `- Hadir: ${result.total_attended}\n` +
          `- Cuti: ${result.total_on_leave}\n` +
          `- Alpha: ${result.total_alpha}`
      );

      // Refresh data
      fetchStatus();
      fetchStats();
    } catch (error) {
      console.error("Error checking alpha:", error);
      alert("Gagal melakukan alpha check: " + error.message);
    } finally {
      setCheckLoading(false);
    }
  };

  // Delete Alpha Record
  const deleteAlphaRecord = async (attendanceId, employeeName) => {
    const reason = window.prompt(
      `Hapus record alpha untuk ${employeeName}?\n\nMasukkan alasan:`
    );

    if (!reason) return;

    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const response = await fetch(
        `http://localhost:5000/api/alpha/remove/${attendanceId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reason }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal menghapus");
      }

      alert("✅ Alpha record berhasil dihapus!");
      fetchStats();
    } catch (error) {
      console.error("Error deleting alpha:", error);
      alert("Gagal menghapus alpha record: " + error.message);
    }
  };

  // Convert Alpha to Other Status
  const convertAlpha = async (attendanceId, employeeName) => {
    const newStatus = window.prompt(
      `Convert alpha untuk ${employeeName}\n\n` +
        `Pilih status baru:\n` +
        `- hadir\n` +
        `- izin\n` +
        `- sakit\n\n` +
        `Masukkan status:`
    );

    if (
      !newStatus ||
      !["hadir", "izin", "sakit"].includes(newStatus.toLowerCase())
    ) {
      alert("Status tidak valid! Harus: hadir, izin, atau sakit");
      return;
    }

    const keterangan = window.prompt("Masukkan keterangan (opsional):");

    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const response = await fetch(
        `http://localhost:5000/api/alpha/convert/${attendanceId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            new_status: newStatus.toLowerCase(),
            keterangan: keterangan || undefined,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal convert");
      }

      alert(`✅ Alpha berhasil diubah menjadi ${newStatus}!`);
      fetchStats();
    } catch (error) {
      console.error("Error converting alpha:", error);
      alert("Gagal convert alpha: " + error.message);
    }
  };

  // ========================================
  // EFFECTS
  // ========================================

  useEffect(() => {
    fetchStatus();
    fetchStats();
  }, [fetchStatus, fetchStats]);

  // ========================================
  // ACCESS CONTROL
  // ========================================

  if (!user || (user.role !== "Admin" && user.role !== "HR")) {
    return (
      <div style={styles.mainContainer}>
        <div style={styles.alertCard}>
          <h3 style={{ marginTop: 0 }}>❌ Akses Ditolak</h3>
          <p>Halaman ini hanya dapat diakses oleh Admin dan HR.</p>
        </div>
      </div>
    );
  }

  // ========================================
  // RENDER
  // ========================================

  return (
    <div style={styles.mainContainer}>
      {/* ========== HEADER ========== */}
      <div style={styles.header}>
        <h1 style={styles.title}>🤖 Alpha Management System</h1>
        <button
          onClick={manualCheckAlpha}
          disabled={checkLoading}
          style={checkLoading ? styles.btnDisabled : styles.btnWarning}
        >
          {checkLoading ? "⏳ Checking..." : "🔄 Manual Check Alpha"}
        </button>
      </div>

      {/* ========== SYSTEM STATUS ========== */}
      {status && (
        <div style={styles.infoCard}>
          <h3 style={{ marginTop: 0, marginBottom: "1rem", color: "#fff" }}>
            📊 System Status
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "0.8rem",
              fontSize: "0.9rem",
            }}
          >
            <div>
              <strong>Status:</strong> {status.status}
            </div>
            <div>
              <strong>Jadwal Cron:</strong> {status.cron_schedule}
            </div>
            <div>
              <strong>Tarif Potongan:</strong> {status.deduction_rate}
            </div>
            <div>
              <strong>Alpha Hari Ini:</strong>{" "}
              {status.today?.alpha_records || 0} records
            </div>
            <div>
              <strong>Alpha Kemarin:</strong>{" "}
              {status.yesterday?.alpha_records || 0} records
            </div>
          </div>
        </div>
      )}

      {/* ========== FILTER ========== */}
      <div style={styles.card}>
        <h3 style={{ marginTop: 0, marginBottom: "1rem", color: "#fff" }}>
          🔍 Filter Periode
        </h3>

        {/* Toggle Filter Mode */}
        <div style={{ marginBottom: "1rem" }}>
          <label
            style={{
              ...styles.label,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={useCustomDate}
              onChange={(e) => setUseCustomDate(e.target.checked)}
              style={{ cursor: "pointer", width: "18px", height: "18px" }}
            />
            <span>Gunakan Tanggal Custom</span>
          </label>
        </div>

        {!useCustomDate ? (
          // Month/Year Filter
          <div style={styles.filterGrid}>
            <div style={styles.formElement}>
              <label style={styles.label}>Bulan</label>
              <select
                style={styles.inputField}
                value={filterMonth}
                onChange={(e) => setFilterMonth(parseInt(e.target.value))}
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {getMonthName(i + 1)}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.formElement}>
              <label style={styles.label}>Tahun</label>
              <input
                type="number"
                style={styles.inputField}
                value={filterYear}
                onChange={(e) => setFilterYear(parseInt(e.target.value))}
                min="2020"
                max="2030"
              />
            </div>

            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button onClick={fetchStats} style={styles.btnSuccess}>
                🔍 Tampilkan Data
              </button>
            </div>
          </div>
        ) : (
          // Custom Date Range Filter
          <div style={styles.filterGrid}>
            <div style={styles.formElement}>
              <label style={styles.label}>Tanggal Mulai</label>
              <input
                type="date"
                style={styles.inputField}
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
              />
            </div>

            <div style={styles.formElement}>
              <label style={styles.label}>Tanggal Selesai</label>
              <input
                type="date"
                style={styles.inputField}
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button
                onClick={fetchStats}
                style={styles.btnSuccess}
                disabled={!customStartDate || !customEndDate}
              >
                🔍 Tampilkan Data
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========== LOADING STATE ========== */}
      {loading && (
        <div style={styles.loadingOverlay}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⏳</div>
          <div>Memuat data statistik...</div>
        </div>
      )}

      {/* ========== STATISTICS ========== */}
      {!loading && stats && (
        <>
          {/* Stats Grid */}
          <div style={styles.statsGrid}>
            <div style={styles.statBox}>
              <div style={styles.statIcon}>📋</div>
              <div style={styles.statValue}>{stats.total_alpha_records}</div>
              <div style={styles.statLabel}>Total Alpha</div>
            </div>

            <div style={styles.statBoxAlt1}>
              <div style={styles.statIcon}>💰</div>
              <div style={styles.statValue}>
                {formatRupiah(stats.total_deduction)}
              </div>
              <div style={styles.statLabel}>Total Potongan</div>
            </div>

            <div style={styles.statBoxAlt2}>
              <div style={styles.statIcon}>👥</div>
              <div style={styles.statValue}>
                {stats.by_employee?.length || 0}
              </div>
              <div style={styles.statLabel}>Karyawan Terkena</div>
            </div>

            <div style={styles.statBoxAlt3}>
              <div style={styles.statIcon}>📅</div>
              <div style={styles.statValue}>
                {useCustomDate && customStartDate && customEndDate ? (
                  <div style={{ fontSize: "0.9rem" }}>
                    {formatDate(customStartDate)} - {formatDate(customEndDate)}
                  </div>
                ) : (
                  getMonthName(filterMonth)
                )}
              </div>
              <div style={styles.statLabel}>
                {useCustomDate ? "Custom Range" : filterYear}
              </div>
            </div>
          </div>

          {/* Alpha by Employee */}
          {stats.by_employee && stats.by_employee.length > 0 && (
            <div style={styles.card}>
              <h3 style={{ marginTop: 0, marginBottom: "1rem", color: "#fff" }}>
                📊 Alpha Per Karyawan
              </h3>
              <div style={{ overflowX: "auto" }}>
                <table style={styles.table}>
                  <thead style={styles.tableHeader}>
                    <tr>
                      <th style={styles.th}>No</th>
                      <th style={styles.th}>Nama</th>
                      <th style={styles.th}>Jabatan</th>
                      <th style={styles.th}>Jumlah Alpha</th>
                      <th style={styles.th}>Total Potongan</th>
                      <th style={styles.th}>Tanggal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.by_employee.map((emp, index) => (
                      <tr key={emp.employee_id}>
                        <td style={styles.td}>{index + 1}</td>
                        <td style={styles.td}>{emp.nama_lengkap}</td>
                        <td style={styles.td}>{emp.jabatan || "-"}</td>
                        <td style={styles.td}>
                          <span
                            style={{ ...styles.badge, ...styles.badgeDanger }}
                          >
                            {emp.alpha_count}x
                          </span>
                        </td>
                        <td style={styles.td}>
                          <strong style={{ color: "#FF6347" }}>
                            {formatRupiah(emp.total_deduction)}
                          </strong>
                        </td>
                        <td style={{ ...styles.td, fontSize: "0.8rem" }}>
                          {emp.dates.map((d) => formatDate(d)).join(", ")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Raw Records */}
          {stats.raw_records && stats.raw_records.length > 0 && (
            <div style={styles.card}>
              <h3 style={{ marginTop: 0, marginBottom: "1rem", color: "#fff" }}>
                🗂️ Detail Record Alpha
              </h3>
              <div style={{ overflowX: "auto" }}>
                <table style={styles.table}>
                  <thead style={styles.tableHeader}>
                    <tr>
                      <th style={styles.th}>No</th>
                      <th style={styles.th}>Tanggal</th>
                      <th style={styles.th}>Nama</th>
                      <th style={styles.th}>Jabatan</th>
                      <th style={styles.th}>Keterangan</th>
                      <th style={styles.th}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.raw_records.map((record, index) => (
                      <tr key={record.attendance_id}>
                        <td style={styles.td}>{index + 1}</td>
                        <td style={styles.td}>{formatDate(record.tanggal)}</td>
                        <td style={styles.td}>
                          {record.employee?.nama_lengkap || "-"}
                        </td>
                        <td style={styles.td}>
                          {record.employee?.jabatan || "-"}
                        </td>
                        <td
                          style={{
                            ...styles.td,
                            fontSize: "0.8rem",
                            maxWidth: "300px",
                          }}
                        >
                          {record.keterangan || "-"}
                        </td>
                        <td style={styles.td}>
                          <div style={styles.actionButtons}>
                            <button
                              onClick={() =>
                                convertAlpha(
                                  record.attendance_id,
                                  record.employee?.nama_lengkap
                                )
                              }
                              style={styles.btnPrimary}
                              title="Convert alpha ke status lain"
                            >
                              ✏️ Convert
                            </button>
                            {user.role === "Admin" && (
                              <button
                                onClick={() =>
                                  deleteAlphaRecord(
                                    record.attendance_id,
                                    record.employee?.nama_lengkap
                                  )
                                }
                                style={styles.btnDanger}
                                title="Hapus record alpha"
                              >
                                🗑️ Hapus
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty State */}
          {stats.by_employee && stats.by_employee.length === 0 && (
            <div style={styles.successCard}>
              <div style={styles.emptyIcon}>✅</div>
              <h3 style={{ marginTop: 0 }}>Tidak Ada Alpha</h3>
              <p>
                Tidak ada record alpha untuk periode {getMonthName(filterMonth)}{" "}
                {filterYear}.
              </p>
              <p style={{ fontSize: "0.9rem", opacity: 0.8 }}>
                Semua karyawan hadir dengan baik! 🎉
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
