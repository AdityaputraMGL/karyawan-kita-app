import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(api.getCurrentUser());
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // ✅ TAMBAH USEEFFECT INI - Auto-detect user dari localStorage
  useEffect(() => {
    const initAuth = () => {
      try {
        const token = localStorage.getItem("hr_userToken");
        const userData = localStorage.getItem("hr_currentUser");

        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          console.log("✅ Auto-login detected:", parsedUser.username);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error("❌ Error initializing auth:", error);
        localStorage.removeItem("hr_userToken");
        localStorage.removeItem("hr_currentUser");
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // ✅ Login
  const login = async (username, password) => {
    const u = await api.login(username, password);
    setUser(u);
    return u;
  };

  // ✅ Google Login
  const loginWithGoogle = () => {
    api.loginWithGoogle();
  };

  // ✅ Register
  const register = async (payload) => {
    const u = await api.register(payload);
    setUser(u); // auto login
    return u;
  };

  // ✅ Forgot Password - kirim email reset
  const forgotPassword = async (email) => {
    const result = await api.forgotPassword(email);
    return result;
  };

  // ✅ Reset Password - dengan token
  const resetPassword = async (token, newPassword) => {
    const result = await api.resetPassword(token, newPassword);
    return result;
  };

  // ✅ Fix Employee - untuk user yang belum punya employee_id
  const fixEmployee = async () => {
    try {
      const result = await api.fixEmployee();

      // Update token dan user jika berhasil
      if (result.token) {
        localStorage.setItem("hr_userToken", result.token);
        const updatedUser = api.getCurrentUser();
        setUser(updatedUser);
      }

      return result;
    } catch (error) {
      console.error("Error fixing employee:", error);
      throw error;
    }
  };

  // ✅ Logout
  const logout = () => {
    api.logout();
    setUser(null);
    navigate("/login");
  };

  // ✅ Check Role
  const hasRole = (...roles) => !!user && roles.includes(user.role);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      forgotPassword,
      resetPassword,
      loginWithGoogle,
      fixEmployee, // ✅ Export fixEmployee
      logout,
      hasRole,
    }),
    [user, loading]
  );

  // ✅ TAMBAH LOADING SCREEN - SEBELUM return <AuthContext.Provider>
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              border: "4px solid rgba(255,255,255,0.3)",
              borderTop: "4px solid white",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 20px",
            }}
          />
          <p style={{ color: "white", fontSize: "16px", fontWeight: "600" }}>
            Memuat aplikasi...
          </p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
