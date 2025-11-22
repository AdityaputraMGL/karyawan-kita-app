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

  // State untuk Login
  const [username, setU] = useState("");
  const [password, setP] = useState("");

  // State untuk Register
  const [rUsername, setRU] = useState("");
  const [rNamaLengkap, setRNamaLengkap] = useState(""); // ⭐ TAMBAHAN BARU
  const [rEmail, setRE] = useState("");
  const [rPass, setRP] = useState("");
  const [rPass2, setRP2] = useState("");
  const [rRole, setRRole] = useState("Karyawan");
  const [rStatusKaryawan, setRStatusKaryawan] = useState("Magang");

  // State untuk Forgot/Reset Password
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPass, setNewPass] = useState("");
  const [newPass2, setNewPass2] = useState("");

  // State untuk show/hide password
  const [showPassword, setShowPassword] = useState(false);
  const [showRPass, setShowRPass] = useState(false);
  const [showRPass2, setShowRPass2] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showNewPass2, setShowNewPass2] = useState(false);

  // --- FUNGSI LOGIN/REGISTER/ETC ---
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
    // Validasi nama lengkap
    if (!rNamaLengkap.trim()) {
      return setErr("Nama lengkap wajib diisi");
    }
    if (rPass !== rPass2) return setErr("Konfirmasi password tidak cocok");
    if (rPass.length < 6) return setErr("Password minimal 6 karakter");
    setLoading(true);
    try {
      await register({
        username: rUsername.trim(),
        password: rPass,
        email: rEmail.trim(),
        role: rRole,
        status_karyawan: rStatusKaryawan,
        nama_lengkap: rNamaLengkap.trim(), // ⭐ KIRIM NAMA LENGKAP KE BACKEND
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

      setSuccess(
        result.message ||
          "Link reset password telah dikirim ke email Anda. Silakan cek inbox/spam."
      );

      if (result.devToken) {
        setResetToken(result.devToken);
      }

      setTab("reset");
    } catch (e) {
      const errorMessage =
        e.response?.data?.error ||
        e.message ||
        "Gagal mengirim email reset password";
      setErr(errorMessage);
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
      const errorMessage =
        e.response?.data?.error ||
        e.message ||
        "Gagal mereset password. Token mungkin tidak valid atau sudah expired.";
      setErr(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------------------
  // INLINE STYLES
  // ------------------------------------------------------------------
  const INPUT_STYLE = {
    width: "100%",
    padding: "16px 20px",
    border: "1px solid #e0e0e0",
    borderRadius: "10px",
    fontSize: "15px",
    transition: "all 0.3s ease",
    outline: "none",
    background: "white",
    color: "#333",
    boxSizing: "border-box",
  };

  const BUTTON_SUBMIT_STYLE = (disabled) => ({
    width: "100%",
    padding: "18px",
    background: disabled
      ? "#ccc"
      : "linear-gradient(135deg, #5C54A4 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "17px",
    fontWeight: "600",
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all 0.3s ease",
    boxShadow: disabled ? "none" : "0 4px 12px rgba(92, 84, 164, 0.3)",
  });

  const styles = {
    label: {
      display: "block",
      marginBottom: "8px",
      color: "#555",
      fontWeight: "500",
      fontSize: "14px",
    },
    twoColumnGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "20px",
    },
    formElement: {
      display: "flex",
      flexDirection: "column",
    },
    passwordWrapper: {
      position: "relative",
      width: "100%",
    },
    eyeButton: {
      position: "absolute",
      right: "16px",
      top: "50%",
      transform: "translateY(-50%)",
      background: "none",
      border: "none",
      cursor: "pointer",
      padding: "4px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#999",
      transition: "color 0.2s ease",
    },
    paragraph: {
      margin: "0 0 8px 0",
      color: "#666",
      fontSize: "14px",
      lineHeight: "1.5",
    },
    successText: {
      color: "#4caf50",
      fontSize: "12px",
      marginTop: "4px",
      display: "block",
    },
    helpText: {
      color: "#888",
      fontSize: "11px",
      marginTop: "4px",
      display: "block",
    },
    linkButton: {
      color: "#5C54A4",
      background: "none",
      border: "none",
      padding: 0,
      cursor: "pointer",
      textDecoration: "underline",
      fontSize: "13px",
      fontWeight: "500",
    },
    errorMessage: {
      padding: "14px 18px",
      background: "#fef0f0",
      border: "1px solid #fcc",
      borderRadius: "10px",
      color: "#c33",
      marginBottom: "20px",
      fontSize: "14px",
    },
    successMessage: {
      padding: "14px 18px",
      background: "#f0fef0",
      border: "1px solid #cfc",
      borderRadius: "10px",
      color: "#373",
      marginBottom: "20px",
      fontSize: "14px",
    },
  };

  // SVG Logo HRIS Component
  const HRISLogo = () => (
    <svg
      width="70"
      height="70"
      viewBox="0 0 70 70"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ margin: "0 auto 16px" }}
    >
      <circle cx="35" cy="35" r="33" fill="rgba(255,255,255,0.15)" />
      <circle cx="24" cy="26" r="5" fill="white" opacity="0.9" />
      <path
        d="M24 33C19 33 16 35 16 38V42H32V38C32 35 29 33 24 33Z"
        fill="white"
        opacity="0.9"
      />
      <circle cx="46" cy="26" r="5" fill="white" opacity="0.9" />
      <path
        d="M46 33C41 33 38 35 38 38V42H54V38C54 35 51 33 46 33Z"
        fill="white"
        opacity="0.9"
      />
      <rect
        x="26"
        y="46"
        width="18"
        height="14"
        rx="2"
        fill="white"
        opacity="0.9"
      />
      <line
        x1="29"
        y1="50"
        x2="41"
        y2="50"
        stroke="#5C54A4"
        strokeWidth="1.5"
      />
      <line
        x1="29"
        y1="53"
        x2="38"
        y2="53"
        stroke="#5C54A4"
        strokeWidth="1.5"
      />
      <line
        x1="29"
        y1="56"
        x2="41"
        y2="56"
        stroke="#5C54A4"
        strokeWidth="1.5"
      />
    </svg>
  );

  // Eye Icon Components
  const EyeIcon = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

  const EyeOffIcon = () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "0",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "auto",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          maxWidth: "none",
          background: "white",
          borderRadius: "0",
          boxShadow: "none",
          overflow: "hidden",
          display: "grid",
          gridTemplateColumns: "1fr",
          margin: "auto",
        }}
      >
        {/* Header dengan Logo HRIS */}
        <div
          style={{
            background: "linear-gradient(135deg, #5C54A4 0%, #764ba2 100%)",
            padding: "48px 40px",
            textAlign: "center",
            color: "white",
          }}
        >
          <HRISLogo />
          <h2
            style={{
              margin: "0 0 8px 0",
              fontSize: "32px",
              fontWeight: "700",
              letterSpacing: "-0.5px",
            }}
          >
            HRIS Management
          </h2>
          <p style={{ margin: 0, opacity: 0.9, fontSize: "16px" }}>
            Human Resource Information System
          </p>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            background: "#fafafa",
            borderBottom: "1px solid #eee",
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
                tab === "login" ? "2px solid #5C54A4" : "2px solid transparent",
              color: tab === "login" ? "#5C54A4" : "#999",
              fontWeight: tab === "login" ? "600" : "500",
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
              padding: "14px",
              border: "none",
              background: tab === "register" ? "white" : "transparent",
              borderBottom:
                tab === "register"
                  ? "2px solid #5C54A4"
                  : "2px solid transparent",
              color: tab === "register" ? "#5C54A4" : "#999",
              fontWeight: tab === "register" ? "600" : "500",
              cursor: "pointer",
              fontSize: "14px",
              transition: "all 0.3s",
            }}
          >
            Daftar
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            padding: "48px 80px 56px",
            flex: 1, // ← Mengisi ruang tersedia
            display: "flex",
            flexDirection: "column",
            justifyContent: "center", // ← Konten di tengah vertikal
            maxWidth: "900px", // ← Batasi lebar form agar tetap rapi
            margin: "0 auto", // ← Center horizontal
            width: "100%",
          }}
        >
          {/* Error Message */}
          {err && <div style={styles.errorMessage}>⚠ {err}</div>}
          {/* Success Message */}
          {success && <div style={styles.successMessage}>✓ {success}</div>}

          {/* LOGIN FORM */}
          {tab === "login" && (
            <form
              onSubmit={onLogin}
              style={{ display: "flex", flexDirection: "column", gap: "24px" }}
            >
              <div style={styles.formElement}>
                <label style={styles.label}>Username</label>
                <input
                  value={username}
                  onChange={(e) => setU(e.target.value)}
                  required
                  autoFocus
                  placeholder="Masukkan username"
                  style={INPUT_STYLE}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#5C54A4";
                    e.target.style.boxShadow =
                      "0 0 0 3px rgba(92, 84, 164, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e0e0e0";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
              <div style={styles.formElement}>
                <label style={styles.label}>Password</label>
                <div style={styles.passwordWrapper}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setP(e.target.value)}
                    required
                    placeholder="Masukkan password"
                    style={{ ...INPUT_STYLE, paddingRight: "50px" }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#5C54A4";
                      e.target.style.boxShadow =
                        "0 0 0 3px rgba(92, 84, 164, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#e0e0e0";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "#5C54A4")
                    }
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#999")}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  marginTop: "6px",
                }}
              >
                <button
                  type="submit"
                  disabled={loading}
                  style={BUTTON_SUBMIT_STYLE(loading)}
                  onMouseEnter={(e) =>
                    !loading && (e.target.style.transform = "translateY(-1px)")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.transform = "translateY(0)")
                  }
                >
                  {loading ? "Memproses..." : "Masuk"}
                </button>
                <div style={{ textAlign: "center" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setTab("forget");
                      setErr("");
                      setSuccess("");
                    }}
                    style={styles.linkButton}
                  >
                    Lupa password?
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* REGISTER FORM */}
          {tab === "register" && (
            <form
              onSubmit={onRegister}
              style={{ display: "flex", flexDirection: "column", gap: "22px" }}
            >
              <div style={styles.twoColumnGrid}>
                <div style={styles.formElement}>
                  <label style={styles.label}>Username</label>
                  <input
                    value={rUsername}
                    onChange={(e) => setRU(e.target.value)}
                    required
                    placeholder="Username"
                    style={INPUT_STYLE}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#5C54A4";
                      e.target.style.boxShadow =
                        "0 0 0 3px rgba(92, 84, 164, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#e0e0e0";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>
                <div style={styles.formElement}>
                  <label style={styles.label}>Email</label>
                  <input
                    type="email"
                    value={rEmail}
                    onChange={(e) => setRE(e.target.value)}
                    required
                    placeholder="email@example.com"
                    style={INPUT_STYLE}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#5C54A4";
                      e.target.style.boxShadow =
                        "0 0 0 3px rgba(92, 84, 164, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#e0e0e0";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>
              </div>

              {/* ⭐ INPUT NAMA LENGKAP - TAMBAHAN BARU */}
              <div style={styles.formElement}>
                <label style={styles.label}>Nama Lengkap</label>
                <input
                  value={rNamaLengkap}
                  onChange={(e) => setRNamaLengkap(e.target.value)}
                  required
                  placeholder="Masukkan nama lengkap Anda"
                  style={INPUT_STYLE}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#5C54A4";
                    e.target.style.boxShadow =
                      "0 0 0 3px rgba(92, 84, 164, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e0e0e0";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              <div style={styles.twoColumnGrid}>
                <div style={styles.formElement}>
                  <label style={styles.label}>Password</label>
                  <div style={styles.passwordWrapper}>
                    <input
                      type={showRPass ? "text" : "password"}
                      value={rPass}
                      onChange={(e) => setRP(e.target.value)}
                      required
                      minLength={6}
                      placeholder="Min. 6 karakter"
                      style={{ ...INPUT_STYLE, paddingRight: "50px" }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#5C54A4";
                        e.target.style.boxShadow =
                          "0 0 0 3px rgba(92, 84, 164, 0.1)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#e0e0e0";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRPass(!showRPass)}
                      style={styles.eyeButton}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "#5C54A4")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "#999")
                      }
                    >
                      {showRPass ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>
                <div style={styles.formElement}>
                  <label style={styles.label}>Konfirmasi Password</label>
                  <div style={styles.passwordWrapper}>
                    <input
                      type={showRPass2 ? "text" : "password"}
                      value={rPass2}
                      onChange={(e) => setRP2(e.target.value)}
                      required
                      placeholder="Ulangi password"
                      style={{ ...INPUT_STYLE, paddingRight: "50px" }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#5C54A4";
                        e.target.style.boxShadow =
                          "0 0 0 3px rgba(92, 84, 164, 0.1)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#e0e0e0";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRPass2(!showRPass2)}
                      style={styles.eyeButton}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "#5C54A4")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "#999")
                      }
                    >
                      {showRPass2 ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>
              </div>

              <div style={styles.twoColumnGrid}>
                <div style={styles.formElement}>
                  <label style={styles.label}>Status Karyawan</label>
                  <select
                    value={rStatusKaryawan}
                    onChange={(e) => setRStatusKaryawan(e.target.value)}
                    style={INPUT_STYLE}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#5C54A4";
                      e.target.style.boxShadow =
                        "0 0 0 3px rgba(92, 84, 164, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#e0e0e0";
                      e.target.style.boxShadow = "none";
                    }}
                  >
                    <option value="Magang">Magang</option>
                    <option value="Kontrak">Kontrak</option>
                    <option value="Tetap">Tetap</option>
                  </select>
                </div>
                <div style={styles.formElement}>
                  <label style={styles.label}>Role</label>
                  <select
                    value={rRole}
                    onChange={(e) => setRRole(e.target.value)}
                    style={INPUT_STYLE}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#5C54A4";
                      e.target.style.boxShadow =
                        "0 0 0 3px rgba(92, 84, 164, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#e0e0e0";
                      e.target.style.boxShadow = "none";
                    }}
                  >
                    <option value="Karyawan">Karyawan</option>
                  </select>
                  <small style={styles.helpText}>
                    Role Admin hanya dapat diberikan oleh Administrator
                  </small>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ ...BUTTON_SUBMIT_STYLE(loading), marginTop: "6px" }}
                onMouseEnter={(e) =>
                  !loading && (e.target.style.transform = "translateY(-1px)")
                }
                onMouseLeave={(e) =>
                  (e.target.style.transform = "translateY(0)")
                }
              >
                {loading ? "Memproses..." : "Daftar Sekarang"}
              </button>
            </form>
          )}

          {/* FORGET PASSWORD FORM */}
          {tab === "forget" && (
            <form
              onSubmit={onForgetPassword}
              style={{ display: "flex", flexDirection: "column", gap: "24px" }}
            >
              <p style={styles.paragraph}>
                Masukkan email yang terdaftar untuk menerima instruksi reset
                password.
              </p>
              <div style={styles.formElement}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  autoFocus
                  placeholder="nama@email.com"
                  style={INPUT_STYLE}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#5C54A4";
                    e.target.style.boxShadow =
                      "0 0 0 3px rgba(92, 84, 164, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e0e0e0";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                style={BUTTON_SUBMIT_STYLE(loading)}
                onMouseEnter={(e) =>
                  !loading && (e.target.style.transform = "translateY(-1px)")
                }
                onMouseLeave={(e) =>
                  (e.target.style.transform = "translateY(0)")
                }
              >
                {loading ? "Mengirim..." : "Kirim Instruksi"}
              </button>
              <div style={{ textAlign: "center", marginTop: "4px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setTab("login");
                    setErr("");
                    setSuccess("");
                  }}
                  style={styles.linkButton}
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
              style={{ display: "flex", flexDirection: "column", gap: "24px" }}
            >
              <p style={styles.paragraph}>
                Masukkan token dari email dan password baru Anda.
              </p>
              <div style={styles.formElement}>
                <label style={styles.label}>Token Reset</label>
                <input
                  type="text"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  required
                  autoFocus
                  placeholder="Paste token dari email"
                  style={{ ...INPUT_STYLE, fontFamily: "monospace" }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#5C54A4";
                    e.target.style.boxShadow =
                      "0 0 0 3px rgba(92, 84, 164, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e0e0e0";
                    e.target.style.boxShadow = "none";
                  }}
                />
                {resetToken && (
                  <small style={styles.successText}>✓ Token terdeteksi</small>
                )}
              </div>
              <div style={styles.twoColumnGrid}>
                <div style={styles.formElement}>
                  <label style={styles.label}>Password Baru</label>
                  <div style={styles.passwordWrapper}>
                    <input
                      type={showNewPass ? "text" : "password"}
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      required
                      minLength={6}
                      placeholder="Min. 6 karakter"
                      style={{ ...INPUT_STYLE, paddingRight: "50px" }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#5C54A4";
                        e.target.style.boxShadow =
                          "0 0 0 3px rgba(92, 84, 164, 0.1)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#e0e0e0";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      style={styles.eyeButton}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "#5C54A4")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "#999")
                      }
                    >
                      {showNewPass ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>
                <div style={styles.formElement}>
                  <label style={styles.label}>Konfirmasi Password</label>
                  <div style={styles.passwordWrapper}>
                    <input
                      type={showNewPass2 ? "text" : "password"}
                      value={newPass2}
                      onChange={(e) => setNewPass2(e.target.value)}
                      required
                      placeholder="Ulangi password"
                      style={{ ...INPUT_STYLE, paddingRight: "50px" }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#5C54A4";
                        e.target.style.boxShadow =
                          "0 0 0 3px rgba(92, 84, 164, 0.1)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#e0e0e0";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass2(!showNewPass2)}
                      style={styles.eyeButton}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "#5C54A4")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "#999")
                      }
                    >
                      {showNewPass2 ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                style={BUTTON_SUBMIT_STYLE(loading)}
                onMouseEnter={(e) =>
                  !loading && (e.target.style.transform = "translateY(-1px)")
                }
                onMouseLeave={(e) =>
                  (e.target.style.transform = "translateY(0)")
                }
              >
                {loading ? "Memproses..." : "Reset Password"}
              </button>
              <div style={{ textAlign: "center", marginTop: "4px" }}>
                <button
                  type="button"
                  onClick={() => setTab("forget")}
                  style={styles.linkButton}
                >
                  Belum dapat token? Kirim ulang
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
