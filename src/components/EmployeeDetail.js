import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as api from "../services/api";

const empty = {
  nama_lengkap: "",
  alamat: "",
  no_hp: "",
  jabatan: "",
  tanggal_masuk: "",
  // ⭐ Mengubah default value menjadi Title Case (konsisten dengan pendaftaran)
  status_karyawan: "Tetap",
  user_id: null,
};

export default function EmployeeDetail() {
  const { id } = useParams();
  const [form, setForm] = useState(empty);
  const navigate = useNavigate();

  useEffect(() => {
    const data = api.employees.findById(id);
    if (data) setForm(data);
  }, [id]);

  const save = (e) => {
    e.preventDefault();
    api.employees.update(form.employee_id, form);
    alert("Tersimpan");
    navigate("/employees");
  };

  return (
    <div>
      <h1>Edit Karyawan</h1>
      <form className="card grid cols-2" onSubmit={save}>
        <div>
          <label>Nama Lengkap</label>
          <input
            value={form.nama_lengkap}
            onChange={(e) => setForm({ ...form, nama_lengkap: e.target.value })}
            required
          />
        </div>
        <div>
          <label>Jabatan</label>
          <input
            value={form.jabatan}
            onChange={(e) => setForm({ ...form, jabatan: e.target.value })}
          />
        </div>
        <div>
          <label>Alamat</label>
          <input
            value={form.alamat}
            onChange={(e) => setForm({ ...form, alamat: e.target.value })}
          />
        </div>
        <div>
          <label>No HP</label>
          <input
            value={form.no_hp}
            onChange={(e) => setForm({ ...form, no_hp: e.target.value })}
          />
        </div>
        <div>
          <label>Tanggal Masuk</label>
          <input
            type="date"
            value={form.tanggal_masuk}
            onChange={(e) =>
              setForm({ ...form, tanggal_masuk: e.target.value })
            }
          />
        </div>
        <div>
          <label>Status Karyawan</label>
          <select
            value={form.status_karyawan}
            onChange={(e) =>
              setForm({ ...form, status_karyawan: e.target.value })
            }
          >
            {/* ⭐ Mengubah opsi ke Title Case dan menambahkan value eksplisit */}
            <option value="Tetap">Tetap</option>
            <option value="Kontrak">Kontrak</option>
            <option value="Magang">Magang</option>
          </select>
        </div>
        <div className="flex">
          <button className="btn">Simpan</button>
          <button
            type="button"
            className="btn secondary"
            onClick={() => navigate("/employees")}
          >
            Kembali
          </button>
        </div>
      </form>
    </div>
  );
}
