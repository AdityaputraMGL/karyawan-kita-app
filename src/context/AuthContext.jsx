import { createContext, useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(api.getCurrentUser());
  const navigate = useNavigate();

  // ✅ Login
  const login = async (username, password) => {
    const u = await api.login(username, password);
    setUser(u);
    return u;
  };

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
      login,
      register,
      forgotPassword,
      resetPassword,
      loginWithGoogle,
      fixEmployee, // ✅ Export fixEmployee
      logout,
      hasRole,
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
