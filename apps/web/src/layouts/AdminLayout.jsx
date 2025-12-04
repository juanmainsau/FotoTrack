// src/layouts/AdminLayout.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { AdminSidebar } from "../components/AdminSidebar";
import { useNavigate } from "react-router-dom";

export function AdminLayout({ children }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadUser() {
      try {
        const token = localStorage.getItem("fototrack-token");
        if (!token) return navigate("/");

        const res = await axios.get("http://localhost:4000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.data?.ok) return navigate("/");

        if (res.data.user.rol !== "admin") {
          return navigate("/app/mainscreen");
        }

        setUser(res.data.user);
      } catch (err) {
        console.error("Error cargando usuario (ADMIN):", err);
        localStorage.removeItem("fototrack-token");
        localStorage.removeItem("fototrack-user");
        return navigate("/");
      }
    }

    loadUser();
  }, []);

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <AdminSidebar user={user} />

      <main
        className="flex-grow-1"
        style={{ padding: "24px", marginLeft: "260px" }}
      >
        {children}
      </main>
    </div>
  );
}
