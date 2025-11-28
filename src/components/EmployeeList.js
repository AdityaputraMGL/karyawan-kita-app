import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { employee } from "../services/api";

// --- Inline Styles untuk Kerapian dan Ukuran Ramping ---
const styles = {
  // Style untuk container utama (mengurangi padding)
  mainContainer: {
    padding: "2rem 1.5rem 1.5rem 1.5rem",
  },
  // Style untuk Header (Judul dan Aksi)
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
  },
  // Style untuk Judul Halaman
  title: {
    fontSize: "2.2rem",
    fontWeight: "700",
    color: "#fff",
  },
  // Style untuk Search dan Tombol Aksi (Kanan)
  actions: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  // Style untuk Search Input
  input: {
    padding: "0.5rem 0.8rem",
    borderRadius: "8px",
    border: "1px solid #3A4068",
    backgroundColor: "#3A4068",
    color: "white",
    width: "220px",
    fontSize: "0.9rem",
  },
  // Style untuk Tombol Default
  btn: {
    padding: "0.6rem 1rem",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    border: "none",
    fontSize: "0.9rem",
  },
  // Style untuk Tombol Secondary (Export)
  btnSecondary: {
    backgroundColor: "#3A4068",
    color: "#fff",
    transition: "all 0.2s ease",
  },
  // Style untuk Tombol Primary (Tambah)
  btnPrimary: {
    backgroundColor: "#5C54A4",
    color: "#fff",
  },
  // Style untuk Card (Tabel)
  card: {
    backgroundColor: "#2C3150",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
    padding: "0",
    overflowX: "auto",
  },
  // Style untuk Tabel
  table: {
    width: "100%",
    borderCollapse: "collapse",
    color: "white",
    tableLayout: "fixed",
  },
  // Style untuk Header Tabel (thead)
  tableHeader: {
    backgroundColor: "#3A4068",
    textAlign: "left",
  },
  // Style untuk sel Header
  th: {
    padding: "1rem 1.5rem",
    fontSize: "0.95rem",
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.8)",
    whiteSpace: "nowrap",
  },
  // Style untuk baris Body
  tr: {
    borderBottom: "1px solid #3A4068",
    transition: "background-color 0.1s",
  },
  // Style untuk hover baris
  trHover: {
    backgroundColor: "#333355",
  },
  // Style untuk sel Body
  td: {
    padding: "1rem 1.5rem",
    fontSize: "0.9rem",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  // Style untuk Tombol Aksi di dalam tabel
  actionCell: {
    display: "flex",
    gap: "0.6rem",
    alignItems: "center",
    justifyContent: "flex-start",
    whiteSpace: "nowrap",
  },
  // Style untuk Tombol Danger (Hapus)
  btnDanger: {
    backgroundColor: "#FF6347",
    color: "white",
    transition: "all 0.2s ease",
  },
  // Style untuk tombol aksi kecil di tabel
  btnActionSmall: {
    padding: "0.5rem 1rem",
    fontSize: "0.85rem",
    minWidth: "70px",
    textAlign: "center",
    whiteSpace: "nowrap",
  },
  // Style untuk kolom dengan width spesifik
  colID: {
    width: "60px",
  },
  colNama: {
    width: "150px",
  },
  colJabatan: {
    width: "120px",
  },
  colAlamat: {
    width: "200px",
    maxWidth: "200px",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  colNoHP: {
    width: "130px",
  },
  colStatus: {
    width: "100px",
  },
  colMasuk: {
    width: "180px",
  },
  colAksi: {
    width: "180px",
    minWidth: "180px",
  },
};
// --- End Inline Styles ---

export default function EmployeeList() {
  const [list, setList] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [hoveredRow, setHoveredRow] = useState(null);

  // ⭐ FUNGSI REFRESH ASYNCHRONOUS
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await employee.findAll(q);
      setList(data);
    } catch (e) {
      setError(e.message || "Gagal memuat data karyawan.");
      console.error("Gagal memuat data karyawan:", e);
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // ⭐ FUNGSI DELETE ASYNCHRONOUS
  const del = async (id) => {
    if (!window.confirm("Hapus karyawan ini?")) return;
    try {
      await employee.delete(id);
      refresh();
    } catch (e) {
      setError(e.message || "Gagal menghapus karyawan.");
      console.error("Gagal menghapus karyawan:", e);
    }
  };

  const exportCSV = async () => {
    try {
      const allEmployees = await employee.findAll();

      // ⭐ TAMBAHKAN ALAMAT DAN NO HP KE EXPORT CSV
      const rows = allEmployees.map((e) => ({
        employee_id: e.employee_id,
        nama_lengkap: e.nama_lengkap,
        jabatan: e.jabatan,
        alamat: e.alamat, // ⭐ TAMBAH ALAMAT
        no_hp: e.no_hp, // ⭐ TAMBAH NO HP
        tanggal_masuk: e.tanggal_masuk,
        status_karyawan: e.status_karyawan,
      }));

      const header = Object.keys(rows[0] || {}).join(",");
      const body = rows
        .map((r) =>
          Object.values(r)
            .map((v) => `"${(v ?? "").toString().replace(/"/g, '""')}"`)
            .join(",")
        )
        .join("\n");
      const blob = new Blob([header + "\n" + body], { type: "text/csv" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "employees.csv";
      a.click();
    } catch (e) {
      setError(e.message || "Gagal mengekspor data.");
    }
  };

  // -------------------------------------------------------------
  // ⭐ TAMPILKAN LOADING ATAU ERROR
  // -------------------------------------------------------------
  if (loading) {
    return (
      <div style={styles.mainContainer}>
        <h1 style={styles.title}>Data Karyawan</h1>
        <div
          style={{
            ...styles.card,
            padding: "20px",
            textAlign: "center",
            color: "#ccc",
          }}
        >
          Memuat data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.mainContainer}>
        <h1 style={styles.title}>Data Karyawan</h1>
        <div
          style={{
            ...styles.card,
            padding: "20px",
            textAlign: "center",
            color: "#FF6347",
          }}
        >
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.mainContainer}>
      {/* Header Halaman (Judul + Aksi) */}
      <div style={styles.header}>
        <h1 style={styles.title}>Data Karyawan</h1>
        <div style={styles.actions}>
          <input
            style={styles.input}
            placeholder="Cari nama/jabatan..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button
            style={{ ...styles.btn, ...styles.btnSecondary }}
            onClick={exportCSV}
          >
            Export CSV
          </button>
          <button
            style={{ ...styles.btn, ...styles.btnPrimary }}
            onClick={() => navigate("/add-employee")}
          >
            + Tambah
          </button>
        </div>
      </div>

      {/* Card (Table Container) */}
      <div style={styles.card}>
        <table style={styles.table}>
          <thead style={styles.tableHeader}>
            <tr>
              <th style={{ ...styles.th, ...styles.colID }}>ID</th>
              <th style={{ ...styles.th, ...styles.colNama }}>Nama</th>
              <th style={{ ...styles.th, ...styles.colJabatan }}>Jabatan</th>
              <th style={{ ...styles.th, ...styles.colAlamat }}>Alamat</th>
              <th style={{ ...styles.th, ...styles.colNoHP }}>No HP</th>
              <th style={{ ...styles.th, ...styles.colStatus }}>Status</th>
              <th style={{ ...styles.th, ...styles.colMasuk }}>Masuk</th>
              <th style={{ ...styles.th, ...styles.colAksi }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {list.map((e) => (
              <tr
                key={e.employee_id}
                style={{
                  ...styles.tr,
                  ...(hoveredRow === e.employee_id ? styles.trHover : {}),
                }}
                onMouseEnter={() => setHoveredRow(e.employee_id)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <td style={{ ...styles.td, ...styles.colID }}>
                  {e.employee_id}
                </td>
                <td style={{ ...styles.td, ...styles.colNama }}>
                  <Link
                    to={`/employee/${e.employee_id}`}
                    style={{ color: "#cfd3cfff", textDecoration: "none" }}
                    title={e.nama_lengkap}
                  >
                    {e.nama_lengkap}
                  </Link>
                </td>
                <td
                  style={{ ...styles.td, ...styles.colJabatan }}
                  title={e.jabatan || "-"}
                >
                  {e.jabatan || "-"}
                </td>
                <td
                  style={{ ...styles.td, ...styles.colAlamat }}
                  title={e.alamat || "-"}
                >
                  {e.alamat || "-"}
                </td>
                <td style={{ ...styles.td, ...styles.colNoHP }}>
                  {e.no_hp || "-"}
                </td>
                <td style={{ ...styles.td, ...styles.colStatus }}>
                  {e.status_karyawan}
                </td>
                <td style={{ ...styles.td, ...styles.colMasuk }}>
                  {e.tanggal_masuk}
                </td>
                <td
                  style={{
                    ...styles.td,
                    ...styles.actionCell,
                    ...styles.colAksi,
                  }}
                >
                  <button
                    style={{
                      ...styles.btn,
                      ...styles.btnSecondary,
                      ...styles.btnActionSmall,
                    }}
                    onClick={() => navigate(`/employee/${e.employee_id}`)}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "#4A5078";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "#3A4068";
                    }}
                  >
                    Edit
                  </button>
                  <button
                    style={{
                      ...styles.btn,
                      ...styles.btnDanger,
                      ...styles.btnActionSmall,
                    }}
                    onClick={() => del(e.employee_id)}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "#FF4534";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "#FF6347";
                    }}
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan="8" style={{ ...styles.td, textAlign: "center" }}>
                  <i>Tidak ada data.</i>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
