import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

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
  quotaCard: {
    backgroundColor: "#3A4068",
    borderRadius: "10px",
    padding: "1.2rem",
    marginBottom: "1.5rem",
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "1rem",
  },
  quotaItem: {
    textAlign: "center",
  },
  quotaLabel: {
    fontSize: "0.8rem",
    color: "rgba(255, 255, 255, 0.6)",
    marginBottom: "0.3rem",
  },
  quotaValue: {
    fontSize: "1.8rem",
    fontWeight: "700",
    color: "#fff",
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
  btnDisabled: {
    backgroundColor: "#555",
    cursor: "not-allowed",
    opacity: 0.5,
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
  warningBox: {
    marginTop: "1rem",
    padding: "0.8rem",
    backgroundColor: "#4A2A2A",
    borderRadius: "8px",
    color: "#FF6347",
    gridColumn: "1 / -1",
  },
};

export default function Leave() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quota, setQuota] = useState(null);
  const { user } = useAuth();

  // State untuk form
  const [newLeaveData, setNewLeaveData] = useState({
    tanggal_mulai: "",
    tanggal_selesai: "",
    jenis_pengajuan: "Cuti",
    alasan: "",
  });

  // ⭐ State untuk file upload
  const [selectedFile, setSelectedFile] = useState(null);

  // Fungsi hitung hari
  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  // Fetch kuota cuti
  const fetchLeaveQuota = useCallback(async () => {
    if (user?.role === "Karyawan") {
      try {
        const response = await fetch("http://localhost:5000/api/leave/quota", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("hr_userToken")}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          console.log("✅ Quota loaded:", data);
          setQuota(data);
        }
      } catch (e) {
        console.error("❌ Error fetching quota:", e);
      }
    }
  }, [user]);

  // Fetch leave requests
  const fetchLeaveRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:5000/api/leave", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("hr_userToken")}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setList(data);
      } else {
        throw new Error(data.error || "Failed to fetch");
      }
    } catch (e) {
      setError(e.message);
      console.error("❌ Error fetching leave:", e);
      setList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchLeaveRequests();
      fetchLeaveQuota();
    }
  }, [user, fetchLeaveRequests, fetchLeaveQuota]);

  // Handle form change
  const handleFormChange = (e) => {
    setNewLeaveData({ ...newLeaveData, [e.target.name]: e.target.value });
  };

  // ⭐ Handle file change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        alert("❌ Hanya file PDF yang diperbolehkan!");
        e.target.value = "";
        setSelectedFile(null);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("❌ Ukuran file maksimal 5MB!");
        e.target.value = "";
        setSelectedFile(null);
        return;
      }
      console.log("✅ File selected:", file.name);
      setSelectedFile(file);
    }
  };

  // Submit leave request
  const handleSubmitLeave = async (e) => {
    e.preventDefault();
    setError(null);

    console.log("📝 Starting leave submission...");

    if (!user?.employee_id) {
      alert("Employee ID tidak ditemukan. Silakan login ulang.");
      return;
    }

    // ⭐ Validasi file untuk Sakit
    if (newLeaveData.jenis_pengajuan === "Sakit" && !selectedFile) {
      alert("❌ Surat keterangan sakit (PDF) wajib di-upload!");
      return;
    }

    if (!newLeaveData.tanggal_mulai || !newLeaveData.tanggal_selesai) {
      alert("Tanggal mulai dan selesai harus diisi!");
      return;
    }

    if (!newLeaveData.alasan || newLeaveData.alasan.trim() === "") {
      alert("Alasan harus diisi!");
      return;
    }

    const requestedDays = calculateDays(
      newLeaveData.tanggal_mulai,
      newLeaveData.tanggal_selesai
    );

    if (requestedDays <= 0) {
      alert(
        "Tanggal selesai harus lebih besar atau sama dengan tanggal mulai!"
      );
      return;
    }

    // Validasi kuota untuk Cuti
    if (newLeaveData.jenis_pengajuan === "Cuti" && quota) {
      if (requestedDays > quota.remaining_days) {
        alert(`❌ Kuota tidak mencukupi! Sisa: ${quota.remaining_days} hari.`);
        return;
      }
    }

    try {
      console.log("📤 Sending leave request...");

      // ⭐ Kirim dengan FormData (untuk file upload)
      const formData = new FormData();
      formData.append("tanggal_mulai", newLeaveData.tanggal_mulai);
      formData.append("tanggal_selesai", newLeaveData.tanggal_selesai);
      formData.append("jenis_pengajuan", newLeaveData.jenis_pengajuan);
      formData.append("alasan", newLeaveData.alasan);
      formData.append("employee_id", user.employee_id);

      if (selectedFile) {
        formData.append("attachment", selectedFile);
        console.log("  - Uploading file:", selectedFile.name);
      }

      const response = await fetch("http://localhost:5000/api/leave", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("hr_userToken")}`,
          // ⚠️ JANGAN set Content-Type, biar browser auto-set
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal mengajukan");
      }

      console.log("✅ Success:", data);
      alert(`✅ ${data.message || "Pengajuan berhasil!"}`);

      // Refresh & reset
      await fetchLeaveRequests();
      await fetchLeaveQuota();

      setNewLeaveData({
        tanggal_mulai: "",
        tanggal_selesai: "",
        jenis_pengajuan: "Cuti",
        alasan: "",
      });
      setSelectedFile(null);

      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = "";
    } catch (e) {
      console.error("❌ Error:", e);
      const errorMsg = "Gagal mengajukan: " + e.message;
      setError(errorMsg);
      alert("❌ " + errorMsg);
    }
  };

  // Update status (Admin/HR)
  const handleUpdateStatus = async (leaveId, status) => {
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:5000/api/leave/${leaveId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("hr_userToken")}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update");
      }

      alert(`✅ Status berhasil diperbarui menjadi ${status}.`);
      await fetchLeaveRequests();
      await fetchLeaveQuota();
    } catch (e) {
      setError("Gagal memperbarui status: " + e.message);
      alert("❌ Gagal memperbarui status: " + e.message);
    }
  };

  if (loading) {
    return <div style={styles.mainContainer}>Memuat data cuti...</div>;
  }

  const isAdminOrHR = user && (user.role === "Admin" || user.role === "HR");
  const requestedDays = calculateDays(
    newLeaveData.tanggal_mulai,
    newLeaveData.tanggal_selesai
  );
  const quotaInsufficient =
    newLeaveData.jenis_pengajuan === "Cuti" &&
    quota &&
    requestedDays > quota.remaining_days;

  return (
    <div style={styles.mainContainer}>
      <h1 style={styles.title}>📋 Pengajuan Cuti</h1>

      {/* Kuota Cuti Bulanan */}
      {user?.role === "Karyawan" && quota && (
        <div style={styles.quotaCard}>
          <div style={styles.quotaItem}>
            <div style={styles.quotaLabel}>Kuota Bulan Ini</div>
            <div style={styles.quotaValue}>{quota.total_quota} Hari</div>
            <div
              style={{
                fontSize: "0.75rem",
                color: "rgba(255,255,255,0.5)",
                marginTop: "0.5rem",
              }}
            >
              {quota.month || "Bulan ini"}
            </div>
          </div>
          <div style={styles.quotaItem}>
            <div style={styles.quotaLabel}>Terpakai</div>
            <div style={{ ...styles.quotaValue, color: "#FF6347" }}>
              {quota.used_days} Hari
            </div>
          </div>
          <div style={styles.quotaItem}>
            <div style={styles.quotaLabel}>Sisa</div>
            <div style={{ ...styles.quotaValue, color: "#4CAF50" }}>
              {quota.remaining_days} Hari
            </div>
          </div>
        </div>
      )}

      {/* Form Pengajuan */}
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

          {/* Jumlah Hari */}
          {newLeaveData.tanggal_mulai && newLeaveData.tanggal_selesai && (
            <div style={styles.formElement}>
              <label style={styles.label}>Jumlah Hari</label>
              <div
                style={{
                  ...styles.inputField,
                  backgroundColor: quotaInsufficient ? "#6B3434" : "#4A5080",
                  fontWeight: "700",
                  fontSize: "1rem",
                  color: quotaInsufficient ? "#FF6347" : "#4CAF50",
                }}
              >
                {requestedDays} Hari
              </div>
            </div>
          )}

          {/* ⭐ FILE UPLOAD UNTUK SAKIT */}
          {newLeaveData.jenis_pengajuan === "Sakit" && (
            <div style={{ ...styles.formElement, gridColumn: "1 / -1" }}>
              <label style={styles.label}>
                Surat Keterangan Sakit (PDF){" "}
                <span style={{ color: "#FF6347" }}>*</span>
              </label>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                style={{
                  ...styles.inputField,
                  cursor: "pointer",
                }}
                required
              />
              {selectedFile && (
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "#4CAF50",
                    marginTop: "0.5rem",
                  }}
                >
                  ✓ File: {selectedFile.name} (
                  {(selectedFile.size / 1024).toFixed(2)} KB)
                </div>
              )}
            </div>
          )}

          <div style={{ ...styles.formElement, gridColumn: "1 / -1" }}>
            <label style={styles.label}>Alasan</label>
            <textarea
              name="alasan"
              placeholder="Jelaskan alasan pengajuan..."
              value={newLeaveData.alasan}
              onChange={handleFormChange}
              style={styles.textareaField}
              required
            />
          </div>

          {quotaInsufficient && (
            <div style={styles.warningBox}>
              ⚠️ Kuota cuti tidak mencukupi! Anda memiliki{" "}
              {quota.remaining_days} hari tersisa.
            </div>
          )}

          <button
            type="submit"
            style={{
              ...styles.btn,
              ...styles.btnAjukan,
              ...(quotaInsufficient ? styles.btnDisabled : {}),
            }}
            disabled={quotaInsufficient}
          >
            📤 Ajukan
          </button>
        </form>

        {error && <div style={styles.warningBox}>⚠️ {error}</div>}
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
              <th style={styles.th}>Hari</th>
              <th style={styles.th}>Alasan</th>
              {isAdminOrHR && <th style={styles.th}>Lampiran</th>}
              <th style={styles.th}>Status</th>
              {isAdminOrHR && <th style={styles.th}>Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr>
                <td
                  colSpan={isAdminOrHR ? 10 : 7}
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
                  <td style={styles.td}>
                    <strong>{l.total_days || 0}</strong>
                  </td>
                  <td style={styles.td}>{l.alasan}</td>
                  {isAdminOrHR && (
                    <td style={styles.td}>
                      {l.attachment_filename ? (
                        <a
                          href={`http://localhost:5000/api/leave/attachment/${l.attachment_filename}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: "#4CAF50",
                            textDecoration: "underline",
                            cursor: "pointer",
                          }}
                        >
                          📄 Lihat PDF
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                  )}
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
