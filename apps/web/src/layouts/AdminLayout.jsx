// src/layouts/AdminLayout.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { AdminSidebar } from "../components/AdminSidebar";
import { useNavigate, Outlet } from "react-router-dom"; // 👈 Agregamos Outlet

export function AdminLayout() { // 👈 Quitamos children
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
        
        if (res.data.user.rol !== "admin") return navigate("/app/mainscreen");

        setUser(res.data.user);
      } catch (err) {
        console.error("Error cargando usuario (ADMIN):", err);
        localStorage.removeItem("fototrack-token");
        return navigate("/");
      }
    }
    loadUser();
  }, [navigate]);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa", position: "relative" }}>
      
      <AdminSidebar user={user} />

      <main
        style={{
          marginLeft: "260px", 
          width: "auto",      
          minHeight: "100vh",  
          overflowX: "hidden", 
          display: "block"     
        }}
      >
        {/* 🚀 EL CAMBIO MÁGICO: Ahora usamos Outlet */}
        {/* Pasamos el user por context por si alguna sub-página lo necesita */}
        <Outlet context={{ user }} /> 
      </main>
    </div>
  );
}