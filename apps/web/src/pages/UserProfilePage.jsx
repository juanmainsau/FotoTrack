// src/pages/UserProfilePage.jsx
import { useNavigate } from "react-router-dom";
import { useOutletContext } from "react-router-dom";

export default function UserProfilePage() {
  const { user } = useOutletContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("fototrack-token");
    localStorage.removeItem("fototrack-user");
    navigate("/");
  };

  return (
    <div
      style={{
        marginLeft: "160px", 
        maxWidth: "1100px",
        padding: "40px 20px",
      }}
      className="mx-auto"
    >
      {/* ENCABEZADO */}
      <div className="text-center mb-5">
        <img
          src={user?.foto || "https://via.placeholder.com/150"} // Fallback por si no hay foto
          alt={user?.nombre}
          style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            objectFit: "cover",
            marginBottom: 20,
            border: "4px solid white",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
          }}
        />

        <h2 className="fw-bold">{user?.nombre}</h2>
        <p className="text-muted">{user?.correo}</p>

        <span className="badge bg-primary-subtle text-primary px-3 py-2">
          Rol: {user?.rol}
        </span>
      </div>

      <hr />

      {/* GRID DE OPCIONES */}
      <div
        className="d-grid"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "25px",
          marginTop: "40px",
        }}
      >
        {/* MIS COMPRAS */}
        <div
          className="p-4 shadow-sm rounded bg-white"
          style={{ cursor: "pointer", transition: "transform 0.2s" }}
          onClick={() => navigate("/app/mis-compras")}
        >
          <div className="mb-2 text-primary">
            <i className="bi bi-bag-check fs-2"></i>
          </div>
          <h5 className="fw-bold">Mis compras</h5>
          <p className="text-muted small mb-0">
            Historial de compras realizadas en FotoTrack.
          </p>
        </div>

        {/* ⭐ NUEVO: RECONOCIMIENTO FACIAL */}
        <div
          className="p-4 shadow-sm rounded bg-white"
          style={{ cursor: "pointer", transition: "transform 0.2s" }}
          onClick={() => navigate("/app/configuracion-facial")}
        >
          <div className="mb-2 text-primary">
            <i className="bi bi-upc-scan fs-2"></i> {/* Icono de escaneo */}
          </div>
          <h5 className="fw-bold">Reconocimiento Facial</h5>
          <p className="text-muted small mb-0">
            Configura tu selfie para encontrar tus fotos automáticamente en los álbumes.
          </p>
        </div>

        {/* INFORMACIÓN DE PERFIL */}
        <div className="p-4 shadow-sm rounded bg-white">
          <div className="mb-2 text-secondary">
             <i className="bi bi-person-vcard fs-2"></i>
          </div>
          <h5 className="fw-bold">Información de perfil</h5>
          <p className="text-muted small mb-0">Datos personales de tu cuenta.</p>
        </div>

        {/* CERRAR SESIÓN */}
        <div
          className="p-4 shadow-sm rounded bg-white"
          style={{ cursor: "pointer", border: "1px solid #ffdddd" }}
          onClick={handleLogout}
        >
          <div className="mb-2 text-danger">
             <i className="bi bi-box-arrow-right fs-2"></i>
          </div>
          <h5 className="fw-bold text-danger">Cerrar sesión</h5>
          <p className="text-muted small mb-0">Salir de tu cuenta.</p>
        </div>
      </div>
    </div>
  );
}