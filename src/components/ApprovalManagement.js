import { useEffect, useState } from "react";

export default function ApprovalManagement() {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ FIXED: Use correct localStorage key
  const TOKEN_KEY = "hr_userToken";

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      setError("");

      // ✅ Use hr_userToken key
      const token = localStorage.getItem(TOKEN_KEY);

      if (!token) {
        throw new Error("Token tidak ditemukan. Silakan login ulang.");
      }

      console.log("📤 Fetching pending approvals...");
      console.log("   Token:", token.substring(0, 20) + "...");

      const response = await fetch(
        "http://localhost:5000/api/attendance/pending-approvals",
        {
          headers: {
            Authorization: `Bearer ${token}`, // ⭐ FIX: Tambah backtick
          },
        }
      );

      console.log("📥 Response status:", response.status);

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error(
            "Akses ditolak. Pastikan Anda login sebagai Admin/HR."
          );
        }
        if (response.status === 401) {
          throw new Error("Token tidak valid. Silakan login ulang.");
        }
        throw new Error(`HTTP Error: ${response.status}`); // ⭐ FIX: Tambah backtick
      }

      const data = await response.json();
      console.log("✅ Pending requests loaded:", data.length);

      setPendingRequests(data);
    } catch (err) {
      console.error("❌ Error fetching pending approvals:", err);
      setError(err.message || "Gagal memuat data pending approvals");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (attendanceId, action, notes = "") => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);

      if (!token) {
        alert("Token tidak ditemukan. Silakan login ulang.");
        return;
      }

      console.log(
        `📤 ${action === "approve" ? "Approving" : "Rejecting"} attendance ID:`,
        attendanceId
      ); // ⭐ FIX: Tambah backtick

      const response = await fetch(
        `http://localhost:5000/api/attendance/approve/${attendanceId}`, // ⭐ FIX: Tambah backtick
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ⭐ FIX: Tambah backtick
          },
          body: JSON.stringify({
            action, // 'approve' or 'reject'
            notes: notes || null,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal memproses approval");
      }

      const result = await response.json();
      console.log("✅ Approval processed:", result);

      alert(
        result.message ||
          `Request berhasil ${action === "approve" ? "disetujui" : "ditolak"}`
      ); // ⭐ FIX: Tambah backtick

      // Refresh list
      fetchPendingRequests();
    } catch (err) {
      console.error("❌ Error processing approval:", err);
      alert(err.message || "Gagal memproses approval");
    }
  };

  const handleApproveClick = (attendanceId) => {
    const notes = prompt("Catatan approval (opsional):");
    if (notes !== null) {
      // User didn't cancel
      handleApprove(attendanceId, "approve", notes);
    }
  };

  const handleRejectClick = (attendanceId) => {
    const notes = prompt("Alasan penolakan (opsional):");
    if (notes !== null) {
      // User didn't cancel
      handleApprove(attendanceId, "reject", notes);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#202040",
        padding: "40px",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
          }}
        >
          <h1
            style={{
              fontSize: "32px",
              fontWeight: "700",
              color: "white",
              margin: 0,
            }}
          >
            ⏳ Pending WFH/Hybrid Approvals
          </h1>
          <button
            onClick={fetchPendingRequests}
            disabled={loading}
            style={{
              padding: "12px 24px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Loading..." : "🔄 Refresh"}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              padding: "16px",
              background: "#ff4444",
              color: "white",
              borderRadius: "10px",
              marginBottom: "20px",
            }}
          >
            ❌ {error}
          </div>
        )}

        {/* Table */}
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            overflow: "hidden",
          }}
        >
          {loading && pendingRequests.length === 0 ? (
            <div
              style={{ padding: "40px", textAlign: "center", color: "#666" }}
            >
              Loading...
            </div>
          ) : pendingRequests.length === 0 ? (
            <div
              style={{ padding: "40px", textAlign: "center", color: "#666" }}
            >
              📋 Tidak ada request yang menunggu approval
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8f9fa" }}>
                  <th style={tableHeaderStyle}>ID</th>
                  <th style={tableHeaderStyle}>Nama Karyawan</th>
                  <th style={tableHeaderStyle}>Jabatan</th>
                  <th style={tableHeaderStyle}>Tanggal</th>
                  <th style={tableHeaderStyle}>Tipe Kerja</th>
                  <th style={tableHeaderStyle}>Keterangan</th>
                  <th style={tableHeaderStyle}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pendingRequests.map((request) => (
                  <tr
                    key={request.attendance_id}
                    style={{ borderBottom: "1px solid #eee" }}
                  >
                    <td style={tableCellStyle}>{request.attendance_id}</td>
                    <td style={tableCellStyle}>
                      {request.employee?.nama_lengkap || "N/A"}
                    </td>
                    <td style={tableCellStyle}>
                      {request.employee?.jabatan || "-"}
                    </td>
                    <td style={tableCellStyle}>
                      {new Date(request.tanggal).toLocaleDateString("id-ID")}
                    </td>
                    <td style={tableCellStyle}>
                      <span
                        style={{
                          padding: "4px 12px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: "600",
                          background:
                            request.tipe_kerja === "WFH (Work From Home)"
                              ? "#e3f2fd"
                              : "#fff3e0",
                          color:
                            request.tipe_kerja === "WFH (Work From Home)"
                              ? "#1976d2"
                              : "#f57c00",
                        }}
                      >
                        {request.tipe_kerja}
                      </span>
                    </td>
                    <td style={tableCellStyle}>{request.keterangan || "-"}</td>
                    <td style={tableCellStyle}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() =>
                            handleApproveClick(request.attendance_id)
                          }
                          style={{
                            padding: "6px 16px",
                            background: "#4caf50",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "13px",
                            fontWeight: "600",
                            cursor: "pointer",
                          }}
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() =>
                            handleRejectClick(request.attendance_id)
                          }
                          style={{
                            padding: "6px 16px",
                            background: "#f44336",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "13px",
                            fontWeight: "600",
                            cursor: "pointer",
                          }}
                        >
                          ✗ Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

const tableHeaderStyle = {
  padding: "16px",
  textAlign: "left",
  fontSize: "13px",
  fontWeight: "600",
  color: "#666",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const tableCellStyle = {
  padding: "16px",
  fontSize: "14px",
  color: "#333",
};
