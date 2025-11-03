import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { stats } from "../services/api";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [statsData, setStats] = useState({
    emp: 0,
    hadir: 0,
    izin: 0,
    cutiPending: 0,
    gajiBulanIni: 0,
  });

  // ⭐ PERUBAHAN DI SINI: Hanya Admin yang diizinkan melihat AdminDashboard
  const allowedRoles = ["Admin"];

  // Mendapatkan nama bulan saat ini dalam Bahasa Indonesia
  const getBulanSekarang = () => {
    // Asumsi: Kita menggunakan tanggal sistem Anda, atau tanggal referensi 2025-11
    const date = new Date();
    // Jika Anda ingin mengunci ke 'November 2025' seperti di context, gunakan:
    // const date = new Date('2025-11-01');

    return new Intl.DateTimeFormat("id-ID", {
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const bulanSekarang = getBulanSekarang();

  useEffect(() => {
    if (allowedRoles.includes(user?.role)) {
      // Catatan: Pastikan fungsi stats() di services/api.js
      // sudah diperbarui untuk HANYA menghitung gaji pada bulan berjalan.
      const allStats = stats();
      setStats(allStats);
    }
  }, [user]);

  // Blokir akses jika BUKAN Admin
  if (!allowedRoles.includes(user?.role)) {
    return (
      <div style={{ padding: "3.5rem 2.5rem 2.5rem 2.5rem" }}>
        <h1 style={{ fontSize: "2.8rem", fontWeight: "700", color: "#fff" }}>
          Access Denied
        </h1>
        <p style={{ color: "rgba(255, 255, 255, 0.7)" }}>
          Anda tidak memiliki izin untuk melihat halaman ini.
        </p>
      </div>
    );
  }

  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  return (
    // Padding disesuaikan agar ringkas
    <div style={{ padding: "2rem 1.5rem 1.5rem 1.5rem" }}>
      <h1
        style={{
          fontSize: "2.2rem",
          fontWeight: "700",
          marginBottom: "1.5rem",
          color: "#fff",
        }}
      >
        Dashboard
      </h1>

      {/* Grid pertama: 3 kolom (Total Karyawan, Absensi, Cuti Pending) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1.2rem",
          marginBottom: "1.2rem",
        }}
      >
        {/* Total Karyawan */}
        <div
          style={{
            backgroundColor: "#2C3150",
            borderRadius: "12px",
            padding: "1.5rem",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
          }}
        >
          <h3
            style={{
              fontSize: "1.1rem",
              fontWeight: "500",
              marginBottom: "1rem",
              color: "rgba(255, 255, 255, 0.8)",
            }}
          >
            Total Karyawan
          </h3>
          <h1
            style={{
              fontSize: "3.5rem",
              fontWeight: "bold",
              color: "#fff",
              lineHeight: 1,
            }}
          >
            {statsData.emp}
          </h1>
          <small
            style={{
              fontSize: "0.9rem",
              color: "rgba(255, 255, 255, 0.5)",
            }}
          >
            employees
          </small>
        </div>

        {/* Absensi Hari Ini */}
        <div
          style={{
            backgroundColor: "#2C3150",
            borderRadius: "12px",
            padding: "1.5rem",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
          }}
        >
          <h3
            style={{
              fontSize: "1.1rem",
              fontWeight: "500",
              marginBottom: "1rem",
              color: "rgba(255, 255, 255, 0.8)",
            }}
          >
            Absensi Hari Ini
          </h3>
          <div style={{ display: "flex", gap: "0.8rem" }}>
            <div
              style={{
                flex: 1,
                backgroundColor: "#3A4068",
                borderRadius: "8px",
                padding: "1rem",
                textAlign: "center",
              }}
            >
              <h2
                style={{
                  fontSize: "2.2rem",
                  fontWeight: "bold",
                  marginBottom: "0.3rem",
                  color: "#90EE90",
                }}
              >
                {statsData.hadir}
              </h2>
              <small
                style={{
                  fontSize: "0.8rem",
                  color: "rgba(255, 255, 255, 0.6)",
                }}
              >
                Hadir
              </small>
            </div>
            <div
              style={{
                flex: 1,
                backgroundColor: "#3A4068",
                borderRadius: "8px",
                padding: "1rem",
                textAlign: "center",
              }}
            >
              <h2
                style={{
                  fontSize: "2.2rem",
                  fontWeight: "bold",
                  marginBottom: "0.3rem",
                  color: "#FFD700",
                }}
              >
                {statsData.izin}
              </h2>
              <small
                style={{
                  fontSize: "0.8rem",
                  color: "rgba(255, 255, 255, 0.6)",
                }}
              >
                Izin/Sakit/Alpa
              </small>
            </div>
          </div>
        </div>

        {/* Cuti Pending */}
        <div
          style={{
            backgroundColor: "#2C3150",
            borderRadius: "12px",
            padding: "1.5rem",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
          }}
        >
          <h3
            style={{
              fontSize: "1.1rem",
              fontWeight: "500",
              marginBottom: "1rem",
              color: "rgba(255, 255, 255, 0.8)",
            }}
          >
            Cuti Pending
          </h3>
          <h1
            style={{
              fontSize: "3.5rem",
              fontWeight: "bold",
              color: "#FF6347",
              lineHeight: 1,
            }}
          >
            {statsData.cutiPending}
          </h1>
          <small
            style={{
              fontSize: "0.9rem",
              color: "rgba(255, 255, 255, 0.5)",
            }}
          >
            menunggu approval
          </small>
        </div>
      </div>

      {/* Grid kedua: 2 kolom (Payroll & Tips) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "1.2rem",
        }}
      >
        {/* Payroll Bulan Ini */}
        <div
          style={{
            backgroundColor: "#2C3150",
            borderRadius: "12px",
            padding: "1.5rem",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
          }}
        >
          <h3
            style={{
              fontSize: "1.1rem",
              fontWeight: "500",
              marginBottom: "1rem",
              color: "rgba(255, 255, 255, 0.8)",
            }}
          >
            {/* ⭐ Perubahan di sini: Judul dinamis */}
            Payroll Bulan {bulanSekarang.split(" ")[0]}
          </h3>
          <h1
            style={{
              fontSize: "2.8rem",
              fontWeight: "bold",
              color: "#4CAF50",
              lineHeight: 1.2,
            }}
          >
            {formatRupiah(statsData.gajiBulanIni)}
          </h1>
          <small
            style={{
              fontSize: "0.9rem",
              color: "rgba(255, 255, 255, 0.5)",
            }}
          >
            total gaji terhitung
          </small>
        </div>

        {/* Tips */}
        <div
          style={{
            backgroundColor: "#2C3150",
            borderRadius: "12px",
            padding: "1.5rem",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
          }}
        >
          <h3
            style={{
              fontSize: "1.1rem",
              fontWeight: "500",
              marginBottom: "0.8rem",
              color: "rgba(255, 255, 255, 0.8)",
            }}
          >
            Tips
          </h3>
          <p
            style={{
              fontSize: "0.9rem",
              lineHeight: "1.5",
              color: "rgba(255, 255, 255, 0.7)",
            }}
          >
            Semua data ini berasal dari mock API{" "}
            <code
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                color: "#fff",
                padding: "0.2rem 0.4rem",
                borderRadius: "4px",
                fontSize: "0.85rem",
              }}
            >
              localStorage
            </code>
            . Nanti sambungkan ke backend cukup di{" "}
            <strong style={{ color: "#4B0082" }}>services/api.js</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
