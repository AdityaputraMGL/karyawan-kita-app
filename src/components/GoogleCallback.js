import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    const currentPath = window.location.pathname;

    console.log("📍 Current path:", currentPath);
    console.log("🔑 Token:", token ? "Found" : "Not found");

    if (token) {
      console.log("✅ Token received from Google OAuth");

      // Simpan token
      localStorage.setItem("hr_userToken", token);

      // Decode token untuk cek role
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        console.log("👤 User payload:", payload);

        // Simpan user data
        localStorage.setItem(
          "hr_currentUser",
          JSON.stringify({
            userId: payload.userId,
            username: payload.username,
            role: payload.role,
            employee_id: payload.employee_id,
            nama_lengkap: payload.nama_lengkap,
          })
        );

        // ⚠️ PENTING: Cek apakah ini dari /complete-profile
        // Backend akan redirect ke /complete-profile jika data belum lengkap
        // Jadi kita tidak perlu redirect lagi, user sudah di halaman yang benar
        if (currentPath === "/complete-profile") {
          console.log("📝 Already at complete-profile page");
          // Jangan navigate lagi, biarkan di halaman complete-profile
          return;
        }

        // Redirect berdasarkan role hanya jika bukan dari complete-profile
        const redirectPath =
          payload.role === "Admin" || payload.role === "HR"
            ? "/dashboard"
            : "/employees";

        console.log("🔄 Redirecting to:", redirectPath);
        window.location.href = redirectPath;
      } catch (error) {
        console.error("❌ Token decode error:", error);
        navigate("/login");
      }
    } else {
      console.error("❌ No token received");
      navigate("/login");
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
        <p className="text-white text-lg font-semibold">Memproses login...</p>
      </div>
    </div>
  );
}
