import { useCallback, useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const allowedRoles = ["Admin", "HR"];

  const getBulanSekarang = () => {
    const date = new Date();
    return new Intl.DateTimeFormat("id-ID", {
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const bulanSekarang = getBulanSekarang();

  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(number) || 0);
  };

  // Warna untuk charts
  const COLORS = {
    excellent: "#4CAF50",
    good: "#8BC34A",
    average: "#FFC107",
    poor: "#F44336",
  };

  const fetchStatsData = useCallback(async () => {
    if (!allowedRoles.includes(user?.role)) return;

    setLoading(true);
    setError(null);
    try {
      // Fetch dashboard stats
      const allStats = await stats.getDashboard();
      if (allStats && typeof allStats === "object") {
        setStats({
          emp: allStats.emp || 0,
          hadir: allStats.hadir || 0,
          izin: allStats.izin || 0,
          cutiPending: allStats.cutiPending || 0,
          gajiBulanIni: allStats.gajiBulanIni || 0,
        });
      }

      // Fetch performance stats untuk grafik
      const perfStats = await stats.getPerformance();
      setPerformanceData(perfStats);
    } catch (e) {
      console.error("Dashboard Fetch Error:", e);
      setStats({
        emp: 0,
        hadir: 0,
        izin: 0,
        cutiPending: 0,
        gajiBulanIni: 0,
      });
      setError(
        e.message ||
          "Gagal memuat data dashboard. Backend mungkin belum berjalan."
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (allowedRoles.includes(user?.role)) {
      fetchStatsData();
    }
  }, [user, fetchStatsData]);

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

  if (loading) {
    return (
      <div style={{ padding: "2rem", color: "white", textAlign: "center" }}>
        <h1 style={{ fontSize: "2.2rem" }}>Dashboard</h1>
        <div
          style={{
            padding: "2rem",
            backgroundColor: "#2C3150",
            borderRadius: "12px",
            marginTop: "1rem",
          }}
        >
          Memuat data statistik dari backend...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "2rem", color: "white" }}>
        <h1 style={{ fontSize: "2.2rem", fontWeight: "700", color: "#FF6347" }}>
          Dashboard Error
        </h1>
        <div
          style={{
            padding: "1.5rem",
            backgroundColor: "#4A2A2A",
            border: "1px solid #FF6347",
            borderRadius: "12px",
          }}
        >
          <p style={{ color: "white" }}>Gagal memuat data: {error}</p>
          <small style={{ color: "#ccc", fontSize: "0.9rem" }}>
            Pastikan backend berjalan di port 5000 dan Anda login dengan benar.
          </small>
        </div>
      </div>
    );
  }

  // Prepare data untuk Pie Chart
  const pieData = performanceData?.distribution
    ? [
        {
          name: "Excellent (≥90)",
          value: performanceData.distribution.excellent,
          color: COLORS.excellent,
        },
        {
          name: "Good (75-89)",
          value: performanceData.distribution.good,
          color: COLORS.good,
        },
        {
          name: "Average (60-74)",
          value: performanceData.distribution.average,
          color: COLORS.average,
        },
        {
          name: "Poor (<60)",
          value: performanceData.distribution.poor,
          color: COLORS.poor,
        },
      ]
    : [];

  return (
    <div
      style={{
        padding: "2.5rem 2rem",
        maxWidth: "1400px",
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: "700",
            color: "#fff",
            marginBottom: "0.5rem",
          }}
        >
          Dashboard
        </h1>
        <p
          style={{
            fontSize: "0.95rem",
            color: "rgba(255, 255, 255, 0.6)",
            margin: 0,
          }}
        >
          Overview dan statistik sistem manajemen karyawan
        </p>
      </div>

      {/* Grid pertama: 3 kolom dengan ukuran proporsional */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.5fr 1fr",
          gap: "1.5rem",
          marginBottom: "1.5rem",
        }}
      >
        {/* Total Karyawan */}
        <div
          style={{
            backgroundColor: "#2C3150",
            borderRadius: "16px",
            padding: "1.8rem",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
          }}
        >
          <h3
            style={{
              fontSize: "0.95rem",
              fontWeight: "500",
              marginBottom: "1.2rem",
              color: "rgba(255, 255, 255, 0.7)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Total Karyawan
          </h3>
          <h1
            style={{
              fontSize: "3rem",
              fontWeight: "bold",
              color: "#fff",
              lineHeight: 1,
              marginBottom: "0.5rem",
            }}
          >
            {statsData.emp}
          </h1>
          <small
            style={{
              fontSize: "0.85rem",
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
            borderRadius: "16px",
            padding: "1.8rem",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
          }}
        >
          <h3
            style={{
              fontSize: "0.95rem",
              fontWeight: "500",
              marginBottom: "1.2rem",
              color: "rgba(255, 255, 255, 0.7)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Absensi Hari Ini
          </h3>
          <div style={{ display: "flex", gap: "1rem" }}>
            <div
              style={{
                flex: 1,
                backgroundColor: "rgba(144, 238, 144, 0.15)",
                border: "1px solid rgba(144, 238, 144, 0.3)",
                borderRadius: "12px",
                padding: "1.2rem",
                textAlign: "center",
              }}
            >
              <h2
                style={{
                  fontSize: "2rem",
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
                  color: "rgba(144, 238, 144, 0.9)",
                  fontWeight: "500",
                }}
              >
                Hadir
              </small>
            </div>
            <div
              style={{
                flex: 1,
                backgroundColor: "rgba(255, 215, 0, 0.15)",
                border: "1px solid rgba(255, 215, 0, 0.3)",
                borderRadius: "12px",
                padding: "1.2rem",
                textAlign: "center",
              }}
            >
              <h2
                style={{
                  fontSize: "2rem",
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
                  color: "rgba(255, 215, 0, 0.9)",
                  fontWeight: "500",
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
            borderRadius: "16px",
            padding: "1.8rem",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
          }}
        >
          <h3
            style={{
              fontSize: "0.95rem",
              fontWeight: "500",
              marginBottom: "1.2rem",
              color: "rgba(255, 255, 255, 0.7)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Cuti Pending
          </h3>
          <h1
            style={{
              fontSize: "3rem",
              fontWeight: "bold",
              color: "#FF6347",
              lineHeight: 1,
              marginBottom: "0.5rem",
            }}
          >
            {statsData.cutiPending}
          </h1>
          <small
            style={{
              fontSize: "0.85rem",
              color: "rgba(255, 99, 71, 0.7)",
            }}
          >
            menunggu approval
          </small>
        </div>
      </div>

      {/* Payroll - Full Width dengan design lebih menarik */}
      <div
        style={{
          backgroundColor: "linear-gradient(135deg, #2C3150 0%, #3A4068 100%)",
          borderRadius: "16px",
          padding: "2rem 2.5rem",
          marginBottom: "2.5rem",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)",
          border: "1px solid rgba(76, 175, 80, 0.2)",
          background:
            "linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(44, 49, 80, 0.9) 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h3
              style={{
                fontSize: "0.95rem",
                fontWeight: "500",
                marginBottom: "1rem",
                color: "rgba(255, 255, 255, 0.7)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Payroll Bulan {bulanSekarang.split(" ")[0]}
            </h3>
            <h1
              style={{
                fontSize: "2.5rem",
                fontWeight: "bold",
                color: "#4CAF50",
                lineHeight: 1.2,
                marginBottom: "0.5rem",
              }}
            >
              {formatRupiah(statsData.gajiBulanIni)}
            </h1>
            <small
              style={{
                fontSize: "0.9rem",
                color: "rgba(76, 175, 80, 0.8)",
              }}
            >
              Total gaji terhitung
            </small>
          </div>
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "12px",
              backgroundColor: "rgba(76, 175, 80, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2rem",
            }}
          >
            💰
          </div>
        </div>
      </div>

      {/* Section Grafik Talenta */}
      {performanceData && (
        <>
          <div
            style={{
              marginBottom: "1.5rem",
              paddingBottom: "1rem",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: "700",
                color: "#fff",
                marginBottom: "0.3rem",
              }}
            >
              📊 Rekap Manajemen Talenta
            </h2>
            <p
              style={{
                fontSize: "0.9rem",
                color: "rgba(255, 255, 255, 0.6)",
                margin: 0,
              }}
            >
              Analisis performa dan distribusi nilai karyawan
            </p>
          </div>

          {/* Charts Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "1.5rem",
            }}
          >
            {/* Distribusi Nilai Kinerja - Pie Chart */}
            <div
              style={{
                backgroundColor: "#2C3150",
                borderRadius: "16px",
                padding: "2rem",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)",
                border: "1px solid rgba(255, 255, 255, 0.05)",
              }}
            >
              <h3
                style={{
                  fontSize: "1.05rem",
                  fontWeight: "600",
                  marginBottom: "1.5rem",
                  color: "#fff",
                }}
              >
                Distribusi Nilai Kinerja
              </h3>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1d35",
                      border: "1px solid #3A4068",
                      borderRadius: "8px",
                      color: "#fff",
                      fontWeight: "500",
                    }}
                    itemStyle={{
                      // ← BARU DITAMBAHKAN
                      color: "#fff",
                      fontWeight: "600",
                    }}
                    labelStyle={{
                      // ← BARU DITAMBAHKAN
                      color: "#fff",
                      fontWeight: "600",
                      fontSize: "14px",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    wrapperStyle={{
                      paddingTop: "10px",
                      fontSize: "13px",
                      color: "#fff",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Rata-rata Nilai per Role - Bar Chart */}
            <div
              style={{
                backgroundColor: "#2C3150",
                borderRadius: "16px",
                padding: "2rem",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)",
                border: "1px solid rgba(255, 255, 255, 0.05)",
              }}
            >
              <h3
                style={{
                  fontSize: "1.05rem",
                  fontWeight: "600",
                  marginBottom: "1.5rem",
                  color: "#fff",
                }}
              >
                Rata-rata Nilai per Role
              </h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={performanceData.byRole}
                  margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(243, 8, 8, 0.1)"
                  />
                  <XAxis
                    dataKey="role"
                    stroke="rgba(255,255,255,0.7)"
                    style={{ fontSize: "13px" }}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.7)"
                    style={{ fontSize: "13px" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1d35",
                      border: "1px solid #3A4068",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                    cursor={{ fill: "rgba(255,255,255,0.05)" }}
                  />
                  <Bar
                    dataKey="average"
                    fill="#8BC34A"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={80}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
