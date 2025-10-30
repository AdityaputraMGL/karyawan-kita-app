import { useEffect, useState } from "react";
import * as api from "../services/api";

export default function Payroll() {
  const [employees, setEmployees] = useState([]);
  const [list, setList] = useState([]);
  const [deductionDetails, setDeductionDetails] = useState({
    alpa: 0,
    terlambat: 0,
    izin: 0,
    sakit: 0,
    totalPotongan: 0,
  });

  const [form, setForm] = useState({
    employee_id: "",
    periode: "2025-09",
    gaji_pokok: 0,
    tunjangan: 0,
    potongan: 0,
    alasan_potongan: "",
  });

  useEffect(() => {
    setEmployees(api.employees.findAll());
    setList(api.payroll.findAll());
  }, []);

  // Fungsi untuk menghitung potongan otomatis berdasarkan absensi
  const calculateAutoDeduction = (employeeId, periode) => {
    if (!employeeId || !periode) {
      setDeductionDetails({
        alpa: 0,
        terlambat: 0,
        izin: 0,
        sakit: 0,
        totalPotongan: 0,
      });
      return 0;
    }

    // Ambil data absensi
    const allAttendance = api.attendance.findAll();

    // Parse periode (format: YYYY-MM)
    const [year, month] = periode.split("-");

    // Filter absensi untuk karyawan dan periode tertentu
    const employeeAttendance = allAttendance.filter((a) => {
      const attendanceDate = new Date(a.tanggal);
      const attendanceYear = attendanceDate.getFullYear().toString();
      const attendanceMonth = String(attendanceDate.getMonth() + 1).padStart(
        2,
        "0"
      );

      return (
        a.employee_id === employeeId &&
        attendanceYear === year &&
        attendanceMonth === month
      );
    });

    // Hitung jumlah ketidakhadiran
    const alpaCount = employeeAttendance.filter(
      (a) => a.status === "alpa"
    ).length;
    const izinCount = employeeAttendance.filter(
      (a) => a.status === "izin"
    ).length;
    const sakitCount = employeeAttendance.filter(
      (a) => a.status === "sakit"
    ).length;

    // Hitung keterlambatan (masuk setelah jam 08:00)
    const lateCount = employeeAttendance.filter((a) => {
      if (!a.jam_masuk || a.status !== "hadir") return false;
      const [hour, minute] = a.jam_masuk.split(":").map(Number);
      return hour > 8 || (hour === 8 && minute > 0);
    }).length;

    // Tentukan nilai potongan per kategori
    const POTONGAN_ALPA = 100000; // Rp 100.000 per hari alpha
    const POTONGAN_TERLAMBAT = 25000; // Rp 25.000 per keterlambatan
    const POTONGAN_IZIN = 50000; // Rp 50.000 per hari izin
    const POTONGAN_SAKIT = 0; // Tidak ada potongan untuk sakit dengan surat dokter

    const potonganAlpa = alpaCount * POTONGAN_ALPA;
    const potonganTerlambat = lateCount * POTONGAN_TERLAMBAT;
    const potonganIzin = izinCount * POTONGAN_IZIN;
    const potonganSakit = sakitCount * POTONGAN_SAKIT;

    const totalPotongan =
      potonganAlpa + potonganTerlambat + potonganIzin + potonganSakit;

    // Update detail potongan
    const details = {
      alpa: alpaCount,
      terlambat: lateCount,
      izin: izinCount,
      sakit: sakitCount,
      totalPotongan: totalPotongan,
    };

    setDeductionDetails(details);

    // Generate alasan potongan
    const reasons = [];
    if (alpaCount > 0)
      reasons.push(
        `${alpaCount}x Alpa (Rp ${potonganAlpa.toLocaleString("id-ID")})`
      );
    if (lateCount > 0)
      reasons.push(
        `${lateCount}x Terlambat (Rp ${potonganTerlambat.toLocaleString(
          "id-ID"
        )})`
      );
    if (izinCount > 0)
      reasons.push(
        `${izinCount}x Izin (Rp ${potonganIzin.toLocaleString("id-ID")})`
      );
    if (sakitCount > 0) reasons.push(`${sakitCount}x Sakit`);

    const alasanPotongan =
      reasons.length > 0 ? reasons.join(", ") : "Tidak ada potongan";

    // Update form dengan potongan otomatis dan alasan
    setForm((prev) => ({
      ...prev,
      potongan: totalPotongan,
      alasan_potongan: alasanPotongan,
    }));

    return totalPotongan;
  };

  // Handler ketika karyawan atau periode berubah
  const handleEmployeeOrPeriodChange = (field, value) => {
    const updatedForm = { ...form, [field]: value };
    setForm(updatedForm);

    // Hitung ulang potongan otomatis
    if (field === "employee_id" || field === "periode") {
      calculateAutoDeduction(
        field === "employee_id" ? value : form.employee_id,
        field === "periode" ? value : form.periode
      );
    }
  };

  const calcTotal = () =>
    (Number(form.gaji_pokok) || 0) +
    (Number(form.tunjangan) || 0) -
    (Number(form.potongan) || 0);

  const submit = (e) => {
    e.preventDefault();

    // ⭐ PERBAIKAN: Pastikan mengambil role karyawan dari state employees
    // Gunakan find pada state 'employees' yang sudah di-load di useEffect
    const employeeData = employees.find(
      (e) => e.employee_id === form.employee_id
    );
    const employeeRole = employeeData?.role || "Karyawan";

    api.payroll.create({
      ...form,
      employee_role: employeeRole,
      total_gaji: calcTotal(),
      alasan_potongan: form.alasan_potongan || "Tidak ada potongan",
    });
    setList(api.payroll.findAll());

    // Reset form
    setForm({
      employee_id: "",
      periode: "2025-09",
      gaji_pokok: 0,
      tunjangan: 0,
      potongan: 0,
      alasan_potongan: "",
    });

    setDeductionDetails({
      alpa: 0,
      terlambat: 0,
      izin: 0,
      sakit: 0,
      totalPotongan: 0,
    });
  };

  const exportCSV = () => {
    const rows = list.map((p) => ({
      employee_id: p.employee_id,
      periode: p.periode,
      employee_role: p.employee_role || "Karyawan",
      gaji_pokok: p.gaji_pokok,
      tunjangan: p.tunjangan,
      potongan: p.potongan,
      alasan_potongan: p.alasan_potongan || "",
      total_gaji: p.total_gaji,
    }));
    const header = Object.keys(rows[0] || {}).join(",");
    const body = rows.map((r) => Object.values(r).join(",")).join("\n");
    const blob = new Blob([header + "\n" + body], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "payroll.csv";
    a.click();
  };

  return (
    <div>
      <div className="flex">
        <h1>Payroll</h1>
        <div className="right">
          <button className="btn secondary" onClick={exportCSV}>
            Export CSV
          </button>
        </div>
      </div>

      <form className="card grid cols-3" onSubmit={submit}>
        <div>
          <label>Karyawan</label>
          <select
            value={form.employee_id}
            onChange={(e) =>
              handleEmployeeOrPeriodChange("employee_id", e.target.value)
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
        <div>
          <label>Periode</label>
          <input
            type="month"
            value={form.periode}
            onChange={(e) =>
              handleEmployeeOrPeriodChange("periode", e.target.value)
            }
          />
        </div>
        <div>
          <label>Gaji Pokok</label>
          <input
            type="number"
            value={form.gaji_pokok}
            onChange={(e) => setForm({ ...form, gaji_pokok: e.target.value })}
          />
        </div>
        <div>
          <label>Tunjangan</label>
          <input
            type="number"
            value={form.tunjangan}
            onChange={(e) => setForm({ ...form, tunjangan: e.target.value })}
          />
        </div>
        <div>
          <label>Potongan (Otomatis)</label>
          <input
            type="number"
            value={form.potongan}
            readOnly
            style={{ background: "#110d0dff" }}
          />
        </div>
        <div>
          <label>Total</label>
          <input readOnly value={calcTotal()} style={{ fontWeight: "bold" }} />
        </div>

        {/* Detail Potongan */}
        {form.employee_id && deductionDetails.totalPotongan > 0 && (
          <div style={{ gridColumn: "1 / -1" }}>
            <div
              style={{
                background: "#fff3e0",
                border: "1px solid #ff9800",
                borderRadius: "8px",
                padding: "1rem",
                marginBottom: "1rem",
              }}
            >
              <strong
                style={{
                  color: "#e65100",
                  display: "block",
                  marginBottom: "0.5rem",
                }}
              >
                📋 Detail Potongan Gaji:
              </strong>
              <div
                style={{ fontSize: "14px", lineHeight: "1.8", color: "#666" }}
              >
                {deductionDetails.alpa > 0 && (
                  <div>
                    ❌ Alpa: <strong>{deductionDetails.alpa} hari</strong> (Rp{" "}
                    {(deductionDetails.alpa * 100000).toLocaleString("id-ID")})
                  </div>
                )}
                {deductionDetails.terlambat > 0 && (
                  <div>
                    ⏰ Terlambat:{" "}
                    <strong>{deductionDetails.terlambat} kali</strong> (Rp{" "}
                    {(deductionDetails.terlambat * 25000).toLocaleString(
                      "id-ID"
                    )}
                    )
                  </div>
                )}
                {deductionDetails.izin > 0 && (
                  <div>
                    📝 Izin: <strong>{deductionDetails.izin} hari</strong> (Rp{" "}
                    {(deductionDetails.izin * 50000).toLocaleString("id-ID")})
                  </div>
                )}
                {deductionDetails.sakit > 0 && (
                  <div>
                    🏥 Sakit: <strong>{deductionDetails.sakit} hari</strong>{" "}
                    (Tidak ada potongan)
                  </div>
                )}
                <div
                  style={{
                    marginTop: "0.5rem",
                    paddingTop: "0.5rem",
                    borderTop: "1px solid #ffb74d",
                  }}
                >
                  <strong style={{ color: "#e65100" }}>
                    Total Potongan: Rp{" "}
                    {deductionDetails.totalPotongan.toLocaleString("id-ID")}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        )}

        <button className="btn">Simpan</button>
      </form>

      {/* Info Box */}
      <div
        className="card"
        style={{
          background: "#e3f2fd",
          border: "1px solid #2196f3",
          padding: "1rem",
          marginBottom: "1rem",
        }}
      >
        <strong
          style={{ color: "#1976d2", display: "block", marginBottom: "0.5rem" }}
        >
          ℹ️ Informasi Perhitungan Potongan Otomatis:
        </strong>
        <ul
          style={{
            margin: 0,
            paddingLeft: "1.5rem",
            color: "#555",
            fontSize: "14px",
          }}
        >
          <li>Alpa: Rp 100.000 per hari</li>
          <li>Terlambat (masuk setelah jam 08:00): Rp 25.000 per kali</li>
          <li>Izin: Rp 50.000 per hari</li>
          <li>Sakit: Rp 0 (tidak ada potongan dengan surat dokter)</li>
        </ul>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Periode</th>
              <th>Nama</th>
              <th>Role</th>
              <th>Pokok</th>
              <th>Tunjangan</th>
              <th>Potongan</th>
              <th>Alasan Potongan</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => {
              // Ganti api.employees.findById(p.employee_id) dengan find dari state employees
              const emp = employees.find(
                (e) => e.employee_id === p.employee_id
              );
              return (
                <tr key={p.payroll_id}>
                  <td>{p.periode}</td>
                  {/* Gunakan data nama dari state employees yang lebih terjamin */}
                  <td>{emp?.nama_lengkap || p.employee_id}</td>
                  {/* Gunakan role yang tersimpan di payroll, atau fallback ke role dari data karyawan */}
                  <td>{p.employee_role || emp?.role || "-"}</td>
                  <td>Rp {Number(p.gaji_pokok).toLocaleString("id-ID")}</td>
                  <td>Rp {Number(p.tunjangan).toLocaleString("id-ID")}</td>
                  <td style={{ color: p.potongan > 0 ? "#f44336" : "inherit" }}>
                    Rp {Number(p.potongan).toLocaleString("id-ID")}
                  </td>
                  <td style={{ fontSize: "12px", color: "#666" }}>
                    {p.alasan_potongan || "-"}
                  </td>
                  <td>
                    <b>Rp {Number(p.total_gaji).toLocaleString("id-ID")}</b>
                  </td>
                </tr>
              );
            })}
            {list.length === 0 && (
              <tr>
                <td colSpan="8">
                  <i>Belum ada payroll.</i>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
