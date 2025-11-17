import { useCallback, useEffect, useState } from "react";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper untuk memformat Rupiah
  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(number) || 0);
  };

  // Fungsi fetch asynchronous
  const fetchStatsData = useCallback(async () => {
    if (user?.role !== "Admin" && user?.role !== "HR") return;

    setLoading(true);
    setError(null);
    try {
      const allStats = await stats.getDashboard();
      setStats(allStats);
    } catch (e) {
      setError(e.message || "Gagal memuat data dashboard.");
      console.error("Dashboard Fetch Error:", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === "Admin" || user?.role === "HR") {
      fetchStatsData();
    }
  }, [user, fetchStatsData]);

  if (user?.role !== "Admin" && user?.role !== "HR") {
    return <h1 style={{ color: "white", padding: "2rem" }}>Access Denied</h1>;
  }

  if (loading) {
    return (
      <div style={{ padding: "2rem", color: "white", textAlign: "center" }}>
        <h1>Dashboard</h1>
        <p style={{ color: "#ccc" }}>Memuat data statistik dari backend...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "2rem", color: "white" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "red" }}>
          Dashboard Error
        </h1>
        <p style={{ color: "red" }}>Gagal memuat data: {error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1
        style={{
          fontSize: "2.5rem",
          fontWeight: "bold",
          marginBottom: "2rem",
          color: "#fff",
        }}
      >
        Dashboard {user.role}
      </h1>

      {/* Grid pertama: 3 kolom */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1.5rem",
          marginBottom: "1.5rem",
        }}
      >
        {/* Total Karyawan */}
        <div
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "12px",
            padding: "2rem",
          }}
        >
          <h3
            style={{
              fontSize: "1.25rem",
              fontWeight: "600",
              marginBottom: "1.5rem",
              color: "#fff",
            }}
          >
            Total Karyawan
          </h3>
          <h1
            style={{
              fontSize: "3.5rem",
              fontWeight: "bold",
              marginBottom: "0.5rem",
              color: "#fff",
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
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "12px",
            padding: "2rem",
          }}
        >
          <h3
            style={{
              fontSize: "1.25rem",
              fontWeight: "600",
              marginBottom: "1.5rem",
              color: "#fff",
            }}
          >
            Absensi Hari Ini
          </h3>
          <div style={{ display: "flex", gap: "1rem" }}>
            <div
              style={{
                flex: 1,
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "8px",
                padding: "1.5rem",
                textAlign: "center",
              }}
            >
              <h2
                style={{
                  fontSize: "2.5rem",
                  fontWeight: "bold",
                  marginBottom: "0.5rem",
                  color: "#fff",
                }}
              >
                {statsData.hadir}
              </h2>
              <small
                style={{
                  fontSize: "0.85rem",
                  color: "rgba(255, 255, 255, 0.5)",
                }}
              >
                Hadir
              </small>
            </div>
            <div
              style={{
                flex: 1,
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "8px",
                padding: "1.5rem",
                textAlign: "center",
              }}
            >
              <h2
                style={{
                  fontSize: "2.5rem",
                  fontWeight: "bold",
                  marginBottom: "0.5rem",
                  color: "#fff",
                }}
              >
                {statsData.izin}
              </h2>
              <small
                style={{
                  fontSize: "0.85rem",
                  color: "rgba(255, 255, 255, 0.5)",
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
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "12px",
            padding: "2rem",
          }}
        >
          <h3
            style={{
              fontSize: "1.25rem",
              fontWeight: "600",
              marginBottom: "1.5rem",
              color: "#fff",
            }}
          >
            Cuti Pending
          </h3>
          <h1
            style={{
              fontSize: "3.5rem",
              fontWeight: "bold",
              marginBottom: "0.5rem",
              color: "#fff",
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

      {/* Grid kedua: 2 kolom */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "1.5rem",
        }}
      >
        {/* Payroll Bulan Ini */}
        <div
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "12px",
            padding: "2rem",
          }}
        >
          <h3
            style={{
              fontSize: "1.25rem",
              fontWeight: "600",
              marginBottom: "1.5rem",
              color: "#fff",
            }}
          >
            Payroll Bulan Ini
          </h3>
          <h1
            style={{
              fontSize: "3rem",
              fontWeight: "bold",
              marginBottom: "0.5rem",
              color: "#fff",
            }}
          >
            Rp {statsData.gajiBulanIni.toLocaleString("id-ID")}
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
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "12px",
            padding: "2rem",
          }}
        >
          <h3
            style={{
              fontSize: "1.25rem",
              fontWeight: "600",
              marginBottom: "1rem",
              color: "#fff",
            }}
          >
            Tips
          </h3>
          <p
            style={{
              fontSize: "0.95rem",
              lineHeight: "1.6",
              color: "rgba(255, 255, 255, 0.7)",
            }}
          >
            Semua data ini berasal dari mock API{" "}
            <code
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                padding: "0.2rem 0.4rem",
                borderRadius: "4px",
                fontSize: "0.9rem",
              }}
            >
              localStorage
            </code>
            . Nanti sambungkan ke backend cukup di{" "}
            <strong style={{ color: "#fff" }}>services/api.js</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
