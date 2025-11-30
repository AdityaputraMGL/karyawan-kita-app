import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      alert(`Login gagal: ${error}`);
      navigate("/login");
      return;
    }

    if (token) {
      // Simpan token
      localStorage.setItem("hr_userToken", token);

      // Decode token untuk mendapatkan user info
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const user = {
          user_id: payload.userId,
          username: payload.username,
          role: payload.role,
          employee_id: payload.employee_id,
        };

        localStorage.setItem("hr_currentUser", JSON.stringify(user));

        // Redirect ke dashboard
        navigate("/dashboard");
      } catch (err) {
        console.error("Error parsing token:", err);
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [searchParams, navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Memproses login...</h2>
    </div>
  );
}
