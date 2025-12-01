import { useEffect, useState } from "react";

export default function CompleteProfile() {
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({
    username: "",
    role: "",
  });
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [formData, setFormData] = useState({
    jabatan: "",
    alamat: "",
    no_hp: "",
    status_karyawan: "",
    password: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");

  // Ambil token dari URL dan simpan ke localStorage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (token) {
      // ✅ PERBAIKAN 1: Simpan token dengan KEY YANG BENAR (sesuai AuthContext)
      localStorage.setItem("hr_userToken", token); // ← KEY: hr_userToken

      // Decode token untuk mendapatkan username dan user data
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));

        // Simpan user data (sesuai AuthContext)
        const userData = {
          userId: payload.userId,
          username: payload.username,
          role: payload.role,
          employee_id: payload.employee_id,
          nama_lengkap: payload.nama_lengkap,
        };

        localStorage.setItem("hr_currentUser", JSON.stringify(userData)); // ← KEY: hr_currentUser

        setUserData({
          username: payload.username || "",
          role: payload.role || "Employee",
        });
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    } else {
      // ✅ PERBAIKAN 2: Jika tidak ada token, redirect ke login
      console.warn("No token found in URL, redirecting to login...");
      window.location.href = "/";
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    if (e.target.name === "password" || e.target.name === "confirmPassword") {
      setPasswordError("");
    }
  };

  const validatePassword = () => {
    if (showPasswordFields && formData.password) {
      if (formData.password.length < 6) {
        setPasswordError("Password minimal 6 karakter");
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setPasswordError("Password tidak cocok");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePassword()) {
      return;
    }

    // Validasi form required
    if (
      !formData.jabatan ||
      !formData.status_karyawan ||
      !formData.no_hp ||
      !formData.alamat
    ) {
      alert("❌ Harap lengkapi semua field yang wajib diisi!");
      return;
    }

    setLoading(true);
    setPasswordError("");

    try {
      // ✅ PERBAIKAN 3: Ambil token dari localStorage dengan KEY YANG BENAR
      const token = localStorage.getItem("hr_userToken");

      if (!token) {
        throw new Error("Token tidak ditemukan. Silakan login ulang.");
      }

      console.log("📤 Sending profile data to backend...");

      // Kirim data ke backend
      const response = await fetch(
        "http://localhost:5000/api/complete-profile",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            jabatan: formData.jabatan,
            alamat: formData.alamat,
            no_hp: formData.no_hp,
            status_karyawan: formData.status_karyawan,
            password: formData.password || null,
          }),
        }
      );

      const data = await response.json();
      console.log("📥 Response from backend:", data);

      if (!response.ok) {
        throw new Error(data.error || data.message || "Gagal menyimpan profil");
      }

      // Berhasil!
      console.log("✅ Profile completed successfully!");

      // ✅ PERBAIKAN 4: Simpan token baru dengan KEY YANG BENAR
      if (data.token) {
        localStorage.setItem("hr_userToken", data.token);
        console.log("✅ New token saved to localStorage");

        // Decode dan simpan user data
        try {
          const payload = JSON.parse(atob(data.token.split(".")[1]));
          const userData = {
            userId: payload.userId,
            username: payload.username,
            role: payload.role,
            employee_id: payload.employee_id,
            nama_lengkap: payload.nama_lengkap,
          };
          localStorage.setItem("hr_currentUser", JSON.stringify(userData));
          console.log("✅ User data saved to localStorage");
        } catch (e) {
          console.error("Error saving user data:", e);
        }
      }

      // Tampilkan pesan sukses
      alert("✅ Profil berhasil dilengkapi! Mengarahkan ke dashboard...");

      // ✅ PERBAIKAN 5: Redirect ke dashboard setelah delay singkat
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 500);
    } catch (error) {
      console.error("❌ Error:", error);
      alert("❌ Gagal menyimpan profil: " + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 flex">
      {/* Left Sidebar - Decorative */}
      <div className="hidden lg:block w-64 bg-indigo-500/30 backdrop-blur-sm"></div>

      {/* Main Content */}
      <div className="flex-1 flex items-start justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-lg pt-8 pb-12">
          {/* Header with Icon */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-slate-700 rounded-full mb-6">
              <svg
                className="w-20 h-20 text-slate-300"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-white mb-2">
              Lengkapi Profil Anda
            </h1>
            <p className="text-indigo-200 text-sm mb-1">
              Selamat datang,{" "}
              <span className="font-semibold">
                {userData.username || "Loading..."}
              </span>
            </p>
            <p className="text-indigo-300 text-xs">
              Silakan lengkapi data diri untuk melanjutkan
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Jabatan */}
            <div>
              <label className="block text-white text-sm font-medium mb-1.5">
                Jabatan <span className="text-red-400">*</span>
              </label>
              <select
                name="jabatan"
                value={formData.jabatan}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-slate-800/80 backdrop-blur-sm border border-slate-600/50 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 0.75rem center",
                  backgroundSize: "1.25rem",
                }}
              >
                <option value="">Pilih Jabatan</option>
                <option value="Staff">Staff</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
                <option value="Supervisor">Supervisor</option>
                <option value="Team Lead">Team Lead</option>
                <option value="Developer">Developer</option>
                <option value="Designer">Designer</option>
              </select>
            </div>

            {/* Status Karyawan */}
            <div>
              <label className="block text-white text-sm font-medium mb-1.5">
                Status Karyawan <span className="text-red-400">*</span>
              </label>
              <select
                name="status_karyawan"
                value={formData.status_karyawan}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-slate-800/80 backdrop-blur-sm border border-slate-600/50 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 0.75rem center",
                  backgroundSize: "1.25rem",
                }}
              >
                <option value="">Pilih Status</option>
                <option value="Tetap">Tetap</option>
                <option value="Kontrak">Kontrak</option>
                <option value="Magang">Magang</option>
              </select>
            </div>

            {/* Nomor HP */}
            <div>
              <label className="block text-white text-sm font-medium mb-1.5">
                Nomor HP <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                name="no_hp"
                value={formData.no_hp}
                onChange={handleChange}
                required
                placeholder="081234567890"
                className="w-full px-4 py-2.5 bg-slate-800/80 backdrop-blur-sm border border-slate-600/50 rounded text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
              />
              <p className="mt-1 text-xs text-indigo-300">
                Format: 08xxxxxxxxxx atau +62xxxxxxxxxx
              </p>
            </div>

            {/* Alamat */}
            <div>
              <label className="block text-white text-sm font-medium mb-1.5">
                Alamat Lengkap <span className="text-red-400">*</span>
              </label>
              <textarea
                name="alamat"
                value={formData.alamat}
                onChange={handleChange}
                required
                rows="3"
                placeholder="Masukkan alamat lengkap"
                className="w-full px-4 py-2.5 bg-slate-800/80 backdrop-blur-sm border border-slate-600/50 rounded text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent resize-none transition-all"
              />
            </div>

            {/* Password Section */}
            <div className="pt-4">
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-600/40 rounded p-4 mb-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-indigo-300"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-white mb-1">
                      Set Password (Opsional)
                    </h4>
                    <p className="text-xs text-indigo-200 leading-relaxed">
                      Anda dapat mengatur password untuk login manual. Jika
                      tidak diisi, gunakan opsi "Login dengan Google"
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowPasswordFields(!showPasswordFields)}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-200 hover:text-white transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={showPasswordFields ? "M19 9l-7 7-7-7" : "M9 5l7 7-7 7"}
                  />
                </svg>
                {showPasswordFields ? "Sembunyikan" : "Tampilkan"} Form Password
              </button>

              {showPasswordFields && (
                <div className="mt-3 space-y-3 bg-slate-800/30 backdrop-blur-sm p-4 rounded border border-slate-600/40">
                  <div>
                    <label className="block text-white text-sm font-medium mb-1.5">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Minimal 6 karakter"
                      className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
                    />
                  </div>

                  {formData.password && (
                    <div>
                      <label className="block text-white text-sm font-medium mb-1.5">
                        Konfirmasi Password
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Ulangi password"
                        className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600/50 rounded text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
                      />
                    </div>
                  )}

                  {passwordError && (
                    <div className="flex items-center gap-2 text-sm text-red-300 bg-red-500/10 border border-red-500/30 p-3 rounded">
                      <svg
                        className="w-5 h-5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {passwordError}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white py-3 px-6 rounded font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl mt-6"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Menyimpan...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Simpan & Lanjutkan
                </>
              )}
            </button>

            {/* Footer Text */}
            <div className="flex items-center justify-center gap-2 text-xs text-indigo-200 pt-4">
              <svg
                className="w-4 h-4 text-indigo-300"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                Data Anda aman dan hanya digunakan untuk keperluan internal
                perusahaan
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
