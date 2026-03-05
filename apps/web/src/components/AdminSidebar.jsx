// src/components/AdminSidebar.jsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

export function AdminSidebar({ user }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  const isActive = (path) =>
    pathname === path || pathname.startsWith(path)
      ? "fw-semibold text-primary bg-light"
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
          zIndex: 1000
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
            <Link to="/admin" className={`nav-link rounded ${isActive("/admin")}`}>
              📊 Dashboard
            </Link>

            <Link
              to="/admin/albums"
              className={`nav-link rounded ${isActive("/admin/albums")}`}
            >
              📸 Gestión de Álbumes
            </Link>

            {/* 💰 NUEVO: BOTÓN VENTAS */}
            <Link
              to="/admin/ventas"
              className={`nav-link rounded ${isActive("/admin/ventas")}`}
            >
              💰 Listado de Ventas
            </Link>

            <Link
              to="/admin/users"
              className={`nav-link rounded ${isActive("/admin/users")}`}
            >
              👥 Gestión de Usuarios
            </Link>

            <Link
              to="/admin/config"
              className={`nav-link rounded ${isActive("/admin/config")}`}
            >
              ⚙️ Configuración
            </Link>

            <Link
              to="/admin/reports"
              className={`nav-link rounded ${isActive("/admin/reports")}`}
            >
              📈 Reportes
            </Link>

            <Link
              to="/admin/audit"
              className={`nav-link rounded ${isActive("/admin/audit")}`}
            >
              🕵️ Auditoría
            </Link>

            <hr className="my-2" />

            <div className="small text-muted mb-1 ps-2">Acceso Rápido</div>

            {/* CORRECCIÓN: Las rutas de usuario deben ir a /app/..., no /admin/app/... */}

            <Link
              to="/app/albums"
              className="nav-link text-body"
            >
              🔍 Explorar como Usuario
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

            <div className="d-flex flex-column" style={{ maxWidth: "150px" }}>
              <span className="small fw-semibold text-truncate">{displayName}</span>
              {email && (
                <span className="small text-muted text-truncate" style={{ fontSize: "0.7rem" }}>
                  {email}
                </span>
              )}
            </div>
          </div>

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
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)", zIndex: 2000 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Cerrar Sesión</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowConfirm(false)}
                ></button>
              </div>
              <div className="modal-body">
                ¿Estás seguro de que deseas salir del panel de administración?
              </div>
              <div className="modal-footer border-0">
                <button className="btn btn-light" onClick={() => setShowConfirm(false)}>
                  Cancelar
                </button>
                <button className="btn btn-danger px-4" onClick={handleLogout}>
                  Salir ahora
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}