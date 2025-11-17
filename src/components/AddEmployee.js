import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { employee } from "../services/api";

export default function AddEmployee() {
  const [form, setForm] = useState({
    nama_lengkap: "",
    alamat: "",
    no_hp: "",
    jabatan: "",
    tanggal_masuk: "",
    status_karyawan: "Tetap",
    gaji_pokok: "5000000",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (error) setError(null);
  };

  const validateForm = () => {
    if (!form.nama_lengkap || form.nama_lengkap.trim() === "") {
      setError("Nama lengkap wajib diisi.");
      return false;
    }

    if (form.no_hp && !/^[0-9+\-\s()]+$/.test(form.no_hp)) {
      setError("Nomor HP tidak valid.");
      return false;
    }

    if (form.gaji_pokok && parseFloat(form.gaji_pokok) <= 0) {
      setError("Gaji pokok harus lebih dari 0.");
      return false;
    }

    return true;
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      nama_lengkap: form.nama_lengkap.trim(),
      alamat: form.alamat.trim() || null,
      no_hp: form.no_hp.trim() || null,
      jabatan: form.jabatan.trim() || null,
      tanggal_masuk:
        form.tanggal_masuk || new Date().toISOString().slice(0, 10),
      status_karyawan: form.status_karyawan,
      gaji_pokok: parseFloat(form.gaji_pokok) || 5000000.0,
    };

    console.log("📤 Payload yang akan dikirim:", payload);

    try {
      // Langsung panggil api.employee.create tanpa validasi tambahan
      const response = await employee.create(payload);
      console.log("✅ Response dari server:", response);

      alert("✅ Karyawan berhasil ditambahkan!");

      // Redirect ke halaman employees
      navigate("/employees");
    } catch (err) {
      console.error("❌ Error saat menyimpan:", err);

      let errorMessage = "Gagal menyimpan data karyawan.";

      // Handle error dari axios
      if (err.response) {
        // Server merespon dengan status error (4xx, 5xx)
        errorMessage = err.response.data?.error || errorMessage;
        console.error("Server error:", err.response.data);
      } else if (err.request) {
        // Request dibuat tapi tidak ada response (backend mati)
        errorMessage =
          "Tidak dapat terhubung ke server. Pastikan backend berjalan di port 5000.";
        console.error("Network error:", err.request);
      } else {
        // Error lainnya
        errorMessage = err.message || errorMessage;
      }

      setError(errorMessage);
      alert("❌ " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Tambah Karyawan</h1>

      {error && (
        <div
          style={{
            padding: "10px",
            marginBottom: "15px",
            backgroundColor: "#fee",
            border: "1px solid #f88",
            borderRadius: "4px",
            color: "#c00",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      <form className="card grid cols-2" onSubmit={submit}>
        <div>
          <label>
            Nama Lengkap <span style={{ color: "red" }}>*</span>
          </label>
          <input
            name="nama_lengkap"
            value={form.nama_lengkap}
            onChange={handleChange}
            placeholder="Masukkan nama lengkap"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label>Jabatan</label>
          <input
            name="jabatan"
            value={form.jabatan}
            onChange={handleChange}
            placeholder="Contoh: Manager, Staff, dll"
            disabled={loading}
          />
        </div>

        <div>
          <label>Alamat</label>
          <input
            name="alamat"
            value={form.alamat}
            onChange={handleChange}
            placeholder="Masukkan alamat lengkap"
            disabled={loading}
          />
        </div>

        <div>
          <label>No HP</label>
          <input
            name="no_hp"
            value={form.no_hp}
            onChange={handleChange}
            placeholder="08xx xxxx xxxx"
            disabled={loading}
          />
        </div>

        <div>
          <label>Tanggal Masuk</label>
          <input
            type="date"
            name="tanggal_masuk"
            value={form.tanggal_masuk}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div>
          <label>Status Karyawan</label>
          <select
            name="status_karyawan"
            value={form.status_karyawan}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="Tetap">Tetap</option>
            <option value="Kontrak">Kontrak</option>
            <option value="Magang">Magang</option>
          </select>
        </div>

        <div>
          <label>Gaji Pokok (Rp)</label>
          <input
            type="number"
            name="gaji_pokok"
            value={form.gaji_pokok}
            onChange={handleChange}
            placeholder="5000000"
            min="0"
            step="100000"
            disabled={loading}
          />
        </div>

        <div style={{ gridColumn: "1 / -1", display: "flex", gap: "10px" }}>
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Menyimpan..." : "💾 Simpan"}
          </button>

          <button
            className="btn"
            type="button"
            onClick={() => navigate("/employees")}
            disabled={loading}
            style={{ backgroundColor: "#6c757d" }}
          >
            ❌ Batal
          </button>
        </div>
      </form>

      {loading && (
        <div
          style={{
            marginTop: "15px",
            padding: "10px",
            backgroundColor: "#e3f2fd",
            borderRadius: "4px",
            textAlign: "center",
          }}
        >
          ⏳ Memproses data...
        </div>
      )}
    </div>
  );
}
