import { useEffect, useState } from "react";
import * as api from "../services/api";

// --- Inline Styles untuk Kerapian dan Konsistensi ---
const styles = {
  mainContainer: { padding: "2rem 1.5rem 1.5rem 1.5rem" },
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
  formElement: { display: "flex", flexDirection: "column", gap: "0.4rem" },
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
    width: "100%",
    boxSizing: "border-box",
  },
  textareaField: { resize: "vertical", minHeight: "80px" },
  btnPrimary: {
    backgroundColor: "#5C54A4",
    color: "#fff",
    padding: "0.8rem 1.5rem",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    border: "none",
    fontSize: "1rem",
    marginTop: "0.8rem",
  },
  infoBoxHR: {
    backgroundColor: "#3A4068",
    border: "1px solid #00BCD4",
    borderRadius: "8px",
    padding: "1rem",
    marginBottom: "1.5rem",
    color: "rgba(255, 255, 255, 0.8)",
  },
  table: { width: "100%", borderCollapse: "collapse", color: "white" },
  tableHeader: { backgroundColor: "#3A4068", textAlign: "left" },
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

// Helper untuk menentukan warna nilai
const getScoreColor = (nilai) => {
  nilai = Number(nilai);
  if (nilai >= 85) return "#90EE90"; // Hijau (Sangat Baik)
  if (nilai >= 65) return "#FFD700"; // Kuning (Baik)
  return "#FF6347"; // Merah (Perlu Perbaikan)
};
// --- End Inline Styles ---

export default function Performance() {
  const [employees, setEmployees] = useState([]);
  const [list, setList] = useState([]);
  const [form, setForm] = useState({
    employee_id: "",
    periode: "2025-Q3",
    nilai_kinerja: 0,
    catatan: "",
  });

  const currentUser = api.getCurrentUser();
  const isHR = currentUser?.role === "HR";
  const isAdmin = currentUser?.role === "Admin";
  const canInput = isAdmin;

  useEffect(() => {
    setEmployees(api.employees.findAll());
    setList(api.performance.findAll());
  }, []);

  const submit = (e) => {
    e.preventDefault();

    if (!canInput) {
      alert(
        "Anda tidak memiliki akses untuk menambah atau mengubah data kinerja."
      );
      return;
    }

    if (!form.employee_id || !form.periode) {
      alert("Karyawan dan Periode harus diisi.");
      return;
    }

    api.performance.create(form);
    setList(api.performance.findAll());
    setForm({
      employee_id: "",
      periode: "2025-Q3",
      nilai_kinerja: 0,
      catatan: "",
    });
  };

  return (
    <div style={styles.mainContainer}>
      <h1 style={styles.title}>Manajemen Talenta</h1>

      {/* Form hanya ditampilkan jika bukan HR */}
      {canInput && (
        <form style={{ ...styles.card, ...styles.formGrid }} onSubmit={submit}>
          {/* Row 1: Karyawan, Periode, Nilai Kinerja */}
          <div style={styles.formElement}>
            <label style={styles.label}>Karyawan</label>
            <select
              style={styles.inputField}
              value={form.employee_id}
              onChange={(e) =>
                setForm({ ...form, employee_id: e.target.value })
              }
              required
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
            <label style={styles.label}>Periode</label>
            <input
              style={styles.inputField}
              value={form.periode}
              onChange={(e) => setForm({ ...form, periode: e.target.value })}
            />
          </div>
          <div style={styles.formElement}>
            <label style={styles.label}>Nilai Kinerja</label>
            <input
              style={styles.inputField}
              type="number"
              min="0"
              max="100"
              value={form.nilai_kinerja}
              onChange={(e) =>
                setForm({ ...form, nilai_kinerja: e.target.value })
              }
            />
          </div>

          {/* Row 2: Catatan dan Tombol Simpan */}
          <div style={{ ...styles.formElement, gridColumn: "1 / 3" }}>
            <label style={styles.label}>Catatan</label>
            <textarea
              style={{ ...styles.inputField, ...styles.textareaField }}
              rows={2}
              value={form.catatan}
              onChange={(e) => setForm({ ...form, catatan: e.target.value })}
            />
          </div>
          <div
            style={{
              ...styles.formElement,
              flexDirection: "row",
              alignItems: "flex-end",
              justifyContent: "flex-start",
            }}
          >
            <button style={styles.btnPrimary} type="submit">
              Simpan
            </button>
          </div>
        </form>
      )}

      {/* Informasi untuk HR */}
      {isHR && !isAdmin && (
        <div style={{ ...styles.infoBoxHR, borderLeft: "4px solid #00BCD4" }}>
          <p style={{ margin: 0, color: "rgba(255, 255, 255, 0.8)" }}>
            ℹ️ Anda login sebagai HR. Anda hanya dapat melihat data kinerja
            karyawan.
          </p>
        </div>
      )}

      {/* Tabel Kinerja */}
      <div style={{ ...styles.card, padding: "0" }}>
        <table style={styles.table}>
          <thead style={styles.tableHeader}>
            <tr>
              <th style={styles.th}>Periode</th>
              <th style={styles.th}>Nama</th>
              <th style={styles.th}>Role</th>{" "}
              {/* Kolom Role telah ditambahkan */}
              <th style={styles.th}>Nilai</th>
              <th style={styles.th}>Catatan</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => {
              // ✅ PERBAIKAN: Memastikan pemanggilan findById dilakukan
              const emp = api.employees.findById(p.employee_id);

              // Tentukan nama dan role dengan fallback
              const employeeName = emp?.nama_lengkap || p.employee_id;
              const employeeRole = emp?.role || "-";

              return (
                <tr
                  key={p.performance_id}
                  style={{ borderBottom: "1px solid #3A4068" }}
                >
                  <td style={styles.td}>{p.periode}</td>
                  <td style={styles.td}>{employeeName}</td>
                  <td style={styles.td}>{employeeRole}</td>{" "}
                  {/* Kolom Role yang sudah diisi */}
                  <td
                    style={{
                      ...styles.td,
                      fontWeight: "bold",
                      color: getScoreColor(p.nilai_kinerja),
                    }}
                  >
                    {p.nilai_kinerja}
                  </td>
                  <td
                    style={{
                      ...styles.td,
                      fontSize: "0.8rem",
                      color: "rgba(255, 255, 255, 0.7)",
                    }}
                  >
                    {p.catatan}
                  </td>
                </tr>
              );
            })}
            {list.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  style={{
                    ...styles.td,
                    textAlign: "center",
                    borderBottom: "none",
                  }}
                >
                  <i>Belum ada data kinerja.</i>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
