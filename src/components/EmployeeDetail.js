import { useCallback, useEffect, useState } from "react"; // ⭐ Tambahkan useCallback
import { useNavigate, useParams } from "react-router-dom";
// ⭐ IMPORT YANG BENAR: employee (singular)
import { employee } from "../services/api";

const empty = {
  nama_lengkap: "",
  alamat: "",
  no_hp: "",
  jabatan: "",
  tanggal_masuk: "",
  status_karyawan: "Tetap",
  gaji_pokok: 0.0, // Tambahkan untuk konsistensi API
  user_id: null,
};

export default function EmployeeDetail() {
  const { id } = useParams();
  const [form, setForm] = useState(null); // Mulai dari null untuk menunjukkan loading
  const [loading, setLoading] = useState(true); // ⭐ LOADING STATE
  const [error, setError] = useState(null); // ⭐ ERROR STATE
  const navigate = useNavigate();

  // ⭐ FUNGSI FETCH ASYNCHRONOUS
  const fetchEmployee = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // ⭐ Menggunakan employee.findById()
      const data = await employee.findById(id);

      if (!data) {
        setForm(empty);
        setError("Karyawan tidak ditemukan.");
      } else {
        // Gabungkan data yang diterima dengan nilai default (terutama untuk menghindari null di input)
        setForm({
          ...empty,
          ...data,
          // Pastikan gaji_pokok diubah ke float jika ada
          gaji_pokok: parseFloat(data.gaji_pokok || 0),
        });
      }
    } catch (e) {
      setError(e.message || "Gagal memuat detail karyawan.");
      console.error("Error fetching detail:", e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEmployee();
  }, [fetchEmployee]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const save = async (e) => {
    // ⭐ Jadikan fungsi ASYNCHRONOUS
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Payload hanya field yang bisa diupdate
    const payload = {
      nama_lengkap: form.nama_lengkap,
      alamat: form.alamat,
      no_hp: form.no_hp,
      jabatan: form.jabatan,
      tanggal_masuk: form.tanggal_masuk,
      status_karyawan: form.status_karyawan,
      // API backend mengharapkan gaji_pokok sebagai decimal
      gaji_pokok: parseFloat(form.gaji_pokok || 0),
    };

    try {
      // ⭐ PANGGILAN API ASYNCHRONOUS YANG BENAR
      await employee.update(form.employee_id || id, payload);

      alert("✅ Data berhasil diperbarui!");
      navigate("/employees");
    } catch (e) {
      setError(e.message || "Gagal menyimpan perubahan.");
      console.error("Error updating employee:", e);
      alert("Gagal menyimpan: " + (e.message || e));
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // ⭐ TAMPILKAN LOADING ATAU ERROR
  // -------------------------------------------------------------
  if (loading || form === null) {
    return (
      <div>
        <h1>Memuat Detail Karyawan...</h1>
        <div className="card" style={{ padding: "20px", textAlign: "center" }}>
          Memuat data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1>Error</h1>
        <div
          className="card"
          style={{ padding: "20px", color: "red", textAlign: "center" }}
        >
          Error: {error}
        </div>
      </div>
    );
  }

  // Jika data ditemukan dan tidak ada error:
  return (
    <div>
      <h1>Edit Karyawan: {form.nama_lengkap}</h1>
      <form className="card grid cols-2" onSubmit={save}>
        <div>
          <label>Nama Lengkap</label>
          <input
            name="nama_lengkap" // ⭐ Tambahkan name attribute
            value={form.nama_lengkap}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Jabatan</label>
          <input
            name="jabatan" // ⭐ Tambahkan name attribute
            value={form.jabatan}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Alamat</label>
          <input
            name="alamat" // ⭐ Tambahkan name attribute
            value={form.alamat}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>No HP</label>
          <input
            name="no_hp" // ⭐ Tambahkan name attribute
            value={form.no_hp}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Tanggal Masuk</label>
          <input
            type="date"
            name="tanggal_masuk" // ⭐ Tambahkan name attribute
            value={form.tanggal_masuk}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Status Karyawan</label>
          <select
            name="status_karyawan" // ⭐ Tambahkan name attribute
            value={form.status_karyawan}
            onChange={handleChange}
          >
            {/* ⭐ Mengubah opsi ke Title Case dan menambahkan value eksplisit */}
            <option value="Tetap">Tetap</option>
            <option value="Kontrak">Kontrak</option>
            <option value="Magang">Magang</option>
          </select>
        </div>
        {/* ⭐ Tambahkan Field Gaji Pokok (Jika Anda ingin mengedit gaji) */}
        <div>
          <label>Gaji Pokok</label>
          <input
            type="number"
            name="gaji_pokok"
            value={form.gaji_pokok}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex">
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
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
