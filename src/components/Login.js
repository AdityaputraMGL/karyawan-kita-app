import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [tab, setTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const { login, register, forgotPassword, resetPassword } = useAuth();

  // state login
  const [username, setU] = useState("");
  const [password, setP] = useState("");

  // state register
  const [rUsername, setRU] = useState("");
  const [rEmail, setRE] = useState("");
  const [rPass, setRP] = useState("");
  const [rPass2, setRP2] = useState("");
  const [rRole, setRRole] = useState("Karyawan");

  // state forget password
  const [forgotEmail, setForgotEmail] = useState("");

  // state reset password
  const [resetToken, setResetToken] = useState("");
  const [newPass, setNewPass] = useState("");
  const [newPass2, setNewPass2] = useState("");

  const onLogin = async (e) => {
    e.preventDefault();
    setErr("");
    setSuccess("");
    setLoading(true);
    try {
      await login(username.trim(), password);
      navigate("/dashboard");
    } catch (e) {
      setErr(e.message || "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  const onRegister = async (e) => {
    e.preventDefault();
    setErr("");
    setSuccess("");
    if (rPass !== rPass2) return setErr("Konfirmasi password tidak cocok");
    if (rPass.length < 6) return setErr("Password minimal 6 karakter");
    setLoading(true);
    try {
      await register({
        username: rUsername.trim(),
        password: rPass,
        email: rEmail.trim(),
        role: rRole,
      });
      navigate("/dashboard");
    } catch (e) {
      setErr(e.message || "Registrasi gagal");
    } finally {
      setLoading(false);
    }
  };

  const onForgetPassword = async (e) => {
    e.preventDefault();
    setErr("");
    setSuccess("");
    setLoading(true);
    try {
      const result = await forgotPassword(forgotEmail.trim());

      if (result.devToken) {
        setSuccess("");
        setResetToken(result.devToken);
        setTab("reset");
      } else {
        setSuccess(
          "Link reset password telah dikirim ke email Anda. Silakan cek inbox/spam."
        );
      }

      setForgotEmail("");
    } catch (e) {
      setErr(e.message || "Gagal mengirim email reset password");
    } finally {
      setLoading(false);
    }
  };

  const onResetPassword = async (e) => {
    e.preventDefault();
    setErr("");
    setSuccess("");
    if (newPass !== newPass2) return setErr("Konfirmasi password tidak cocok");
    if (newPass.length < 6) return setErr("Password minimal 6 karakter");
    setLoading(true);
    try {
      await resetPassword(resetToken.trim(), newPass);

      setSuccess(
        "Password berhasil direset! Silakan login dengan password baru."
      );
      setResetToken("");
      setNewPass("");
      setNewPass2("");

      setTimeout(() => setTab("login"), 2000);
    } catch (e) {
      setErr(
        e.message ||
          "Gagal mereset password. Token mungkin tidak valid atau sudah expired."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          background: "white",
          borderRadius: "16px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            padding: "40px 32px",
            textAlign: "center",
            color: "white",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              background: "rgba(255,255,255,0.2)",
              borderRadius: "50%",
              margin: "0 auto 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              fontWeight: "bold",
            }}
          >
            HR
          </div>
          <h2
            style={{ margin: "0 0 8px 0", fontSize: "28px", fontWeight: "600" }}
          >
            Sistem HR Management
          </h2>
          <p style={{ margin: 0, opacity: 0.9, fontSize: "14px" }}>
            Kelola karyawan dan kehadiran dengan mudah
          </p>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            borderBottom: "2px solid #f0f0f0ff",
            background: "#fafafa",
          }}
        >
          <button
            onClick={() => {
              setTab("login");
              setErr("");
              setSuccess("");
            }}
            style={{
              flex: 1,
              padding: "16px",
              border: "none",
              background: tab === "login" ? "white" : "transparent",
              borderBottom:
                tab === "login" ? "3px solid #667eea" : "3px solid transparent",
              color: tab === "login" ? "#667eea" : "#666",
              fontWeight: tab === "login" ? "600" : "400",
              cursor: "pointer",
              fontSize: "14px",
              transition: "all 0.3s",
            }}
          >
            Masuk
          </button>
          <button
            onClick={() => {
              setTab("register");
              setErr("");
              setSuccess("");
            }}
            style={{
              flex: 1,
              padding: "16px",
              border: "none",
              background: tab === "register" ? "white" : "transparent",
              borderBottom:
                tab === "register"
                  ? "3px solid #667eea"
                  : "3px solid transparent",
              color: tab === "register" ? "#667eea" : "#666666ff",
              fontWeight: tab === "register" ? "600" : "400",
              cursor: "pointer",
              fontSize: "14px",
              transition: "all 0.3s",
            }}
          >
            Daftar
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "32px" }}>
          {/* Error Message */}
          {err && (
            <div
              style={{
                padding: "12px 16px",
                background: "#fee",
                border: "1px solid #fcc",
                borderRadius: "8px",
                color: "#c33",
                marginBottom: "20px",
                fontSize: "14px",
              }}
            >
              ⚠️ {err}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div
              style={{
                padding: "12px 16px",
                background: "#efe",
                border: "1px solid #cfc",
                borderRadius: "8px",
                color: "#373",
                marginBottom: "20px",
                fontSize: "14px",
              }}
            >
              ✓ {success}
            </div>
          )}

          {/* LOGIN FORM */}
          {tab === "login" && (
            <form
              onSubmit={onLogin}
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "#333",
                    fontWeight: "500",
                    fontSize: "14px",
                  }}
                >
                  Username
                </label>
                <input
                  value={username}
                  onChange={(e) => setU(e.target.value)}
                  required
                  autoFocus
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "2px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    transition: "border 0.3s",
                    outline: "none",
                    background: "white",
                    color: "#333",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#667eea")}
                  onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "#333",
                    fontWeight: "500",
                    fontSize: "14px",
                  }}
                >
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setP(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "2px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    transition: "border 0.3s",
                    outline: "none",
                    background: "white",
                    color: "#333",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#667eea")}
                  onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: loading
                    ? "#ccc"
                    : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "transform 0.2s",
                  marginTop: "8px",
                }}
                onMouseDown={(e) =>
                  !loading && (e.target.style.transform = "scale(0.98)")
                }
                onMouseUp={(e) => (e.target.style.transform = "scale(1)")}
              >
                {loading ? "Memproses..." : "Masuk"}
              </button>
              <div style={{ textAlign: "center", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setTab("forget")}
                  style={{
                    color: "#667eea",
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    textDecoration: "underline",
                    fontSize: "14px",
                  }}
                >
                  Lupa password?
                </button>
              </div>
            </form>
          )}

          {/* REGISTER FORM */}
          {tab === "register" && (
            <form
              onSubmit={onRegister}
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      color: "#333",
                      fontWeight: "500",
                      fontSize: "14px",
                    }}
                  >
                    Username
                  </label>
                  <input
                    value={rUsername}
                    onChange={(e) => setRU(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "2px solid #e0e0e0",
                      borderRadius: "8px",
                      fontSize: "14px",
                      outline: "none",
                      background: "white",
                      color: "#333",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#667eea")}
                    onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      color: "#333",
                      fontWeight: "500",
                      fontSize: "14px",
                    }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    value={rEmail}
                    onChange={(e) => setRE(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "2px solid #e0e0e0",
                      borderRadius: "8px",
                      fontSize: "14px",
                      outline: "none",
                      background: "white",
                      color: "#333",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#667eea")}
                    onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      color: "#333",
                      fontWeight: "500",
                      fontSize: "14px",
                    }}
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    value={rPass}
                    onChange={(e) => setRP(e.target.value)}
                    required
                    minLength={6}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "2px solid #e0e0e0",
                      borderRadius: "8px",
                      fontSize: "14px",
                      outline: "none",
                      background: "white",
                      color: "#333",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#667eea")}
                    onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      color: "#333",
                      fontWeight: "500",
                      fontSize: "14px",
                    }}
                  >
                    Konfirmasi
                  </label>
                  <input
                    type="password"
                    value={rPass2}
                    onChange={(e) => setRP2(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "2px solid #e0e0e0",
                      borderRadius: "8px",
                      fontSize: "14px",
                      outline: "none",
                      background: "white",
                      color: "#333",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#667eea")}
                    onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "#333",
                    fontWeight: "500",
                    fontSize: "14px",
                  }}
                >
                  Role
                </label>
                <select
                  value={rRole}
                  onChange={(e) => setRRole(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "2px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    background: "white",
                    color: "#333",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#667eea")}
                  onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                >
                  <option value="Karyawan" style={{ color: "#333" }}>
                    Karyawan
                  </option>
                  <option value="HR" style={{ color: "#333" }}>
                    HR
                  </option>
                  <option value="Admin" style={{ color: "#333" }}>
                    Admin
                  </option>
                </select>
                <small
                  style={{
                    color: "#888",
                    fontSize: "12px",
                    marginTop: "4px",
                    display: "block",
                  }}
                >
                  Di produksi, role diberikan oleh Admin
                </small>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: loading
                    ? "#ccc"
                    : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: loading ? "not-allowed" : "pointer",
                  marginTop: "8px",
                }}
              >
                {loading ? "Memproses..." : "Daftar Sekarang"}
              </button>
            </form>
          )}

          {/* FORGET PASSWORD FORM */}
          {tab === "forget" && (
            <form
              onSubmit={onForgetPassword}
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              <p
                style={{ margin: "0 0 8px 0", color: "#666", fontSize: "14px" }}
              >
                Masukkan email yang terdaftar untuk menerima instruksi reset
                password.
              </p>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "#333",
                    fontWeight: "500",
                    fontSize: "14px",
                  }}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  autoFocus
                  placeholder="nama@email.com"
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "2px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    background: "white",
                    color: "#333",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#667eea")}
                  onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: loading
                    ? "#ccc"
                    : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Mengirim..." : "Kirim Instruksi"}
              </button>
              <div style={{ textAlign: "center", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setTab("login")}
                  style={{
                    color: "#667eea",
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  ← Kembali ke login
                </button>
              </div>
            </form>
          )}

          {/* RESET PASSWORD FORM */}
          {tab === "reset" && (
            <form
              onSubmit={onResetPassword}
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              <p
                style={{ margin: "0 0 8px 0", color: "#666", fontSize: "14px" }}
              >
                Masukkan token dari email dan password baru Anda.
              </p>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "#333",
                    fontWeight: "500",
                    fontSize: "14px",
                  }}
                >
                  Token Reset
                </label>
                <input
                  type="text"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  required
                  autoFocus
                  placeholder="Paste token dari email"
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "2px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontFamily: "monospace",
                    outline: "none",
                    background: "white",
                    color: "#333",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#667eea")}
                  onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                />
                {resetToken && (
                  <small
                    style={{
                      color: "#4caf50",
                      fontSize: "12px",
                      marginTop: "4px",
                      display: "block",
                    }}
                  >
                    ✓ Token terdeteksi
                  </small>
                )}
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      color: "#333",
                      fontWeight: "500",
                      fontSize: "14px",
                    }}
                  >
                    Password Baru
                  </label>
                  <input
                    type="password"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    required
                    minLength={6}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "2px solid #e0e0e0",
                      borderRadius: "8px",
                      fontSize: "14px",
                      outline: "none",
                      background: "white",
                      color: "#333",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#667eea")}
                    onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      color: "#333",
                      fontWeight: "500",
                      fontSize: "14px",
                    }}
                  >
                    Konfirmasi
                  </label>
                  <input
                    type="password"
                    value={newPass2}
                    onChange={(e) => setNewPass2(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "2px solid #e0e0e0",
                      borderRadius: "8px",
                      fontSize: "14px",
                      outline: "none",
                      background: "white",
                      color: "#333",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#667eea")}
                    onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: loading
                    ? "#ccc"
                    : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Memproses..." : "Reset Password"}
              </button>
              <div style={{ textAlign: "center", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setTab("forget")}
                  style={{
                    color: "#667eea",
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  Belum dapat token? Kirim ulang
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "20px",
            textAlign: "center",
            borderTop: "1px solid #f0f0f0",
            background: "#fafafa",
            color: "#888",
            fontSize: "12px",
          }}
        >
          © 2024 HR Management System. All rights reserved.
        </div>
      </div>
    </div>
  );
}
