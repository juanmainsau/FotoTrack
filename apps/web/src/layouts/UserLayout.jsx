// src/layouts/UserLayout.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { UserSidebar } from "../components/UserSidebar";

export function UserLayout({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const token = localStorage.getItem("fototrack-token");
        if (!token) return;

        const res = await axios.get("http://localhost:4000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.data?.ok) {
          setUser(res.data.user);
        }
      } catch (err) {
        console.error("Error cargando usuario (USER):", err);
        localStorage.removeItem("fototrack-token");
        localStorage.removeItem("fototrack-user");
      }
    }

    loadUser();
  }, []);

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <UserSidebar user={user} />

      <main
        className="flex-grow-1"
        style={{ padding: "24px", marginLeft: "260px" }}
      >
        {children}
      </main>
    </div>
  );
}
