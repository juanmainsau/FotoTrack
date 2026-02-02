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
        
        // Si no es admin, lo mandamos a la pantalla de usuario
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
    // 1. Contenedor Base: Fondo gris y altura mínima. 
    // IMPORTANTE: No usamos d-flex aquí para evitar conflictos con el fixed sidebar.
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa", position: "relative" }}>
      
      {/* 2. Sidebar Fijo */}
      {/* El componente AdminSidebar ya tiene position: fixed y width: 260px */}
      <AdminSidebar user={user} />

      {/* 3. Contenido Principal */}
      <main
        style={{
          marginLeft: "260px", // Empujamos el contenido para no tapar la sidebar
          width: "auto",       // 'auto' hace que ocupe todo el ancho restante disponible
          minHeight: "100vh",  // Asegura que el área de contenido cubra la altura
          overflowX: "hidden", // Evita scroll horizontal indeseado
          display: "block"     // Aseguramos comportamiento de bloque
        }}
      >
        {/* Renderizamos los hijos directamente */}
        {children}
      </main>
    </div>
  );
}