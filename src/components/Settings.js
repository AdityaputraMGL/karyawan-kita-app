import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import * as api from "../services/api";

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Profile Data
  const [profileData, setProfileData] = useState({
    email: "",
    nama_lengkap: "",
    no_hp: "",
    alamat: "",
    jabatan: "",
    status_karyawan: "",
  });

  // Password Data
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Load profile data on mount
  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const data = await api.getUserProfile();
      setProfileData({
        email: data.email || "",
        nama_lengkap: data.employee?.nama_lengkap || "",
        no_hp: data.employee?.no_hp || "",
        alamat: data.employee?.alamat || "",
        jabatan: data.employee?.jabatan || "",
        status_karyawan: data.status_karyawan || "",
      });
    } catch (error) {
      showMessage("error", "Gagal memuat data profil");
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.updateUserProfile(profileData);
      showMessage("success", "Profil berhasil diperbarui!");
      loadProfileData();
    } catch (error) {
      showMessage("error", error.message || "Gagal memperbarui profil");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage("error", "Password baru dan konfirmasi tidak cocok");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showMessage("error", "Password minimal 6 karakter");
      return;
    }

    setLoading(true);

    try {
      await api.changePassword(
        passwordData.oldPassword,
        passwordData.newPassword
      );
      showMessage("success", "Password berhasil diubah!");
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      showMessage("error", error.message || "Gagal mengubah password");
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: "100vh",
      backgroundColor: "#202040",
      padding: "32px",
    },
    header: {
      marginBottom: "32px",
    },
    title: {
      fontSize: "2em",
      fontWeight: "700",
      color: "#fff",
      marginBottom: "8px",
    },
    subtitle: {
      color: "#a8a8b8",
      fontSize: "1em",
    },
    card: {
      backgroundColor: "#2d2d50",
      borderRadius: "12px",
      padding: "0",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
    },
    tabs: {
      display: "flex",
      borderBottom: "2px solid rgba(255, 255, 255, 0.1)",
      padding: "0 24px",
    },
    tab: {
      padding: "16px 24px",
      cursor: "pointer",
      color: "#a8a8b8",
      fontWeight: "500",
      transition: "all 0.3s",
      borderBottom: "3px solid transparent",
      marginBottom: "-2px",
    },
    tabActive: {
      color: "#fff",
      borderBottomColor: "#667eea",
    },
    tabContent: {
      padding: "32px",
    },
    formGroup: {
      marginBottom: "24px",
    },
    label: {
      display: "block",
      color: "#fff",
      fontSize: "0.9em",
      fontWeight: "600",
      marginBottom: "8px",
    },
    input: {
      width: "100%",
      padding: "12px 16px",
      backgroundColor: "#1e1e2e",
      border: "2px solid rgba(255, 255, 255, 0.1)",
      borderRadius: "8px",
      color: "#fff",
      fontSize: "0.95em",
      transition: "all 0.3s",
      outline: "none",
    },
    inputFocus: {
      borderColor: "#667eea",
    },
    inputDisabled: {
      opacity: 0.6,
      cursor: "not-allowed",
    },
    textarea: {
      width: "100%",
      padding: "12px 16px",
      backgroundColor: "#1e1e2e",
      border: "2px solid rgba(255, 255, 255, 0.1)",
      borderRadius: "8px",
      color: "#fff",
      fontSize: "0.95em",
      transition: "all 0.3s",
      outline: "none",
      minHeight: "100px",
      resize: "vertical",
      fontFamily: "inherit",
    },
    row: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "24px",
    },
    button: {
      padding: "12px 32px",
      backgroundColor: "#667eea",
      color: "#fff",
      border: "none",
      borderRadius: "8px",
      fontSize: "1em",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s",
    },
    buttonHover: {
      backgroundColor: "#5568d3",
      transform: "translateY(-2px)",
    },
    buttonDisabled: {
      opacity: 0.6,
      cursor: "not-allowed",
    },
    message: {
      padding: "12px 16px",
      borderRadius: "8px",
      marginBottom: "24px",
      fontWeight: "500",
    },
    messageSuccess: {
      backgroundColor: "rgba(16, 185, 129, 0.1)",
      color: "#10b981",
      border: "1px solid #10b981",
    },
    messageError: {
      backgroundColor: "rgba(239, 68, 68, 0.1)",
      color: "#ef4444",
      border: "1px solid #ef4444",
    },
    infoBox: {
      backgroundColor: "rgba(102, 126, 234, 0.1)",
      border: "1px solid rgba(102, 126, 234, 0.3)",
      borderRadius: "8px",
      padding: "16px",
      marginBottom: "24px",
    },
    infoText: {
      color: "#a8a8b8",
      fontSize: "0.9em",
      lineHeight: "1.5",
    },
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Pengaturan</h1>
        <p style={styles.subtitle}>Kelola profil dan preferensi akun Anda</p>
      </div>

      {/* Message */}
      {message.text && (
        <div
          style={{
            ...styles.message,
            ...(message.type === "success"
              ? styles.messageSuccess
              : styles.messageError),
          }}
        >
          {message.text}
        </div>
      )}

      {/* Card with Tabs */}
      <div style={styles.card}>
        {/* Tabs */}
        <div style={styles.tabs}>
          <div
            style={{
              ...styles.tab,
              ...(activeTab === "profile" && styles.tabActive),
            }}
            onClick={() => setActiveTab("profile")}
          >
            📝 Profil
          </div>
          <div
            style={{
              ...styles.tab,
              ...(activeTab === "password" && styles.tabActive),
            }}
            onClick={() => setActiveTab("password")}
          >
            🔒 Ubah Password
          </div>
        </div>

        {/* Tab Content */}
        <div style={styles.tabContent}>
          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <form onSubmit={handleProfileUpdate}>
              <div style={styles.infoBox}>
                <p style={styles.infoText}>
                  <strong>Username:</strong> {user?.username} <br />
                  <strong>Role:</strong> {user?.role}
                </p>
              </div>

              <div style={styles.row}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email</label>
                  <input
                    type="email"
                    style={styles.input}
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData({ ...profileData, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Nama Lengkap</label>
                  <input
                    type="text"
                    style={styles.input}
                    value={profileData.nama_lengkap}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        nama_lengkap: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div style={styles.row}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>No. HP</label>
                  <input
                    type="tel"
                    style={styles.input}
                    value={profileData.no_hp}
                    onChange={(e) =>
                      setProfileData({ ...profileData, no_hp: e.target.value })
                    }
                    placeholder="08xxxxxxxxxx"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Jabatan</label>
                  <input
                    type="text"
                    style={{ ...styles.input, ...styles.inputDisabled }}
                    value={profileData.jabatan || "-"}
                    disabled
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Alamat</label>
                <textarea
                  style={styles.textarea}
                  value={profileData.alamat}
                  onChange={(e) =>
                    setProfileData({ ...profileData, alamat: e.target.value })
                  }
                  placeholder="Masukkan alamat lengkap"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Status Karyawan</label>
                <input
                  type="text"
                  style={{ ...styles.input, ...styles.inputDisabled }}
                  value={profileData.status_karyawan || "-"}
                  disabled
                />
              </div>

              <button
                type="submit"
                style={{
                  ...styles.button,
                  ...(loading && styles.buttonDisabled),
                }}
                disabled={loading}
              >
                {loading ? "Menyimpan..." : "💾 Simpan Perubahan"}
              </button>
            </form>
          )}

          {/* PASSWORD TAB */}
          {activeTab === "password" && (
            <form onSubmit={handlePasswordChange}>
              <div style={styles.infoBox}>
                <p style={styles.infoText}>
                  ⚠️ Password minimal 6 karakter. Pastikan Anda mengingat
                  password baru Anda.
                </p>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Password Lama</label>
                <input
                  type="password"
                  style={styles.input}
                  value={passwordData.oldPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      oldPassword: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Password Baru</label>
                <input
                  type="password"
                  style={styles.input}
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  required
                  minLength={6}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Konfirmasi Password Baru</label>
                <input
                  type="password"
                  style={styles.input}
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                style={{
                  ...styles.button,
                  ...(loading && styles.buttonDisabled),
                }}
                disabled={loading}
              >
                {loading ? "Mengubah..." : "🔐 Ubah Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
