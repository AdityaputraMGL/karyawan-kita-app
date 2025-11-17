import { useCallback, useEffect, useState } from "react";
import { attendance, employee, leave, payroll } from "../services/api";

// --- Inline Styles ---
const styles = {
  mainContainer: { padding: "2rem 1.5rem 1.5rem 1.5rem" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
  },
  title: { fontSize: "2.2rem", fontWeight: "700", color: "#fff" },
  btn: {
    padding: "0.6rem 1rem",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    border: "none",
    fontSize: "0.9rem",
    backgroundColor: "#3A4068",
    color: "#fff",
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
  },
  inputReadOnly: { background: "#3A4068", fontWeight: "bold", color: "#fff" },
  btnSimpan: {
    backgroundColor: "#5C54A4",
    color: "#fff",
    padding: "0.8rem 1.5rem",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    border: "none",
    fontSize: "1rem",
  },
  infoBox: {
    background: "#3A4068",
    border: "1px solid #5C54A4",
    borderRadius: "8px",
    padding: "1.5rem",
    marginBottom: "1.5rem",
    color: "rgba(255, 255, 255, 0.8)",
  },
  table: { width: "100%", borderCollapse: "collapse", color: "white" },
  tableHeader: { backgroundColor: "#3A4068", textAlign: "left" },
  th: {
    padding: "0.8rem 1.5rem",
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.8)",
  },
  td: {
    padding: "0.8rem 1.5rem",
    fontSize: "0.9rem",
    borderBottom: "1px solid #3A4068",
  },
  realtimeBox: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    border: "2px solid #fff",
    borderRadius: "12px",
    padding: "1.5rem",
    marginBottom: "1.5rem",
    color: "#fff",
    boxShadow: "0 4px 16px rgba(102, 126, 234, 0.3)",
  },
  deductionCard: {
    background: "#4A2A2A",
    border: "2px solid #FF6347",
    borderRadius: "10px",
    padding: "1.5rem",
    marginTop: "1rem",
    color: "rgba(255, 255, 255, 0.9)",
  },
  btnDelete: {
    background: "none",
    border: "none",
    color: "#FF6347",
    cursor: "pointer",
    fontSize: "1rem",
    padding: "0.4rem",
    transition: "color 0.2s",
  },
};

// Tarif potongan
const POTONGAN_ALPA = 100000;
const POTONGAN_TERLAMBAT = 25000;
const POTONGAN_IZIN = 50000;
const POTONGAN_SAKIT = 0;

export default function Payroll() {
  const [employeesData, setEmployeesData] = useState([]);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deductionDetails, setDeductionDetails] = useState({
    alpa: 0,
    terlambat: 0,
    izin: 0,
    sakit: 0,
    totalPotongan: 0,
    breakdown: [],
  });

  const [form, setForm] = useState({
    employee_id: "",
    periode: new Date().toISOString().slice(0, 7),
    gaji_pokok: 0,
    tunjangan: 0,
    potongan: 0,
    alasan_potongan: "",
  });

  // Format Rupiah Helper
  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  // Refresh List
  const refreshList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const employeeData = await employee.findAll();
      const rawPayrollData = await payroll.findAll();

      setEmployeesData(employeeData);
      setList(rawPayrollData);
    } catch (e) {
      setError(e.message || "Gagal memuat data utama.");
      console.error("Error loading payroll data:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete Payroll
  const deletePayroll = async (payrollId) => {
    if (
      window.confirm(
        "Apakah Anda yakin ingin menghapus data payroll ini? Aksi ini tidak bisa dibatalkan."
      )
    ) {
      try {
        await payroll.delete(payrollId);
        refreshList();
        alert("✅ Data payroll berhasil dihapus.");
      } catch (e) {
        setError(e.message);
        alert("Gagal menghapus payroll: " + e.message);
      }
    }
  };

  // Calculate Auto Deduction
  const calculateAutoDeduction = useCallback(
    async (employeeId, periode) => {
      if (!employeeId || !periode) {
        setDeductionDetails({
          alpa: 0,
          terlambat: 0,
          izin: 0,
          sakit: 0,
          totalPotongan: 0,
          breakdown: [],
        });
        setForm((prev) => ({ ...prev, potongan: 0, alasan_potongan: "" }));
        return;
      }

      try {
        const allAttendance = await attendance.findAll();
        const allLeaves = await leave.findAll();

        const normalizedEmployeeId = String(employeeId).toLowerCase().trim();
        const [year, month] = periode.split("-");

        // Filter Absensi
        const employeeAttendance = allAttendance.filter((a) => {
          const attendanceEmployeeId = String(a.employee_id)
            .toLowerCase()
            .trim();
          if (attendanceEmployeeId !== normalizedEmployeeId) return false;

          const attendanceDate = new Date(a.tanggal);
          const attendanceYear = attendanceDate.getFullYear().toString();
          const attendanceMonth = String(
            attendanceDate.getMonth() + 1
          ).padStart(2, "0");

          return attendanceYear === year && attendanceMonth === month;
        });

        // Hitung ALPA
        const alpaCount = employeeAttendance.filter(
          (a) => a.status === "alpa"
        ).length;
        const potonganAlpa = alpaCount * POTONGAN_ALPA;

        // Hitung TERLAMBAT
        const lateRecords = employeeAttendance.filter((a) => {
          if (!a.jam_masuk || a.status !== "hadir") return false;
          const timeParts = a.jam_masuk.split(":");
          const hour = Number(timeParts[0]);
          const minute = Number(timeParts[1]);
          return hour > 8 || (hour === 8 && minute > 0);
        });
        const lateCount = lateRecords.length;
        const potonganTerlambat = lateCount * POTONGAN_TERLAMBAT;

        // Hitung Izin & Sakit dari absensi
        let izinCount = employeeAttendance.filter(
          (a) => a.status === "izin"
        ).length;
        let sakitCount = employeeAttendance.filter(
          (a) => a.status === "sakit"
        ).length;

        // Tambahkan dari Leave/Cuti yang approved
        const employeeLeaves = allLeaves.filter((l) => {
          if (!l.employee_id) return false;
          const leaveEmployeeId = String(l.employee_id).toLowerCase().trim();
          if (leaveEmployeeId !== normalizedEmployeeId) return false;
          if (l.status !== "approved") return false;

          const dateField =
            l.tanggal_mulai || l.tanggal_pengajuan || l.start_date;
          if (!dateField) return false;

          const isoDateField = dateField + "T00:00:00.000Z";
          const startDate = new Date(isoDateField);

          const startYear = startDate.getUTCFullYear().toString();
          const startMonth = String(startDate.getUTCMonth() + 1).padStart(
            2,
            "0"
          );

          return startYear === year && startMonth === month;
        });

        // Hitung durasi cuti
        employeeLeaves.forEach((lv) => {
          const startDate = new Date(lv.tanggal_mulai + "T00:00:00.000Z");
          const endDate = new Date(lv.tanggal_selesai + "T00:00:00.000Z");

          const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
          const oneDay = 1000 * 60 * 60 * 24;
          const diffDays = Math.round(diffTime / oneDay) + 1;

          const jenisField =
            lv.jenis_pengajuan || lv.jenis_cuti || lv.jenis || "";
          const jenisLower = String(jenisField).toLowerCase();

          if (jenisLower.includes("izin") || jenisLower.includes("cuti")) {
            izinCount += diffDays;
          } else if (jenisLower.includes("sakit")) {
            sakitCount += diffDays;
          } else {
            izinCount += diffDays;
          }
        });

        // Hitung Total Potongan
        const potonganIzin = izinCount * POTONGAN_IZIN;
        const potonganSakit = sakitCount * POTONGAN_SAKIT;

        const totalPotongan =
          potonganAlpa + potonganTerlambat + potonganIzin + potonganSakit;

        // Buat Breakdown & Alasan
        const breakdown = [];
        const reasons = [];

        if (alpaCount > 0) {
          breakdown.push({
            type: "Alpa",
            count: alpaCount,
            amount: potonganAlpa,
            icon: "❌",
          });
          reasons.push(`${alpaCount}x Alpa (${formatRupiah(potonganAlpa)})`);
        }
        if (lateCount > 0) {
          breakdown.push({
            type: "Terlambat",
            count: lateCount,
            amount: potonganTerlambat,
            icon: "⏰",
          });
          reasons.push(
            `${lateCount}x Terlambat (${formatRupiah(potonganTerlambat)})`
          );
        }
        if (izinCount > 0) {
          breakdown.push({
            type: "Izin/Cuti",
            count: izinCount,
            amount: potonganIzin,
            icon: "📝",
          });
          reasons.push(
            `${izinCount}x Izin/Cuti (${formatRupiah(potonganIzin)})`
          );
        }
        if (sakitCount > 0) {
          breakdown.push({
            type: "Sakit",
            count: sakitCount,
            amount: potonganSakit,
            icon: "🏥",
          });
          reasons.push(`${sakitCount}x Sakit (Tidak ada potongan)`);
        }

        const alasanPotongan =
          reasons.length > 0 ? reasons.join(" | ") : "Tidak ada potongan";

        // Update State
        const details = {
          alpa: alpaCount,
          terlambat: lateCount,
          izin: izinCount,
          sakit: sakitCount,
          totalPotongan: totalPotongan,
          breakdown: breakdown,
        };

        setDeductionDetails(details);
        setForm((prev) => ({
          ...prev,
          potongan: totalPotongan,
          alasan_potongan: alasanPotongan,
        }));
      } catch (e) {
        setError("Gagal menghitung potongan: " + e.message);
        console.error("Deduction calc error:", e);
      }
    },
    [formatRupiah]
  );

  // Load Data Awal
  useEffect(() => {
    refreshList();
  }, [refreshList]);

  // Handler ketika karyawan atau periode berubah
  const handleEmployeeOrPeriodChange = (field, value) => {
    let employeeIdToCalculate = form.employee_id;
    let periodeToCalculate = form.periode;

    const updatedForm = { ...form, [field]: value };

    if (field === "employee_id") {
      employeeIdToCalculate = value;
      const selectedEmployee = employeesData.find(
        (e) => e.employee_id === value
      );

      updatedForm.gaji_pokok = selectedEmployee?.gaji_pokok || 5000000;
      updatedForm.tunjangan = 0;
      updatedForm.potongan = 0;
      updatedForm.alasan_potongan = "";

      setDeductionDetails({
        alpa: 0,
        terlambat: 0,
        izin: 0,
        sakit: 0,
        totalPotongan: 0,
        breakdown: [],
      });
    } else if (field === "periode") {
      periodeToCalculate = value;
    }

    setForm(updatedForm);

    if (employeeIdToCalculate && periodeToCalculate) {
      calculateAutoDeduction(employeeIdToCalculate, periodeToCalculate);
    }
  };

  const calcTotal = () =>
    (Number(form.gaji_pokok) || 0) +
    (Number(form.tunjangan) || 0) -
    (Number(form.potongan) || 0);

  const submit = async (e) => {
    e.preventDefault();

    if (!form.employee_id) {
      alert("Silakan pilih karyawan terlebih dahulu");
      return;
    }
    if (Number(form.gaji_pokok) <= 0) {
      alert("Gaji Pokok harus diisi dan lebih dari 0");
      return;
    }

    try {
      const employeeData = employeesData.find(
        (e) => e.employee_id === form.employee_id
      );
      const employeeRole =
        employeeData?.jabatan || employeeData?.role || "Karyawan";

      await payroll.create({
        ...form,
        employee_role: employeeRole,
        total_gaji: calcTotal(),
        alasan_potongan: form.alasan_potongan || "Tidak ada potongan",
      });

      refreshList();

      setForm({
        employee_id: "",
        periode: new Date().toISOString().slice(0, 7),
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
        breakdown: [],
      });
      alert("✅ Data payroll berhasil disimpan!");
    } catch (e) {
      setError(e.message);
      alert("Gagal menyimpan payroll: " + e.message);
    }
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
    a.download = "payroll.csv";
    a.click();
  };

  if (loading) return <div style={styles.mainContainer}>Memuat data...</div>;
  if (error) return <div style={styles.mainContainer}>Error: {error}</div>;

  return (
    <div style={styles.mainContainer}>
      {/* Header Halaman */}
      <div style={styles.header}>
        <h1 style={styles.title}>💼 Payroll Management</h1>
        <button style={styles.btn} onClick={exportCSV}>
          📊 Export CSV
        </button>
      </div>

      {/* Real-time Info Box */}
      <div style={styles.realtimeBox}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "0.5rem",
          }}
        >
          <span style={{ fontSize: "1.5rem" }}>⚡</span>
          <strong style={{ fontSize: "1.1rem" }}>
            Sistem Potongan Otomatis Real-time
          </strong>
        </div>
        <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.9 }}>
          Potongan gaji akan dihitung otomatis berdasarkan data absensi dan cuti
          karyawan
        </p>
      </div>

      {/* Form Input Gaji */}
      <form style={{ ...styles.card, ...styles.formGrid }} onSubmit={submit}>
        {/* Karyawan */}
        <div style={styles.formElement}>
          <label style={styles.label}>Karyawan *</label>
          <select
            style={styles.inputField}
            value={form.employee_id}
            onChange={(e) =>
              handleEmployeeOrPeriodChange("employee_id", e.target.value)
            }
            required
          >
            <option value="">- Pilih Karyawan -</option>
            {employeesData.map((e) => (
              <option key={e.employee_id} value={e.employee_id}>
                {e.nama_lengkap}
              </option>
            ))}
          </select>
        </div>

        {/* Periode */}
        <div style={styles.formElement}>
          <label style={styles.label}>Periode *</label>
          <input
            type="month"
            style={styles.inputField}
            value={form.periode}
            onChange={(e) =>
              handleEmployeeOrPeriodChange("periode", e.target.value)
            }
            required
          />
        </div>

        {/* Gaji Pokok */}
        <div style={styles.formElement}>
          <label style={styles.label}>Gaji Pokok (Rp) *</label>
          <input
            type="number"
            style={styles.inputField}
            value={form.gaji_pokok}
            onChange={(e) => setForm({ ...form, gaji_pokok: e.target.value })}
            required
            min="0"
          />
        </div>

        {/* Tunjangan */}
        <div style={styles.formElement}>
          <label style={styles.label}>Tunjangan (Rp)</label>
          <input
            type="number"
            style={styles.inputField}
            value={form.tunjangan}
            onChange={(e) => setForm({ ...form, tunjangan: e.target.value })}
            min="0"
          />
        </div>

        {/* Potongan (Auto) */}
        <div style={styles.formElement}>
          <label style={styles.label}>Potongan (Auto) 🤖</label>
          <input
            type="number"
            style={{ ...styles.inputField, ...styles.inputReadOnly }}
            value={form.potongan}
            readOnly
          />
        </div>

        {/* Total Gaji */}
        <div style={styles.formElement}>
          <label style={styles.label}>Total Gaji Bersih (Rp)</label>
          <input
            type="text"
            style={{ ...styles.inputField, ...styles.inputReadOnly }}
            value={formatRupiah(calcTotal())}
            readOnly
          />
        </div>

        {/* Detail Potongan Real-time */}
        {deductionDetails.breakdown.length > 0 && (
          <div style={{ gridColumn: "1 / -1", ...styles.deductionCard }}>
            <h4 style={{ margin: "0 0 1rem 0", color: "#FF6347" }}>
              📋 Detail Potongan Otomatis
            </h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "1rem",
              }}
            >
              {deductionDetails.breakdown.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "rgba(255, 255, 255, 0.1)",
                    padding: "1rem",
                    borderRadius: "8px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "2rem",
                      marginBottom: "0.5rem",
                      textAlign: "center",
                    }}
                  >
                    {item.icon}
                  </div>
                  <div
                    style={{
                      fontSize: "0.9rem",
                      color: "rgba(255, 255, 255, 0.8)",
                      marginBottom: "0.3rem",
                    }}
                  >
                    {item.type}
                  </div>
                  <div
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: "bold",
                      color: "#fff",
                    }}
                  >
                    {item.count}x = {formatRupiah(item.amount)}
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: "1rem",
                paddingTop: "1rem",
                borderTop: "2px solid rgba(255, 255, 255, 0.2)",
                fontSize: "1.2rem",
                fontWeight: "bold",
                textAlign: "right",
              }}
            >
              Total Potongan: {formatRupiah(deductionDetails.totalPotongan)}
            </div>
          </div>
        )}

        {/* Alasan Potongan (Auto) */}
        <div style={{ gridColumn: "1 / -1", ...styles.formElement }}>
          <label style={styles.label}>Alasan Potongan (Otomatis) 📝</label>
          <textarea
            style={{
              ...styles.inputField,
              minHeight: "80px",
              resize: "vertical",
            }}
            value={form.alasan_potongan}
            readOnly
            placeholder="Alasan potongan akan terisi otomatis..."
          />
        </div>

        {/* Tombol Simpan */}
        <div style={{ gridColumn: "1 / -1", display: "flex", gap: "1rem" }}>
          <button style={styles.btnSimpan} type="submit">
            ✅ Simpan Payroll
          </button>
        </div>
      </form>

      {/* Info Box Tarif */}
      <div style={styles.infoBox}>
        <h4 style={{ marginTop: 0, color: "#fff" }}>
          📌 Informasi Tarif Potongan
        </h4>
        <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
          <li>Alpa: {formatRupiah(POTONGAN_ALPA)} per hari</li>
          <li>Terlambat: {formatRupiah(POTONGAN_TERLAMBAT)} per kejadian</li>
          <li>Izin/Cuti: {formatRupiah(POTONGAN_IZIN)} per hari</li>
          <li>Sakit: Tidak ada potongan</li>
        </ul>
      </div>

      {/* Tabel Riwayat Payroll */}
      <div style={{ ...styles.card, padding: "0", overflow: "auto" }}>
        <table style={styles.table}>
          <thead style={styles.tableHeader}>
            <tr>
              <th style={styles.th}>Periode</th>
              <th style={styles.th}>Nama</th>
              <th style={styles.th}>Role</th>
              <th style={styles.th}>Gaji Pokok</th>
              <th style={styles.th}>Tunjangan</th>
              <th style={styles.th}>Potongan</th>
              <th style={styles.th}>Alasan</th>
              <th style={styles.th}>Gaji Bersih</th>
              <th style={styles.th}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => {
              const emp = employeesData.find(
                (e) => e.employee_id === p.employee_id
              );
              const displayRole =
                emp?.jabatan || emp?.role || p.employee_role || "-";

              return (
                <tr
                  key={p.payroll_id}
                  style={{ borderBottom: "1px solid #3A4068" }}
                >
                  <td style={styles.td}>{p.periode}</td>
                  <td style={styles.td}>
                    {emp?.nama_lengkap || p.employee_id}
                  </td>
                  <td style={styles.td}>{displayRole}</td>
                  <td style={styles.td}>{formatRupiah(p.gaji_pokok)}</td>
                  <td style={styles.td}>{formatRupiah(p.tunjangan)}</td>
                  <td
                    style={{
                      ...styles.td,
                      color: p.potongan > 0 ? "#FF6347" : "inherit",
                      fontWeight: "600",
                    }}
                  >
                    {formatRupiah(p.potongan)}
                  </td>
                  <td
                    style={{
                      ...styles.td,
                      fontSize: "0.8rem",
                      color: "rgba(255, 255, 255, 0.6)",
                      maxWidth: "300px",
                    }}
                  >
                    {p.alasan_potongan || "-"}
                  </td>
                  <td style={styles.td}>
                    <strong style={{ color: "#90EE90", fontSize: "1.05rem" }}>
                      {formatRupiah(p.total_gaji)}
                    </strong>
                  </td>
                  <td style={styles.td}>
                    <button
                      style={styles.btnDelete}
                      onClick={() => deletePayroll(p.payroll_id)}
                      title="Hapus data payroll"
                    >
                      🗑️ Hapus
                    </button>
                  </td>
                </tr>
              );
            })}
            {list.length === 0 && (
              <tr>
                <td
                  colSpan="9"
                  style={{
                    ...styles.td,
                    textAlign: "center",
                    padding: "2rem",
                    color: "rgba(255, 255, 255, 0.5)",
                  }}
                >
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
                    🔭
                  </div>
                  <em>Belum ada data payroll</em>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
