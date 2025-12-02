import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SIDEBAR_WIDTH = "260px";

// SVG Icons as React Components
const icons = {
  dashboard: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7"></rect>
      <rect x="14" y="3" width="7" height="7"></rect>
      <rect x="14" y="14" width="7" height="7"></rect>
      <rect x="3" y="14" width="7" height="7"></rect>
    </svg>
  ),
  users: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  ),
  clipboard: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
      <path d="M9 14l2 2 4-4"></path>
    </svg>
  ),
  wallet: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path>
    </svg>
  ),
  fileText: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  ),
  calendar: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  ),
  trending: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
      <polyline points="17 6 23 6 23 12"></polyline>
    </svg>
  ),
  clock: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  ),
  bot: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="10" rx="2"></rect>
      <circle cx="12" cy="5" r="2"></circle>
      <path d="M12 7v4"></path>
      <line x1="8" y1="16" x2="8" y2="16"></line>
      <line x1="16" y1="16" x2="16" y2="16"></line>
    </svg>
  ),
  // ⭐ NEW: Settings icon
  settings: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  ),
  logout: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
      <polyline points="16 17 21 12 16 7"></polyline>
      <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
  ),
};

const styles = {
  sidebar: {
    width: SIDEBAR_WIDTH,
    height: "100vh",
    backgroundColor: "#1e1e2e",
    padding: "0",
    position: "fixed",
    top: 0,
    left: 0,
    boxShadow: "4px 0 24px rgba(0, 0, 0, 0.3)",
    color: "white",
    zIndex: 100,
    display: "flex",
    flexDirection: "column",
  },
  brand: {
    fontWeight: "700",
    fontSize: "1.25em",
    padding: "24px 20px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    height: "72px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  },
  brandDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    backgroundColor: "#fff",
    boxShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
  },
  navLinksContainer: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    padding: "16px 0",
    overflowY: "auto",
  },
  navLink: {
    color: "#a8a8b8",
    textDecoration: "none",
    padding: "12px 20px",
    margin: "2px 12px",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    borderRadius: "8px",
    fontSize: "0.95em",
    fontWeight: "500",
  },
  navLinkHover: {
    backgroundColor: "rgba(102, 126, 234, 0.1)",
    cursor: "pointer",
    color: "#fff",
    transform: "translateX(4px)",
  },
  bottomSection: {
    padding: "16px",
    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
    marginTop: "auto",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "12px",
    padding: "8px",
    borderRadius: "8px",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "#667eea",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "1.1em",
    color: "#fff",
    flexShrink: 0,
  },
  userDetails: {
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  userName: {
    fontSize: "0.9em",
    color: "#fff",
    fontWeight: "600",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  userRole: {
    fontSize: "0.75em",
    color: "#a8a8b8",
  },
  btnSecondary: {
    backgroundColor: "rgba(102, 126, 234, 0.2)",
    color: "#fff",
    border: "1px solid rgba(102, 126, 234, 0.3)",
    padding: "10px 16px",
    cursor: "pointer",
    borderRadius: "8px",
    width: "100%",
    textAlign: "center",
    fontWeight: "600",
    fontSize: "0.9em",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "all 0.3s ease",
    marginBottom: "8px",
  },
  btnSecondaryHover: {
    backgroundColor: "rgba(102, 126, 234, 0.3)",
    transform: "translateY(-2px)",
  },
  iconStyle: {
    width: "20px",
    height: "20px",
    flexShrink: 0,
  },
};

export default function Navbar() {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const [hoveredLink, setHoveredLink] = useState(null);
  const [hoveredSettings, setHoveredSettings] = useState(false);
  const [hoveredLogout, setHoveredLogout] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getLinkStyle =
    (pathKey) =>
    ({ isActive }) => ({
      ...styles.navLink,
      color: isActive ? "white" : styles.navLink.color,
      backgroundColor: isActive
        ? "rgba(102, 126, 234, 0.25)"
        : hoveredLink === pathKey
        ? styles.navLinkHover.backgroundColor
        : "transparent",
      fontWeight: isActive ? "600" : "500",
      transform:
        hoveredLink === pathKey || isActive
          ? "translateX(4px)"
          : "translateX(0)",
      borderLeft: isActive ? "3px solid #667eea" : "3px solid transparent",
    });

  const getUserInitials = (username) => {
    if (!username) return "?";
    return username.substring(0, 2).toUpperCase();
  };

  return (
    <nav style={styles.sidebar}>
      {/* Brand/Logo Section */}
      <div style={styles.brand}>
        <div style={styles.brandDot}></div>
        <span>Karyawan Kita</span>
      </div>

      {/* Navigasi Utama Section */}
      <div style={styles.navLinksContainer}>
        {/* Dashboard */}
        <NavLink
          to="/dashboard"
          style={getLinkStyle("dashboard")}
          onMouseEnter={() => setHoveredLink("dashboard")}
          onMouseLeave={() => setHoveredLink(null)}
        >
          {icons.dashboard}
          <span>Dashboard</span>
        </NavLink>

        {/* Karyawan (Hanya Admin & HR) */}
        {hasRole("Admin", "HR") && (
          <NavLink
            to="/employees"
            style={getLinkStyle("employees")}
            onMouseEnter={() => setHoveredLink("employees")}
            onMouseLeave={() => setHoveredLink(null)}
          >
            {icons.users}
            <span>Karyawan</span>
          </NavLink>
        )}

        {/* Absensi */}
        <NavLink
          to="/attendance"
          style={getLinkStyle("attendance")}
          onMouseEnter={() => setHoveredLink("attendance")}
          onMouseLeave={() => setHoveredLink(null)}
        >
          {icons.clipboard}
          <span>Absensi</span>
        </NavLink>

        {/* Approvals (Hanya Admin & HR) */}
        {hasRole("Admin", "HR") && (
          <NavLink
            to="/approvals"
            style={getLinkStyle("approvals")}
            onMouseEnter={() => setHoveredLink("approvals")}
            onMouseLeave={() => setHoveredLink(null)}
          >
            {icons.clock}
            <span>Approvals</span>
          </NavLink>
        )}

        {/* Payroll (Hanya Admin & HR) */}
        {hasRole("Admin", "HR") && (
          <NavLink
            to="/payroll"
            style={getLinkStyle("payroll")}
            onMouseEnter={() => setHoveredLink("payroll")}
            onMouseLeave={() => setHoveredLink(null)}
          >
            {icons.wallet}
            <span>Payroll</span>
          </NavLink>
        )}

        {/* Slip Gaji (Untuk Semua Role) */}
        <NavLink
          to="/payslip"
          style={getLinkStyle("payslip")}
          onMouseEnter={() => setHoveredLink("payslip")}
          onMouseLeave={() => setHoveredLink(null)}
        >
          {icons.fileText}
          <span>Slip Gaji</span>
        </NavLink>

        {/* Cuti */}
        <NavLink
          to="/leave"
          style={getLinkStyle("leave")}
          onMouseEnter={() => setHoveredLink("leave")}
          onMouseLeave={() => setHoveredLink(null)}
        >
          {icons.calendar}
          <span>Cuti</span>
        </NavLink>

        {/* Talenta (Hanya Admin & HR) */}
        <NavLink
          to="/performance"
          style={getLinkStyle("performance")}
          onMouseEnter={() => setHoveredLink("performance")}
          onMouseLeave={() => setHoveredLink(null)}
        >
          {icons.trending}
          <span>Talenta</span>
        </NavLink>

        {/* Alpha Management (Hanya Admin & HR) */}
        {hasRole("Admin", "HR") && (
          <NavLink
            to="/alpha"
            style={getLinkStyle("alpha")}
            onMouseEnter={() => setHoveredLink("alpha")}
            onMouseLeave={() => setHoveredLink(null)}
          >
            {icons.bot}
            <span>Alpha Management</span>
          </NavLink>
        )}
      </div>

      {/* User Info dan Buttons Section */}
      <div style={styles.bottomSection}>
        <div style={styles.userInfo}>
          <div style={styles.avatar}>{getUserInitials(user?.username)}</div>
          <div style={styles.userDetails}>
            <span style={styles.userName}>{user?.username || "User"}</span>
            <span style={styles.userRole}>{user?.role || "Role"}</span>
          </div>
        </div>

        {/* ⭐ NEW: Settings Button */}
        <button
          onClick={() => navigate("/settings")}
          style={{
            ...styles.btnSecondary,
            ...(hoveredSettings ? styles.btnSecondaryHover : {}),
          }}
          onMouseEnter={() => setHoveredSettings(true)}
          onMouseLeave={() => setHoveredSettings(false)}
        >
          {icons.settings}
          <span>Settings</span>
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          style={{
            ...styles.btnSecondary,
            ...(hoveredLogout ? styles.btnSecondaryHover : {}),
            marginBottom: 0,
          }}
          onMouseEnter={() => setHoveredLogout(true)}
          onMouseLeave={() => setHoveredLogout(false)}
        >
          {icons.logout}
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
}
