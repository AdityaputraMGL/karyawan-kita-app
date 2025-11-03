import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import * as api from "../services/api";

// --- Inline Styles untuk Kerapian dan Konsistensi ---
const styles = {
  // Global Padding
  mainContainer: {
    padding: "2rem 1.5rem 1.5rem 1.5rem",
  },
  title: {
    fontSize: "2.2rem",
    fontWeight: "700",
    color: "#fff",
    marginBottom: "1.5rem",
  },
  // Card dan Form Layout
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
    appearance: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  textareaField: {
    resize: "vertical",
    minHeight: "80px",
  },
  // Style untuk Tombol
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
    backgroundColor: "#4CAF50", // Hijau
    color: "white",
    padding: "0.4rem 0.8rem",
  },
  btnReject: {
    backgroundColor: "#FF6347", // Merah
    color: "white",
    padding: "0.4rem 0.8rem",
    marginLeft: "0.5rem",
  },
  btnAjukan: {
    backgroundColor: "#5C54A4",
    color: "white",
    padding: "0.8rem 1.5rem",
  },
  // Style Info Box (Disamakan dengan Dark Theme)
  infoBoxAdmin: {
    backgroundColor: "#4A2A2A", // Merah Gelap
    borderColor: "#FF6347",
    color: "rgba(255, 255, 255, 0.8)",
  },
  infoBoxHR: {
    backgroundColor: "#3A4068", // Biru Gelap
    borderColor: "#00BCD4",
    color: "rgba(255, 255, 255, 0.8)",
  },
  // Tabel Styling
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
// --- End Inline Styles ---

export default function Cuti() {
  const [employees, setEmployees] = useState([]);
  const [list, setList] = useState([]);
  const { user } = useAuth();

  const isAdmin = user.role === "Admin";
  const isApprover = isAdmin || user.role === "HR";
  const canSelectOtherEmployee = isAdmin;

  const [form, setForm] = useState({
    employee_id: canSelectOtherEmployee ? "" : user.username,
    tanggal_pengajuan: "",
    tanggal_mulai: "",
    tanggal_selesai: "",
    jenis_pengajuan: "Cuti",
    alasan: "",
    status: "pending",
  });

  const refresh = () => setList(api.leave.findAll());

  useEffect(() => {
    setEmployees(api.employees.findAll());
    refresh();
  }, []);

  const submit = (e) => {
    e.preventDefault();

    if (isAdmin) {
      alert(
        "Admin tidak dapat mengajukan cuti/izin/sakit. Anda hanya dapat menyetujui atau menolak pengajuan."
      );
      return;
    }

    if (!form.employee_id) {
      alert(
        "Pilih karyawan atau pastikan Anda memiliki ID karyawan untuk mengajukan cuti."
      );
      return;
    }

    if (
      !form.tanggal_pengajuan ||
      !form.tanggal_mulai ||
      !form.tanggal_selesai ||
      !form.alasan
    ) {
      alert("Semua field wajib diisi.");
      return;
    }

    const employeeData = api.employees.findById(form.employee_id);

    api.leave.create({
      ...form,
      role: employeeData?.role || user.role,
    });

    setForm({
      employee_id: canSelectOtherEmployee ? "" : user.username,
      tanggal_pengajuan: "",
      tanggal_mulai: "",
      tanggal_selesai: "",
      jenis_pengajuan: "Cuti",
      alasan: "",
      status: "pending",
    });
    refresh();
  };

  const approve = (id, s) => {
    if (!isApprover) return;
    api.leave.update(id, { status: s });
    refresh();
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "approved":
        return { color: "#90EE90", fontWeight: "bold" };
      case "rejected":
        return { color: "#FF6347", fontWeight: "bold" };
      case "pending":
      default:
        return { color: "#FFD700", fontWeight: "bold" };
    }
  };

  return (
    <div style={styles.mainContainer}>
      <h1 style={styles.title}>Cuti, Izin & Sakit</h1>

      {/* Form hanya ditampilkan untuk HR dan Karyawan (!isAdmin) */}
      {!isAdmin && (
        <form style={{ ...styles.card, ...styles.formGrid }} onSubmit={submit}>
          <h3
            style={{
              gridColumn: "1 / -1",
              marginTop: 0,
              color: "#fff",
              fontSize: "1.2rem",
              marginBottom: "0.5rem",
            }}
          >
            Ajukan Cuti / Izin / Sakit
          </h3>

          {/* Dropdown Jenis Pengajuan */}
          <div style={styles.formElement}>
            <label style={styles.label}>Jenis Pengajuan</label>
            <select
              style={styles.inputField}
              name="jenis_pengajuan"
              value={form.jenis_pengajuan}
              onChange={handleChange}
            >
              <option value="Cuti">Cuti</option>
              <option value="Izin">Izin</option>
              <option value="Sakit">Sakit</option>
            </select>
          </div>

          {/* Logika tampilan Field Karyawan */}
          {canSelectOtherEmployee ? (
            // Tampilkan dropdown untuk Admin
            <div style={styles.formElement}>
              <label style={styles.label}>Karyawan</label>
              <select
                style={styles.inputField}
                name="employee_id"
                value={form.employee_id}
                onChange={handleChange}
              >
                <option value="">- pilih -</option>
                {employees.map((e) => (
                  <option key={e.employee_id} value={e.employee_id}>
                    {e.nama_lengkap}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            // Tampilkan nama karyawan/HR yang sedang login (untuk Karyawan & HR)
            <div style={styles.formElement}>
              <label style={styles.label}>Karyawan</label>
              <p
                style={{
                  ...styles.inputField,
                  padding: "0.6rem 0.8rem",
                  backgroundColor: "#3A4068",
                  color: "#fff",
                  height: "auto",
                  margin: 0,
                }}
              >
                {user.nama_lengkap || user.username}
              </p>
            </div>
          )}

          {/* Field Tanggal Pengajuan */}
          <div style={styles.formElement}>
            <label style={styles.label}>Tanggal Pengajuan</label>
            <input
              style={styles.inputField}
              type="date"
              name="tanggal_pengajuan"
              value={form.tanggal_pengajuan}
              onChange={handleChange}
            />
          </div>

          {/* Field Tanggal Mulai */}
          <div style={styles.formElement}>
            <label style={styles.label}>Mulai</label>
            <input
              style={styles.inputField}
              type="date"
              name="tanggal_mulai"
              value={form.tanggal_mulai}
              onChange={handleChange}
            />
          </div>

          {/* Field Tanggal Selesai */}
          <div style={styles.formElement}>
            <label style={styles.label}>Selesai</label>
            <input
              style={styles.inputField}
              type="date"
              name="tanggal_selesai"
              value={form.tanggal_selesai}
              onChange={handleChange}
            />
          </div>

          {/* Field Alasan (Mengambil dua kolom) */}
          <div style={{ ...styles.formElement, gridColumn: "1 / 3" }}>
            <label style={styles.label}>Alasan / Keterangan</label>
            <textarea
              style={{ ...styles.inputField, ...styles.textareaField }}
              rows={2}
              name="alasan"
              value={form.alasan}
              onChange={handleChange}
            />
          </div>

          {/* Tombol Ajukan (Mengambil satu kolom di baris terakhir) */}
          <div
            style={{
              ...styles.formElement,
              flexDirection: "row",
              alignItems: "flex-end",
              justifyContent: "flex-end",
            }}
          >
            <button
              style={{ ...styles.btn, ...styles.btnAjukan }}
              type="submit"
            >
              Ajukan
            </button>
          </div>
        </form>
      )}

      {/* Kotak Informasi (Disesuaikan dengan Dark Theme) */}
      {isAdmin && (
        <div
          style={{
            ...styles.card,
            ...styles.infoBox,
            ...styles.infoBoxAdmin,
            borderLeft: "4px solid #FF6347",
          }}
        >
          <p style={{ margin: 0, color: "rgba(255, 255, 255, 0.8)" }}>
            ⚠️ Anda login sebagai **{user.role}**. Anda hanya dapat menyetujui
            atau menolak pengajuan, **tidak dapat mengajukan cuti/izin/sakit.**
          </p>
        </div>
      )}

      {user.role === "HR" && (
        <div
          style={{
            ...styles.card,
            ...styles.infoBox,
            ...styles.infoBoxHR,
            borderLeft: "4px solid #00BCD4",
          }}
        >
          <p style={{ margin: 0, color: "rgba(255, 255, 255, 0.8)" }}>
            ℹ️ Anda login sebagai **HR**. Anda dapat mengajukan permohonan di
            atas dan juga dapat menyetujui atau menolak pengajuan dari karyawan.
          </p>
        </div>
      )}

      {/* Tabel Pengajuan */}
      <div style={{ ...styles.card, padding: "0" }}>
        <table style={styles.table}>
          <thead style={styles.tableHeader}>
            <tr>
              <th style={styles.th}>Tgl Ajukan</th>
              <th style={styles.th}>Nama</th>
              <th style={styles.th}>Jenis</th>
              <th style={styles.th}>Periode</th>
              <th style={styles.th}>Alasan</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Role</th>
              <th style={styles.th}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {list.map((l) => {
              const emp = api.employees.findById(l.employee_id);
              return (
                <tr
                  key={l.leave_id}
                  style={{ borderBottom: "1px solid #3A4068" }}
                >
                  <td style={styles.td}>{l.tanggal_pengajuan}</td>
                  <td style={styles.td}>
                    {emp?.nama_lengkap || l.employee_id}
                  </td>
                  <td style={styles.td}>{l.jenis_pengajuan || "Cuti"}</td>
                  <td style={styles.td}>
                    {l.tanggal_mulai} → {l.tanggal_selesai}
                  </td>
                  <td style={styles.td}>{l.alasan}</td>
                  <td style={{ ...styles.td, ...getStatusStyle(l.status) }}>
                    {l.status}
                  </td>
                  <td style={styles.td}>
                    {l.role || emp?.role || "Tidak Diketahui"}
                  </td>

                  {/* Aksi Approve/Reject */}
                  <td
                    style={{
                      ...styles.td,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {isApprover && l.status === "pending" && (
                      <>
                        <button
                          style={{ ...styles.btn, ...styles.btnApprove }}
                          onClick={() => approve(l.leave_id, "approved")}
                        >
                          Approve
                        </button>
                        <button
                          style={{ ...styles.btn, ...styles.btnReject }}
                          onClick={() => approve(l.leave_id, "rejected")}
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
            {list.length === 0 && (
              <tr>
                <td colSpan="8" style={{ ...styles.td, textAlign: "center" }}>
                  <i>Belum ada pengajuan.</i>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
