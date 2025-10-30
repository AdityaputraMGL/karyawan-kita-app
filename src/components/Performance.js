import { useEffect, useState } from "react";
import * as api from "../services/api";

export default function Performance() {
  const [employees, setEmployees] = useState([]);
  const [list, setList] = useState([]);
  const [form, setForm] = useState({
    employee_id: "",
    periode: "2025-Q3",
    nilai_kinerja: 0,
    catatan: "",
  });

  // Cek apakah user adalah HR
  const currentUser = api.getCurrentUser();
  const isHR = currentUser?.role === "HR";

  // Ambil semua karyawan dan data kinerja
  useEffect(() => {
    setEmployees(api.employees.findAll());
    setList(api.performance.findAll());
  }, []);

  const submit = (e) => {
    e.preventDefault();

    // Blokir submit jika user adalah HR
    if (isHR) {
      alert(
        "HR tidak memiliki akses untuk menambah atau mengubah data kinerja."
      );
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
    <div>
      <h1>Manajemen Talenta</h1>

      {/* Form hanya ditampilkan jika bukan HR */}
      {!isHR && (
        <form className="card grid cols-3" onSubmit={submit}>
          <div>
            <label>Karyawan</label>
            <select
              value={form.employee_id}
              onChange={(e) =>
                setForm({ ...form, employee_id: e.target.value })
              }
            >
              <option value="">- pilih -</option>
              {employees.map((e) => (
                <option key={e.employee_id} value={e.employee_id}>
                  {e.nama_lengkap}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Periode</label>
            <input
              value={form.periode}
              onChange={(e) => setForm({ ...form, periode: e.target.value })}
            />
          </div>
          <div>
            <label>Nilai Kinerja</label>
            <input
              type="number"
              value={form.nilai_kinerja}
              onChange={(e) =>
                setForm({ ...form, nilai_kinerja: e.target.value })
              }
            />
          </div>
          <div className="grid" style={{ gridTemplateColumns: "1fr" }}>
            <label>Catatan</label>
            <textarea
              rows={2}
              value={form.catatan}
              onChange={(e) => setForm({ ...form, catatan: e.target.value })}
            />
          </div>
          <button className="btn">Simpan</button>
        </form>
      )}

      {/* Informasi untuk HR */}
      {isHR && (
        <div
          className="card"
          style={{
            background: "#e3f2fd",
            border: "1px solid #2196f3",
            padding: "1rem",
            marginBottom: "1rem",
          }}
        >
          <p style={{ margin: 0, color: "#1976d2" }}>
            ℹ️ Anda login sebagai HR. Anda hanya dapat melihat data kinerja
            karyawan.
          </p>
        </div>
      )}

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Periode</th>
              <th>Nama</th>
              {/* ⭐ Tambahkan kolom Role */}
              <th>Role</th>
              <th>Nilai</th>
              <th>Catatan</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => {
              // Cari data karyawan menggunakan ID
              const emp = api.employees.findById(p.employee_id);
              return (
                <tr key={p.performance_id}>
                  <td>{p.periode}</td>
                  <td>{emp?.nama_lengkap}</td>
                  {/* ⭐ Tampilkan data Role Karyawan */}
                  <td>{emp?.role || "-"}</td>
                  <td>{p.nilai_kinerja}</td>
                  <td>{p.catatan}</td>
                </tr>
              );
            })}
            {list.length === 0 && (
              <tr>
                {/* Update colspan menjadi 5 */}
                <td colSpan="5">
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
