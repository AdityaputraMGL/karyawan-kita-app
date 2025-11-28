import { useCallback, useEffect, useState } from "react";
import * as api from "../services/api";
import { employee, performance } from "../services/api";

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
  btnEdit: {
    backgroundColor: "#FFA500",
    color: "#fff",
    padding: "0.5rem 1rem",
    borderRadius: "6px",
    fontWeight: "500",
    cursor: "pointer",
    border: "none",
    fontSize: "0.85rem",
    marginRight: "0.5rem",
  },
  btnDelete: {
    backgroundColor: "#FF4444",
    color: "#fff",
    padding: "0.5rem 1rem",
    borderRadius: "6px",
    fontWeight: "500",
    cursor: "pointer",
    border: "none",
    fontSize: "0.85rem",
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

export default function Performance() {
  const [employeesData, setEmployeesData] = useState([]);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    employee_id: "",
    periode: "2025-Q3",
    nilai_kinerja: 0,
    catatan: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  const currentUser = api.getCurrentUser();
  const isHR = currentUser?.role === "HR";
  const isAdmin = currentUser?.role === "Admin";
  const canInput = isAdmin;

  // FUNGSI REFRESH
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const empData = await employee.findAll();
      const perfData = await performance.findAll();

      setEmployeesData(empData);
      setList(perfData);
    } catch (e) {
      setError(e.message || "Gagal memuat data kinerja.");
      console.error("Gagal memuat data kinerja:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // FUNGSI SUBMIT (CREATE/UPDATE)
  const submit = async (e) => {
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

    try {
      if (editMode) {
        // UPDATE
        await performance.update(editId, form);
        alert("Data kinerja berhasil diperbarui!");
        setEditMode(false);
        setEditId(null);
      } else {
        // CREATE
        await performance.create(form);
        alert("Data kinerja berhasil disimpan!");
      }

      refresh();
      setForm({
        employee_id: "",
        periode: "2025-Q3",
        nilai_kinerja: 0,
        catatan: "",
      });
    } catch (e) {
      setError(e.message || "Gagal menyimpan data kinerja.");
      alert("Gagal menyimpan data kinerja: " + e.message);
    }
  };

  // FUNGSI EDIT
  const handleEdit = (p) => {
    setEditMode(true);
    setEditId(p.performance_id);
    setForm({
      employee_id: p.employee_id.toString(),
      periode: p.periode,
      nilai_kinerja: p.nilai_kinerja,
      catatan: p.catatan || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // FUNGSI DELETE
  const handleDelete = async (id) => {
    if (!canInput) {
      alert("Anda tidak memiliki akses untuk menghapus data kinerja.");
      return;
    }

    const confirmDelete = window.confirm(
      "Apakah Anda yakin ingin menghapus data kinerja ini?"
    );

    if (!confirmDelete) return;

    try {
      await performance.delete(id);
      alert("Data kinerja berhasil dihapus!");
      refresh();
    } catch (e) {
      alert("Gagal menghapus data kinerja: " + e.message);
    }
  };

  // FUNGSI CANCEL EDIT
  const handleCancelEdit = () => {
    setEditMode(false);
    setEditId(null);
    setForm({
      employee_id: "",
      periode: "2025-Q3",
      nilai_kinerja: 0,
      catatan: "",
    });
  };

  // Tampilkan Loading/Error
  if (loading) {
    return (
      <div style={styles.mainContainer}>
        <h1 style={styles.title}>Manajemen Talenta</h1>
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
        <h1 style={styles.title}>Manajemen Talenta</h1>
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
              disabled={editMode}
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

          {/* Row 2: Catatan dan Tombol */}
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
              gap: "0.5rem",
            }}
          >
            <button style={styles.btnPrimary} type="submit">
              {editMode ? "Update" : "Simpan"}
            </button>
            {editMode && (
              <button
                style={{ ...styles.btnPrimary, backgroundColor: "#6c757d" }}
                type="button"
                onClick={handleCancelEdit}
              >
                Batal
              </button>
            )}
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
              <th style={styles.th}>Role</th>
              <th style={styles.th}>Nilai</th>
              <th style={styles.th}>Catatan</th>
              {canInput && <th style={styles.th}>Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {list.map((p) => {
              const emp = employeesData.find(
                (ed) => ed.employee_id === p.employee_id
              );

              const employeeName =
                emp?.nama_lengkap || p.employee?.nama_lengkap || p.employee_id;

              const employeeRole =
                p.employee?.user?.role || p.role || emp?.user?.role || "-";

              return (
                <tr
                  key={p.performance_id}
                  style={{ borderBottom: "1px solid #3A4068" }}
                >
                  <td style={styles.td}>{p.periode}</td>
                  <td style={styles.td}>{employeeName}</td>
                  <td style={styles.td}>{employeeRole}</td>
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
                  {canInput && (
                    <td style={styles.td}>
                      <button
                        style={styles.btnEdit}
                        onClick={() => handleEdit(p)}
                      >
                        Edit
                      </button>
                      <button
                        style={styles.btnDelete}
                        onClick={() => handleDelete(p.performance_id)}
                      >
                        Hapus
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
            {list.length === 0 && (
              <tr>
                <td
                  colSpan={canInput ? "6" : "5"}
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
