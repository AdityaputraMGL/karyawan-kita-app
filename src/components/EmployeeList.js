import { useCallback, useEffect, useState } from "react"; // ⭐ Tambahkan useCallback
import { Link, useNavigate } from "react-router-dom";
import { employee } from "../services/api"; // ⭐ IMPORT YANG BENAR: employee (singular)

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
    marginBottom: "1.5rem", // Jarak ke Card
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
    gap: "1rem", // Jarak antar elemen aksi
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
    padding: "0", // Penting: Hapus padding di card agar tabel menempel
    overflowX: "auto", // Agar tabel bisa di-scroll jika terlalu lebar
  },
  // Style untuk Tabel
  table: {
    width: "100%",
    borderCollapse: "collapse",
    color: "white",
  },
  // Style untuk Header Tabel (thead)
  tableHeader: {
    backgroundColor: "#3A4068", // Latar belakang header lebih kontras
    textAlign: "left",
  },
  // Style untuk sel Header
  th: {
    padding: "1rem 1.5rem", // Padding header seragam
    fontSize: "0.95rem",
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.8)",
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
    padding: "1rem 1.5rem", // Padding body seragam
    fontSize: "0.9rem",
  },
  // Style untuk Tombol Aksi di dalam tabel
  actionCell: {
    display: "flex",
    gap: "0.5rem", // Jarak antar tombol Edit/Hapus
    alignItems: "center",
  },
  // Style untuk Tombol Danger (Hapus)
  btnDanger: {
    backgroundColor: "#FF6347",
    color: "white",
  },
};
// --- End Inline Styles ---

export default function EmployeeList() {
  const [list, setList] = useState([]);
  const [q, setQ] = useState(""); // State untuk Query (Pencarian)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [hoveredRow, setHoveredRow] = useState(null);

  // ⭐ FUNGSI REFRESH ASYNCHRONOUS
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // ⭐ Menggunakan employee.findAll() dari API Axios yang baru
      const data = await employee.findAll(q);
      setList(data);
    } catch (e) {
      setError(e.message || "Gagal memuat data karyawan.");
      console.error("Gagal memuat data karyawan:", e);
    } finally {
      setLoading(false);
    }
  }, [q]); // Refresh saat q berubah

  useEffect(() => {
    refresh();
  }, [refresh]);

  // ⭐ FUNGSI DELETE ASYNCHRONOUS
  const del = async (id) => {
    if (!window.confirm("Hapus karyawan ini?")) return;
    try {
      await employee.delete(id); // ⭐ Menggunakan employee.delete()
      refresh(); // Muat ulang data setelah berhasil dihapus
    } catch (e) {
      setError(e.message || "Gagal menghapus karyawan.");
      console.error("Gagal menghapus karyawan:", e);
    }
  };

  const exportCSV = async () => {
    // ⭐ Jadikan async
    try {
      // ⭐ Menggunakan employee.findAll()
      const allEmployees = await employee.findAll();

      const rows = allEmployees.map((e) => ({
        employee_id: e.employee_id,
        nama_lengkap: e.nama_lengkap,
        jabatan: e.jabatan,
        tanggal_masuk: e.tanggal_masuk,
        status_karyawan: e.status_karyawan,
        no_hp: e.no_hp,
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
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Nama</th>
              <th style={styles.th}>Jabatan</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Masuk</th>
              <th style={styles.th}>Aksi</th>
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
                <td style={styles.td}>{e.employee_id}</td>
                <td style={styles.td}>
                  <Link
                    to={`/employee/${e.employee_id}`}
                    style={{ color: "#cfd3cfff", textDecoration: "none" }}
                  >
                    {e.nama_lengkap}
                  </Link>
                </td>
                <td style={styles.td}>{e.jabatan}</td>
                <td style={styles.td}>{e.status_karyawan}</td>
                <td style={styles.td}>{e.tanggal_masuk}</td>
                <td style={{ ...styles.td, ...styles.actionCell }}>
                  <button
                    style={{
                      ...styles.btn,
                      ...styles.btnSecondary,
                      padding: "0.4rem 0.8rem",
                    }}
                    onClick={() => navigate(`/employee/${e.employee_id}`)}
                  >
                    Edit
                  </button>
                  <button
                    style={{
                      ...styles.btn,
                      ...styles.btnDanger,
                      padding: "0.4rem 0.8rem",
                    }}
                    onClick={() => del(e.employee_id)}
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan="6" style={{ ...styles.td, textAlign: "center" }}>
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
