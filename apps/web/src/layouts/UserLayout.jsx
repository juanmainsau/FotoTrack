// src/layouts/UserLayout.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Outlet } from "react-router-dom";
import { UserSidebar } from "../components/UserSidebar";

export function UserLayout() {
  const [user, setUser] = useState(null);

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

  return (
    <div style={{ minHeight: "100vh" }}>
      <UserSidebar user={user} />

      <main
        style={{
          marginLeft: "260px",  // ⭐ YA NO SE METE BAJO EL SIDEBAR
          padding: "20px",
          backgroundColor: "#fff",
          minHeight: "100vh",
        }}
      >
        <Outlet context={{ user }} />
      </main>
    </div>
  );
}
