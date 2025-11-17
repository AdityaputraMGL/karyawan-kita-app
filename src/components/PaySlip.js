import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const styles = {
  mainContainer: {
    padding: "2rem 1.5rem",
    color: "white",
  },
  header: {
    fontSize: "2.2rem",
    fontWeight: "700",
    marginBottom: "1.5rem",
  },
  card: {
    backgroundColor: "#2C3150",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
    padding: "2rem",
    marginBottom: "1.5rem",
  },
  formElement: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "1.5rem",
    maxWidth: "300px",
  },
  label: {
    fontSize: "0.9rem",
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: "0.5rem",
  },
  select: {
    padding: "0.6rem 0.8rem",
    borderRadius: "8px",
    border: "1px solid #3A4068",
    backgroundColor: "#3A4068",
    color: "white",
    fontSize: "0.9rem",
    appearance: "none",
  },
  slipContainer: {
    border: "1px solid #5C54A4",
    borderRadius: "10px",
    padding: "2rem",
    backgroundColor: "#ffffff",
    lineHeight: 1.6,
    color: "#333",
  },
  detailGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem 2rem",
  },
  totalRow: {
    marginTop: "1.5rem",
    paddingTop: "1rem",
    borderTop: "2px solid #5C54A4",
    display: "flex",
    justifyContent: "space-between",
    fontSize: "1.5rem",
    fontWeight: "bold",
  },
  buttonGroup: {
    display: "flex",
    gap: "1rem",
    marginTop: "1.5rem",
  },
  printButton: {
    backgroundColor: "#5C54A4",
    color: "#fff",
    padding: "0.8rem 1.5rem",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    border: "none",
    fontSize: "1rem",
  },
  downloadButton: {
    backgroundColor: "#667eea",
    color: "#fff",
    padding: "0.8rem 1.5rem",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    border: "none",
    fontSize: "1rem",
  },
  loadingOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    color: "white",
    fontSize: "1.2rem",
  },
};

export default function PaySlip() {
  const { user } = useAuth();
  const [allPayslips, setAllPayslips] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [slipData, setSlipData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(number) || 0);
  };

  const formatPeriod = (period) => {
    if (!period) return "";
    const [year, month] = period.split("-");
    const date = new Date(year, month - 1);
    return new Intl.DateTimeFormat("id-ID", {
      month: "long",
      year: "numeric",
    }).format(date);
  };

  useEffect(() => {
    const fetchPayslipData = async () => {
      setLoading(true);
      setError(null);

      if (!user) {
        setLoading(false);
        setError("User belum login.");
        return;
      }

      try {
        console.log("Current user:", user);

        // ✅ UBAH: Gunakan endpoint khusus untuk karyawan
        const token = localStorage.getItem("hr_userToken");
        const API_BASE_URL = "http://localhost:5000"; // Sesuaikan dengan URL backend Anda

        console.log("🔑 Token dari localStorage:", token ? "ADA" : "TIDAK ADA");

        if (!token) {
          throw new Error("Token tidak ditemukan. Silakan login kembali.");
        }

        // Endpoint berdasarkan role
        const endpoint =
          user.role === "Karyawan"
            ? `${API_BASE_URL}/api/payroll/my-slip` // ✅ Endpoint baru
            : `${API_BASE_URL}/api/payroll`;

        console.log("🔗 Fetching from:", endpoint);

        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log("📡 Response status:", response.status);

        if (!response.ok) {
          // Handle berbagai error response
          if (response.status === 403) {
            throw new Error("Anda tidak memiliki akses ke resource ini.");
          } else if (response.status === 401) {
            throw new Error("Sesi Anda telah habis. Silakan login kembali.");
          }
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const payrolls = await response.json();
        console.log("Fetched payrolls:", payrolls);

        // Filter dan sort payrolls
        const myPayslips = payrolls
          .filter((p) => Number(p.total_gaji) > 1000) // Filter gaji minimal
          .sort((a, b) => b.periode.localeCompare(a.periode)); // Sort terbaru dulu

        console.log("Filtered payslips:", myPayslips);

        setAllPayslips(myPayslips);

        if (myPayslips.length > 0) {
          setSelectedPeriod(myPayslips[0].periode);
          setSlipData(myPayslips[0]);
        } else {
          setError(
            "Belum ada data slip gaji untuk Anda. Data payroll belum diproses oleh Admin/HR."
          );
          setSlipData(null);
        }
      } catch (e) {
        console.error("Error fetching payslips:", e);
        setError(e.message || "Gagal memuat data slip gaji.");
        setAllPayslips([]);
        setSlipData(null);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchPayslipData();
    }
  }, [user]);

  const handlePeriodChange = (e) => {
    const period = e.target.value;
    setSelectedPeriod(period);
    const selectedSlip = allPayslips.find((p) => p.periode === period);
    setSlipData(selectedSlip || null);
  };

  const printSlip = () => {
    const content = document.getElementById("payslip-content").innerHTML;
    const printWindow = window.open("", "", "height=600,width=800");
    printWindow.document.write("<html><head><title>Slip Gaji</title>");
    printWindow.document.write(
      "<style>body { font-family: sans-serif; padding: 20px; color: #333; } .detail-row { display: flex; justify-content: space-between; border-bottom: 1px dashed #ccc; padding: 5px 0; } .total-row { border-top: 2px solid #000; padding-top: 10px; margin-top: 10px; font-size: 1.2em; font-weight: bold; }</style>"
    );
    printWindow.document.write("</head><body>");
    printWindow.document.write(content);
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.print();
  };

  const downloadPDF = async () => {
    if (!slipData) return;

    setIsGenerating(true);

    try {
      const element = document.getElementById("payslip-content");

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

      const filename = `Slip_Gaji_${user?.username}_${formatPeriod(
        slipData.periode
      ).replace(/\s+/g, "_")}.pdf`;

      pdf.save(filename);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Gagal membuat PDF. Silakan coba lagi.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.mainContainer}>
        <h1 style={styles.header}>Slip Gaji Karyawan</h1>
        <div style={{ ...styles.card, textAlign: "center", color: "#ccc" }}>
          Memuat data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.mainContainer}>
        <h1 style={styles.header}>Slip Gaji Karyawan</h1>
        <div style={{ ...styles.card, textAlign: "center" }}>
          <p
            style={{
              color: "#FF6347",
              fontSize: "1.1rem",
              marginBottom: "1rem",
            }}
          >
            ⚠️ {error}
          </p>
          <p style={{ color: "#999", fontSize: "0.9rem" }}>
            Silakan hubungi Admin/HR untuk informasi lebih lanjut.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.mainContainer}>
      <h1 style={styles.header}>Slip Gaji Karyawan</h1>

      <div style={styles.card}>
        <div style={styles.formElement}>
          <label style={styles.label}>Pilih Periode Gaji</label>
          <select
            style={styles.select}
            value={selectedPeriod}
            onChange={handlePeriodChange}
            disabled={allPayslips.length === 0}
          >
            {allPayslips.length === 0 ? (
              <option value="">-- Belum ada data gaji --</option>
            ) : (
              allPayslips.map((p) => (
                <option key={p.payroll_id} value={p.periode}>
                  {formatPeriod(p.periode)}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {slipData ? (
        <div style={styles.card}>
          <div id="payslip-content" style={styles.slipContainer}>
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <h2 style={{ color: "#5C54A4", margin: 0, fontSize: "2rem" }}>
                SLIP GAJI
              </h2>
              <p
                style={{ color: "#666", margin: "0.5rem 0", fontSize: "1rem" }}
              >
                Periode: {formatPeriod(slipData.periode)}
              </p>
              <p
                style={{
                  color: "#999",
                  margin: "0.3rem 0",
                  fontSize: "0.9rem",
                }}
              >
                PT. Karyawan Kita Indonesia
              </p>
            </div>

            <div
              style={{
                marginBottom: "2rem",
                borderBottom: "2px solid #e0e0e0",
                paddingBottom: "1rem",
              }}
            >
              <div style={styles.detailGrid}>
                <p style={{ color: "#666", margin: "0.3rem 0" }}>
                  Nama Karyawan:
                </p>
                <p
                  style={{
                    fontWeight: "bold",
                    margin: "0.3rem 0",
                    color: "#333",
                  }}
                >
                  {slipData.employee?.nama_lengkap || user?.username}
                </p>
                <p style={{ color: "#666", margin: "0.3rem 0" }}>
                  Role/Jabatan:
                </p>
                <p style={{ margin: "0.3rem 0", color: "#333" }}>
                  {slipData.employee?.jabatan ||
                    slipData.employee_role ||
                    user?.role}
                </p>
                <p style={{ color: "#666", margin: "0.3rem 0" }}>
                  ID Karyawan:
                </p>
                <p style={{ margin: "0.3rem 0", color: "#333" }}>
                  {slipData.employee_id}
                </p>
              </div>
            </div>

            <h3
              style={{
                borderBottom: "2px solid #4CAF50",
                paddingBottom: "0.5rem",
                marginTop: "1.5rem",
                marginBottom: "1rem",
                color: "#4CAF50",
                fontSize: "1.2rem",
              }}
            >
              Penerimaan
            </h3>

            <div style={styles.detailGrid}>
              <p style={{ margin: "0.3rem 0", color: "#333" }}>Gaji Pokok:</p>
              <p
                style={{
                  textAlign: "right",
                  margin: "0.3rem 0",
                  color: "#333",
                  fontWeight: "600",
                }}
              >
                {formatRupiah(slipData.gaji_pokok)}
              </p>
              <p style={{ margin: "0.3rem 0", color: "#333" }}>
                Tunjangan Lain:
              </p>
              <p
                style={{
                  textAlign: "right",
                  margin: "0.3rem 0",
                  color: "#333",
                  fontWeight: "600",
                }}
              >
                {formatRupiah(slipData.tunjangan)}
              </p>
            </div>

            <h3
              style={{
                borderBottom: "2px solid #f44336",
                paddingBottom: "0.5rem",
                marginTop: "1.5rem",
                marginBottom: "1rem",
                color: "#f44336",
                fontSize: "1.2rem",
              }}
            >
              Potongan
            </h3>

            <div style={styles.detailGrid}>
              <p style={{ margin: "0.3rem 0", color: "#333" }}>
                Total Potongan:
              </p>
              <p
                style={{
                  textAlign: "right",
                  color: "#f44336",
                  margin: "0.3rem 0",
                  fontWeight: "600",
                }}
              >
                ({formatRupiah(slipData.potongan)})
              </p>
              <p
                style={{ color: "#999", fontSize: "0.9em", margin: "0.3rem 0" }}
              >
                Alasan Potongan:
              </p>
              <p
                style={{
                  color: "#999",
                  fontSize: "0.9em",
                  textAlign: "right",
                  margin: "0.3rem 0",
                }}
              >
                {slipData.alasan_potongan || "-"}
              </p>
            </div>

            <div
              style={{
                ...styles.totalRow,
                backgroundColor: "#f5f5f5",
                padding: "1rem",
                borderRadius: "8px",
                marginTop: "2rem",
              }}
            >
              <span style={{ color: "#333" }}>GAJI BERSIH (NET PAY):</span>
              <span style={{ color: "#4CAF50" }}>
                {formatRupiah(slipData.total_gaji)}
              </span>
            </div>

            <div
              style={{
                marginTop: "2rem",
                paddingTop: "1rem",
                borderTop: "1px dashed #ccc",
                textAlign: "center",
                color: "#999",
                fontSize: "0.85rem",
              }}
            >
              <p style={{ margin: "0.2rem 0" }}>
                Dokumen ini dibuat secara digital dan sah tanpa tanda tangan
                basah
              </p>
              <p style={{ margin: "0.2rem 0" }}>
                Dicetak pada:{" "}
                {new Date().toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          <div style={styles.buttonGroup}>
            <button
              onClick={downloadPDF}
              style={styles.downloadButton}
              disabled={isGenerating}
            >
              {isGenerating ? "Membuat PDF..." : "📥 Download PDF"}
            </button>
            <button
              onClick={printSlip}
              style={styles.printButton}
              disabled={isGenerating}
            >
              🖨️ Cetak Slip Gaji
            </button>
          </div>
        </div>
      ) : (
        <div style={{ ...styles.card, textAlign: "center", color: "#c0c0c0" }}>
          <p>Belum ada data slip gaji yang tersedia untuk Anda.</p>
        </div>
      )}

      {isGenerating && (
        <div style={styles.loadingOverlay}>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                border: "4px solid #f3f3f3",
                borderTop: "4px solid #667eea",
                borderRadius: "50%",
                width: "50px",
                height: "50px",
                animation: "spin 1s linear infinite",
                margin: "0 auto 1rem",
              }}
            />
            <p>Sedang membuat PDF...</p>
          </div>
        </div>
      )}
    </div>
  );
}
