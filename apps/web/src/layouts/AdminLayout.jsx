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
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.data?.ok) return navigate("/");

        if (res.data.user.rol !== "admin") {
          return navigate("/app/mainscreen");
        }

        setUser(res.data.user);
      } catch (err) {
        console.error("Error cargando usuario (ADMIN):", err);
        localStorage.removeItem("fototrack-token");
        return navigate("/");
      }
    }

    loadUser();
  }, []);

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <AdminSidebar user={user} />

      <main
        className="flex-grow-1 d-flex justify-content-center"
        style={{
          marginLeft: "260px",
          padding: "32px",
          backgroundColor: "#ffffff",
        }}
      >
        {/* Contenedor centrado y con max-width */}
        <div style={{ width: "100%", maxWidth: "1100px" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
