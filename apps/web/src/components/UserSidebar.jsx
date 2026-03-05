// src/components/UserSidebar.jsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

export function UserSidebar({ user }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  const isActive = (path) =>
    pathname === path || pathname.startsWith(path)
      ? "fw-semibold text-success bg-white shadow-sm rounded"
      : "text-body";

  const handleLogout = () => {
    localStorage.removeItem("fototrack-token");
    localStorage.removeItem("fototrack-user");
    localStorage.removeItem("fototrack-rol"); // Por las dudas
    navigate("/");
  };

  const displayName = user?.nombre || user?.correo || "Usuario";
  const email = user?.correo || "";
  const initial = (user?.nombre || user?.correo || "U").charAt(0).toUpperCase();
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
          backgroundColor: "#f8f9fa",
          zIndex: 1000
        }}
      >
        <div className="p-4 border-bottom">
          <h4 className="fw-bold mb-0 text-success">FotoTrack</h4>
          <small className="text-muted">Panel del usuario</small>
        </div>

        <div className="d-flex flex-column flex-grow-1 overflow-auto">
          <nav className="nav flex-column px-3 py-3 gap-1 small">
            <Link to="/app/mainscreen" className={`nav-link ${isActive("/app/mainscreen")}`}>
              🏠 Inicio
            </Link>

            <Link to="/app/albums" className={`nav-link ${isActive("/app/albums")}`}>
              📸 Galería de álbumes
            </Link>

            <Link to="/app/my-photos" className={`nav-link ${isActive("/app/my-photos")}`}>
              🙂 Mis fotos
            </Link>

            <Link to="/app/cart" className={`nav-link ${isActive("/app/cart")}`}>
              🛒 Carrito
            </Link>

            <Link to="/app/perfil" className={`nav-link ${isActive("/app/perfil")}`}>
              ⚙️ Mi perfil
            </Link>
          </nav>
        </div>

        {/* ======================================= */}
        {/* BLOQUE USUARIO IGUALADO A ADMIN SIDEBAR */}
        {/* ======================================= */}
        <div className="border-top px-3 py-3 d-flex align-items-center justify-content-between position-relative bg-white">
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
                  backgroundColor: "#0b6623", // Verde característico del usuario
                  color: "white",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                }}
              >
                {initial}
              </div>
            )}

            {/* Este contenedor ahora tiene max-width y truncate como en Admin */}
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
            style={{ fontSize: "1.2rem", cursor: "pointer" }}
            onClick={() => setShowConfirm(true)}
            title="Cerrar sesión"
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
                <h5 className="modal-title fw-bold">Confirmar cierre de sesión</h5>
                <button className="btn-close" onClick={() => setShowConfirm(false)}></button>
              </div>

              <div className="modal-body">¿Desea cerrar sesión?</div>

              <div className="modal-footer border-0">
                <button className="btn btn-light" onClick={() => setShowConfirm(false)}>
                  Cancelar
                </button>
                <button className="btn btn-danger px-4" onClick={handleLogout}>
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