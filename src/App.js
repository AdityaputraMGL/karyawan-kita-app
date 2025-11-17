import { Navigate, Route, Routes } from "react-router-dom";
import AddEmployee from "./components/AddEmployee";
import AdminDashboard from "./components/AdminDashboard";
import Attendance from "./components/Attendance";
import EmployeeDashboard from "./components/EmployeeDashboard"; // Digunakan untuk HR dan Karyawan
import EmployeeDetail from "./components/EmployeeDetail";
import EmployeeList from "./components/EmployeeList";
import Leave from "./components/Leave";
import Login from "./components/Login";
import Navbar from "./components/Navbar";
import Payroll from "./components/Payroll";
import Performance from "./components/Performance";
import ProtectedRoute from "./components/ProtectedRoute";
import RequireRole from "./components/RequireRole";
import { useAuth } from "./context/AuthContext";
// ⭐ Impor komponen Slip Gaji
import PaySlip from "./components/PaySlip";

// --- START: Inline Styles untuk Layout Sidebar ---
const SIDEBAR_WIDTH = "220px";

const styles = {
  app: {
    display: "flex",
    minHeight: "100vh",
  },
  contentContainer: {
    marginLeft: SIDEBAR_WIDTH,
    width: `calc(100% - ${SIDEBAR_WIDTH})`,
    backgroundColor: "#202040",
    padding: "0",
  },
};
// --- END: Inline Styles untuk Layout Sidebar ---

export default function App() {
  const { user } = useAuth();

  return (
    <div style={styles.app}>
            {user && <Navbar />}     {" "}
      <div style={styles.contentContainer}>
               {" "}
        <Routes>
                   {" "}
          <Route
            path="/"
            element={user ? <Navigate to="/dashboard" /> : <Login />}
          />
                   {" "}
          <Route element={<ProtectedRoute />}>
                       {" "}
            <Route
              path="/dashboard"
              element={
                // ⭐ PERUBAHAN DI SINI: Hanya Admin yang melihat AdminDashboard
                user?.role === "Admin" ? (
                  <AdminDashboard />
                ) : (
                  <EmployeeDashboard /> // HR dan Karyawan akan melihat EmployeeDashboard
                )
              }
            />
                        {/* Data Karyawan: Admin & HR */}           {" "}
            <Route element={<RequireRole allow={["Admin", "HR"]} />}>
                           {" "}
              <Route path="/employees" element={<EmployeeList />} />           
                <Route path="/employee/:id" element={<EmployeeDetail />} />     
                      <Route path="/add-employee" element={<AddEmployee />} /> 
                       {" "}
            </Route>
                        {/* Absensi: Semua boleh akses */}
                        <Route path="/attendance" element={<Attendance />} />   
                    {/* Payroll: Admin & HR */}           {" "}
            <Route element={<RequireRole allow={["Admin", "HR"]} />}>
                            <Route path="/payroll" element={<Payroll />} />     
                   {" "}
            </Route>
            {/* ⭐ SLIP GAJI: Semua Role boleh akses */}
            <Route path="/payslip" element={<PaySlip />} />           {" "}
            {/* Cuti: Semua boleh akses */}
                        <Route path="/leave" element={<Leave />} />           {" "}
            {/* Performance/Talenta: Admin & HR */}           {" "}
            <Route element={<RequireRole allow={["Admin", "HR"]} />}>
                           {" "}
              <Route path="/performance" element={<Performance />} />           {" "}
            </Route>
                     {" "}
          </Route>
                   {" "}
          <Route
            path="*"
            element={<Navigate to={user ? "/dashboard" : "/"} />}
          />
                 {" "}
        </Routes>
             {" "}
      </div>
         {" "}
    </div>
  );
}
