// src/pages/UserProfilePage.jsx
import { useNavigate } from "react-router-dom";
import { useOutletContext } from "react-router-dom";

export default function UserProfilePage() {
  const { user } = useOutletContext();
  const navigate = useNavigate(); // ← AGREGADO

  const handleLogout = () => {
    localStorage.removeItem("fototrack-token");
    localStorage.removeItem("fototrack-user");
    navigate("/");
  };

  return (
    <div
      style={{
        marginLeft: "160px", // ⭐ SOLO AFECTA ESTA PANTALLA
        maxWidth: "1100px",
        padding: "40px 20px",
      }}
      className="mx-auto"
    >
      {/* ENCABEZADO */}
      <div className="text-center mb-5">
        <img
          src={user?.foto}
          alt={user?.nombre}
          style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            objectFit: "cover",
            marginBottom: 20,
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
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/app/mis-compras")} // ← CORREGIDO
        >
          <h5 className="fw-bold">Mis compras</h5>
          <p className="text-muted small">
            Historial de compras realizadas en FotoTrack.
          </p>
        </div>

        {/* INFORMACIÓN DE PERFIL */}
        <div className="p-4 shadow-sm rounded bg-white">
          <h5 className="fw-bold">Información de perfil</h5>
          <p className="text-muted small">Datos personales de tu cuenta.</p>
        </div>

        {/* CERRAR SESIÓN */}
        <div
          className="p-4 shadow-sm rounded bg-white"
          style={{ cursor: "pointer", border: "1px solid #ffdddd" }}
          onClick={handleLogout}
        >
          <h5 className="fw-bold text-danger">Cerrar sesión</h5>
          <p className="text-muted small">Salir de tu cuenta.</p>
        </div>
      </div>
    </div>
  );
}
