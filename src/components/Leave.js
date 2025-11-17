import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { leave } from "../services/api";

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
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "1rem",
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
  textareaField: {
    padding: "0.6rem 0.8rem",
    borderRadius: "8px",
    border: "1px solid #3A4068",
    backgroundColor: "#3A4068",
    color: "white",
    fontSize: "0.9rem",
    resize: "vertical",
    minHeight: "80px",
  },
  btn: {
    padding: "0.6rem 1rem",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    border: "none",
    fontSize: "0.9rem",
    transition: "background-color 0.2s",
  },
  btnApprove: {
    backgroundColor: "#4CAF50",
    color: "white",
    padding: "0.4rem 0.8rem",
    fontSize: "0.85rem",
  },
  btnReject: {
    backgroundColor: "#FF6347",
    color: "white",
    padding: "0.4rem 0.8rem",
    marginLeft: "0.5rem",
    fontSize: "0.85rem",
  },
  btnAjukan: {
    backgroundColor: "#5C54A4",
    color: "white",
    padding: "0.8rem 1.5rem",
    gridColumn: "1 / -1",
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
    padding: "0.8rem 1.2rem",
    fontSize: "0.85rem",
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.8)",
  },
  td: {
    padding: "0.8rem 1.2rem",
    fontSize: "0.85rem",
    borderBottom: "1px solid #3A4068",
  },
};

export default function Leave() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // State untuk form pengajuan
  const [newLeaveData, setNewLeaveData] = useState({
    tanggal_mulai: "",
    tanggal_selesai: "",
    jenis_pengajuan: "Cuti",
    alasan: "",
    employee_id: user?.employee_id || "",
  });

  const fetchLeaveRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // ✅ Ambil semua data leave
      let data = await leave.findAll();

      // Filter di frontend berdasarkan role
      if (user && (user.role === "Admin" || user.role === "HR")) {
        // Admin/HR melihat semua
        setList(data);
      } else if (user && user.employee_id) {
        // Karyawan hanya melihat milik sendiri
        const myLeaves = data.filter((l) => l.employee_id === user.employee_id);
        setList(myLeaves);
      } else {
        setList([]);
      }
    } catch (e) {
      setError(e.message);
      console.error("Gagal memuat data cuti:", e);
      setList([]); // Set empty array saat error
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchLeaveRequests();
    }
  }, [user, fetchLeaveRequests]);

  const handleFormChange = (e) => {
    setNewLeaveData({ ...newLeaveData, [e.target.name]: e.target.value });
  };

  // Fungsi pengajuan cuti
  const handleSubmitLeave = async (e) => {
    e.preventDefault();
    setError(null);

    if (!user?.employee_id) {
      alert("Employee ID tidak ditemukan. Silakan login ulang.");
      return;
    }

    try {
      await leave.create({
        ...newLeaveData,
        employee_id: user.employee_id,
      });

      alert("✅ Pengajuan cuti berhasil dikirim!");
      fetchLeaveRequests();

      // Reset form
      setNewLeaveData({
        ...newLeaveData,
        tanggal_mulai: "",
        tanggal_selesai: "",
        alasan: "",
      });
    } catch (e) {
      setError("Gagal mengajukan cuti: " + e.message);
      alert("❌ Gagal mengajukan cuti: " + e.message);
    }
  };

  // Fungsi update status (Admin/HR)
  const handleUpdateStatus = async (leaveId, status) => {
    setError(null);
    try {
      await leave.updateStatus(leaveId, status);
      alert(`✅ Status cuti berhasil diperbarui menjadi ${status}.`);
      fetchLeaveRequests();
    } catch (e) {
      setError("Gagal memperbarui status cuti: " + e.message);
      alert("❌ Gagal memperbarui status: " + e.message);
    }
  };

  // Tampilkan Loading/Error
  if (loading) {
    return <div style={styles.mainContainer}>Memuat data cuti...</div>;
  }

  const isAdminOrHR = user && (user.role === "Admin" || user.role === "HR");

  return (
    <div style={styles.mainContainer}>
      <h1 style={styles.title}>📋 Pengajuan Cuti</h1>

      {/* Form Pengajuan Cuti */}
      <div style={styles.card}>
        <h3
          style={{
            marginTop: 0,
            color: "#fff",
            fontSize: "1.2rem",
            marginBottom: "1rem",
          }}
        >
          ➕ Ajukan Cuti Baru
        </h3>

        <form onSubmit={handleSubmitLeave} style={styles.formGrid}>
          <div style={styles.formElement}>
            <label style={styles.label}>Tanggal Mulai</label>
            <input
              type="date"
              name="tanggal_mulai"
              value={newLeaveData.tanggal_mulai}
              onChange={handleFormChange}
              style={styles.inputField}
              required
            />
          </div>

          <div style={styles.formElement}>
            <label style={styles.label}>Tanggal Selesai</label>
            <input
              type="date"
              name="tanggal_selesai"
              value={newLeaveData.tanggal_selesai}
              onChange={handleFormChange}
              style={styles.inputField}
              required
            />
          </div>

          <div style={styles.formElement}>
            <label style={styles.label}>Jenis Pengajuan</label>
            <select
              name="jenis_pengajuan"
              value={newLeaveData.jenis_pengajuan}
              onChange={handleFormChange}
              style={styles.inputField}
            >
              <option value="Cuti">Cuti Tahunan</option>
              <option value="Sakit">Sakit</option>
              <option value="Izin">Izin Khusus</option>
            </select>
          </div>

          <div style={{ ...styles.formElement, gridColumn: "1 / -1" }}>
            <label style={styles.label}>Alasan</label>
            <textarea
              name="alasan"
              placeholder="Jelaskan alasan pengajuan cuti..."
              value={newLeaveData.alasan}
              onChange={handleFormChange}
              style={styles.textareaField}
              required
            />
          </div>

          <button type="submit" style={{ ...styles.btn, ...styles.btnAjukan }}>
            📤 Ajukan Cuti
          </button>
        </form>

        {error && (
          <div
            style={{
              marginTop: "1rem",
              padding: "0.8rem",
              backgroundColor: "#4A2A2A",
              borderRadius: "8px",
              color: "#FF6347",
            }}
          >
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* Tabel Daftar Pengajuan */}
      <div style={{ ...styles.card, padding: 0 }}>
        <table style={styles.table}>
          <thead style={styles.tableHeader}>
            <tr>
              <th style={styles.th}>ID</th>
              {isAdminOrHR && <th style={styles.th}>Karyawan</th>}
              <th style={styles.th}>Jenis</th>
              <th style={styles.th}>Mulai</th>
              <th style={styles.th}>Selesai</th>
              <th style={styles.th}>Alasan</th>
              <th style={styles.th}>Status</th>
              {isAdminOrHR && <th style={styles.th}>Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr>
                <td
                  colSpan={isAdminOrHR ? 8 : 6}
                  style={{ ...styles.td, textAlign: "center", color: "#999" }}
                >
                  <i>Belum ada data cuti.</i>
                </td>
              </tr>
            ) : (
              list.map((l) => (
                <tr key={l.leave_id}>
                  <td style={styles.td}>{l.leave_id}</td>
                  {isAdminOrHR && (
                    <td style={styles.td}>
                      {l.employee?.nama_lengkap || "N/A"}
                    </td>
                  )}
                  <td style={styles.td}>{l.jenis_pengajuan}</td>
                  <td style={styles.td}>
                    {new Date(l.tanggal_mulai).toLocaleDateString("id-ID")}
                  </td>
                  <td style={styles.td}>
                    {new Date(l.tanggal_selesai).toLocaleDateString("id-ID")}
                  </td>
                  <td style={styles.td}>{l.alasan}</td>
                  <td style={styles.td}>
                    <span
                      style={{
                        color:
                          l.status === "approved"
                            ? "#4CAF50"
                            : l.status === "pending"
                            ? "#FFA726"
                            : "#FF6347",
                        fontWeight: "600",
                      }}
                    >
                      {l.status.toUpperCase()}
                    </span>
                  </td>
                  {isAdminOrHR && (
                    <td style={styles.td}>
                      {l.status === "pending" ? (
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button
                            onClick={() =>
                              handleUpdateStatus(l.leave_id, "approved")
                            }
                            style={{ ...styles.btn, ...styles.btnApprove }}
                          >
                            ✓ Setujui
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateStatus(l.leave_id, "rejected")
                            }
                            style={{ ...styles.btn, ...styles.btnReject }}
                          >
                            ✗ Tolak
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: "#999", fontSize: "0.85rem" }}>
                          Selesai
                        </span>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
