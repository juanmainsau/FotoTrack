// src/components/AdminSidebar.jsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

export function AdminSidebar({ user }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  const isActive = (path) =>
    pathname === path || pathname.startsWith(path)
      ? "fw-semibold text-primary"
      : "text-body";

  const handleLogout = () => {
    localStorage.removeItem("fototrack-token");
    localStorage.removeItem("fototrack-rol");
    navigate("/");
  };

  const displayName = user?.nombre || user?.correo || "Administrador";
  const email = user?.correo || "";
  const initial = (user?.nombre || user?.correo || "A")
    .charAt(0)
    .toUpperCase();
  const avatarUrl = user?.foto;

  return (
    <>
      <aside
        className="d-flex flex-column border-end"
        style={{
          width: "260px",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          backgroundColor: "#ffffff",
        }}
      >
        {/* HEADER */}
        <div className="p-4 border-bottom">
          <h4 className="fw-bold mb-1">📷 FotoTrack Admin</h4>
          <small className="text-muted">Panel de administración</small>
        </div>

        {/* NAV PRINCIPAL */}
        <div className="d-flex flex-column flex-grow-1 overflow-auto">
          <nav className="nav flex-column px-3 py-3 gap-1 small">
            <Link to="/admin" className={`nav-link ${isActive("/admin")}`}>
              📊 Dashboard
            </Link>

            <Link
              to="/admin/albums"
              className={`nav-link ${isActive("/admin/albums")}`}
            >
              📸 Álbumes
            </Link>

            <Link
              to="/admin/albums/nuevo"
              className={`nav-link ${isActive("/admin/albums/nuevo")}`}
            >
              ➕ Crear álbum
            </Link>

            {/* 🔧 NUEVO: BOTÓN CONFIGURACIÓN */}
            <Link
              to="/admin/config"
              className={`nav-link ${isActive("/admin/config")}`}
            >
              ⚙️ Configuración
            </Link>

            <Link
              to="/admin/users"
              className={`nav-link ${isActive("/admin/users")}`}
            >
              👥 Gestión de usuarios
            </Link>

            <Link
              to="/admin/reports"
              className={`nav-link ${isActive("/admin/reports")}`}
            >
              📈 Reportes
            </Link>

            <Link
              to="/admin/audit"
              className={`nav-link ${isActive("/admin/audit")}`}
            >
              🕵️ Auditoría del sistema
            </Link>

            <hr className="my-2" />

            <div className="small text-muted mb-1">Vista usuario</div>

            <Link
              to="/admin/app/mainscreen"
              className={`nav-link ${isActive("/admin/app/mainscreen")}`}
            >
              🏠 Inicio
            </Link>

            <Link
              to="/admin/app/albums"
              className={`nav-link ${isActive("/admin/app/albums")}`}
            >
              📸 Explorar álbumes
            </Link>
          </nav>
        </div>

        {/* BLOQUE USUARIO ABAJO */}
        <div
          className="border-top px-3 py-3 d-flex align-items-center justify-content-between"
          style={{ backgroundColor: "#f8f9fa" }}
        >
          <div className="d-flex align-items-center gap-2">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                className="d-flex align-items-center justify-content-center"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  backgroundColor: "#0d6efd",
                  color: "white",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                }}
              >
                {initial}
              </div>
            )}

            <div className="d-flex flex-column">
              <span className="small fw-semibold">{displayName}</span>
              {email && (
                <span className="small text-muted" style={{ fontSize: "0.75rem" }}>
                  {email}
                </span>
              )}
            </div>
          </div>

          {/* BOTÓN LOGOUT */}
          <button
            className="p-0 bg-transparent border-0 text-danger"
            onClick={() => setShowConfirm(true)}
            title="Cerrar sesión"
            style={{ fontSize: "1.2rem", cursor: "pointer" }}
          >
            ⏻
          </button>
        </div>
      </aside>

      {/* MODAL DE CONFIRMACIÓN */}
      {showConfirm && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.4)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmar cierre de sesión</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowConfirm(false)}
                ></button>
              </div>

              <div className="modal-body">¿Desea cerrar sesión?</div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowConfirm(false)}>
                  Cancelar
                </button>
                <button className="btn btn-danger" onClick={handleLogout}>
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
