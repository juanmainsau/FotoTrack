// src/layouts/UserLayout.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Outlet, useNavigate } from "react-router-dom";
import { UserSidebar } from "../components/UserSidebar";

export function UserLayout() {
  const [user, setUser] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadUser() {
      try {
        const token = localStorage.getItem("fototrack-token");
        if (!token) return;

        const res = await axios.get("http://localhost:4000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data?.ok) {
          setUser(res.data.user);
        }
      } catch (err) {
        console.error("Error cargando usuario (USER):", err);
      }
    }
    loadUser();
  }, []);

  const isAdmin = user?.rol === 'admin' || localStorage.getItem("fototrack-rol") === "admin";

  return (
    <div style={{ minHeight: "100vh" }}>
      <UserSidebar user={user} />

      <main
        style={{
          marginLeft: "260px",
          padding: "20px",
          backgroundColor: "#fff",
          minHeight: "100vh",
        }}
      >
        <Outlet context={{ user }} />
      </main>

      {/* 🛠️ BOTÓN FLOTANTE INTELIGENTE CORREGIDO */}
      {isAdmin && (
        <button
          onClick={() => navigate("/admin")}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="btn btn-dark shadow-lg d-flex align-items-center p-0 border-primary"
          style={{
            position: "fixed",
            bottom: "30px",
            right: "30px",
            zIndex: 2000,
            borderRadius: "50px",
            width: isHovered ? "210px" : "56px",
            height: "56px",
            borderWidth: "2px",
            transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
            overflow: "hidden",
            whiteSpace: "nowrap"
          }}
        >
          {/* Contenedor del ícono:
            Le damos un ancho fijo de 52px (56px del botón - 4px de los bordes).
            Esto asegura que el ícono esté SIEMPRE centrado en el modo círculo.
          */}
          <div 
            className="d-flex align-items-center justify-content-center"
            style={{ 
              width: "52px", 
              minWidth: "52px",
              height: "100%"
            }}
          >
            <span style={{ fontSize: "1.4rem", lineHeight: 1 }}>🛠️</span>
          </div>

          {/* Texto: 
            Le agregamos un pequeño desplazamiento (transform) para que 
            "deslice" hacia adentro cuando aparece.
          */}
          <span style={{
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? "translateX(0)" : "translateX(-10px)",
            transition: "all 0.3s ease",
            fontSize: "0.95rem",
            fontWeight: "bold",
            pointerEvents: "none",
            paddingRight: "20px"
          }}>
            Panel de Control
          </span>
        </button>
      )}
    </div>
  );
}