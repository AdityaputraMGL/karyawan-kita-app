import { createContext, useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom"; // ⭐ TAMBAHKAN IMPORT INI
import * as api from "../services/api"; //

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // ⭐ Hapus api.seed() dan langsung ambil user dari LocalStorage
  const [user, setUser] = useState(api.getCurrentUser());
  const navigate = useNavigate(); // Untuk redirect saat logout

  // Hapus useEffect yang lama (tidak perlu seed lagi)
  // useEffect(() => {
  //   api.seed(); // Baris ini Dihapus
  //   setUser(api.getCurrentUser());
  // }, []);

  const login = async (username, password) => {
    // Memanggil fungsi login baru di api.js
    const u = await api.login(username, password);
    setUser(u);
    return u;
  };

  // Register
  const register = async (payload) => {
    // Memanggil fungsi register baru di api.js
    const u = await api.register(payload);
    setUser(u); // auto login
    return u;
  };

  // Forgot Password - kirim email reset
  const forgotPassword = async (email) => {
    // Pastikan endpoint backend Anda siap
    const result = await api.forgotPassword(email);
    return result;
  };

  // Reset Password - dengan token
  const resetPassword = async (token, newPassword) => {
    // Pastikan endpoint backend Anda siap
    const result = await api.resetPassword(token, newPassword);
    return result;
  };

  const logout = () => {
    api.logout();
    setUser(null);
    navigate("/login"); // ⭐ Redirect ke halaman login setelah logout
  };

  const hasRole = (...roles) => !!user && roles.includes(user.role);

  const value = useMemo(
    () => ({
      user,
      login,
      register,
      forgotPassword,
      resetPassword,
      logout,
      hasRole,
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
