// src/pages/ProfilePage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDocType, setEditDocType] = useState("DNI");
  const [editDocNumber, setEditDocNumber] = useState("");
  const [editTelefono, setEditTelefono] = useState("");
  const [editConsentimientoRF, setEditConsentimientoRF] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [navigate]);

  const validarFormatoDocumento = (tipo, numero) => {
    if (!numero) return true;

    if (tipo === "DNI") {
      return /^[0-9]{7,8}$/.test(numero);
    }

    return /^(20|23|24|27|30|33)-[0-9]{8}-[0-9]{1}$/.test(numero);
  };

  const validarTelefono = (telefono) => {
    if (!telefono) return true;
    return /^\+?[0-9]{10,15}$/.test(telefono.replace(/\s/g, ""));
  };

  async function loadProfile() {
    try {
      const token = localStorage.getItem("fototrack-token");

      if (!token) {
        navigate("/login");
        return;
      }

      const res = await fetch("http://localhost:4000/api/auth/me", {
        headers: { Authorization: "Bearer " + token },
      });

      const data = await res.json();

      if (res.ok) {
        const userData = data.usuario || data.user || data;

        setUser(userData);
        setEditName(userData.nombre || "");
        setEditTelefono(userData.telefono || "");
        setEditConsentimientoRF(Boolean(userData.consentimientoRF));

        if (userData.cuit && userData.cuit.includes(": ")) {
          const parts = userData.cuit.split(": ");
          setEditDocType(parts[0]);
          setEditDocNumber(parts[1]);
        } else if (userData.cuit) {
          setEditDocType("DNI");
          setEditDocNumber(userData.cuit);
        }
      }
    } catch (err) {
      console.error("Error cargando perfil:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteAccount = async () => {
    const confirmacion = window.confirm(
      "⚠️ ¿ESTÁS SEGURO? Esta acción es irreversible. Se borrarán tus datos de acceso y perderás el historial de tus fotos compradas. ¿Deseas continuar?"
    );

    if (!confirmacion) return;

    try {
      const token = localStorage.getItem("fototrack-token");

      const res = await fetch("http://localhost:4000/api/users/me", {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
      });

      if (res.ok) {
        alert("Tu cuenta ha sido eliminada. Gracias por usar FotoTrack.");
        localStorage.removeItem("fototrack-token");
        navigate("/login");
      } else {
        const data = await res.json();
        alert(data.error || "No se pudo eliminar la cuenta.");
      }
    } catch {
      alert("Error de conexión al intentar eliminar la cuenta.");
    }
  };

  const handleDocNumberChange = (e) => {
    let value = e.target.value.replace(/[^\d-]/g, "");

    if (editDocType === "DNI") {
      value = value.replace(/\D/g, "").slice(0, 8);
      setEditDocNumber(value);
    } else {
      let digits = value.replace(/\D/g, "").slice(0, 11);
      let formatted = digits;

      if (digits.length > 2 && digits.length <= 10) {
        formatted = `${digits.slice(0, 2)}-${digits.slice(2)}`;
      } else if (digits.length > 10) {
        formatted = `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10)}`;
      }

      setEditDocNumber(formatted);
    }
  };

  const handleDocTypeChange = (e) => {
    setEditDocType(e.target.value);
    setEditDocNumber("");
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();

    if (!validarFormatoDocumento(editDocType, editDocNumber)) {
      const msg =
        editDocType === "DNI"
          ? "El DNI debe tener entre 7 y 8 números."
          : `El formato de ${editDocType} es inválido (Ej: 20-12345678-9).`;

      alert(msg);
      return;
    }

    if (!validarTelefono(editTelefono)) {
      alert("El teléfono debe incluir código de país. Ejemplo: +5493764123456");
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem("fototrack-token");

      const cuitCompleto = editDocNumber
        ? `${editDocType}: ${editDocNumber}`
        : null;

      const telefonoFinal = editTelefono.trim() || null;

      const res = await fetch("http://localhost:4000/api/auth/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          nombre: editName,
          cuit: cuitCompleto,
          telefono: telefonoFinal,
          consentimientoRF: editConsentimientoRF,
        }),
      });

      if (res.ok) {
        setUser({
          ...user,
          nombre: editName,
          cuit: cuitCompleto,
          telefono: telefonoFinal,
          consentimientoRF: editConsentimientoRF,
        });

        setShowModal(false);
      } else {
        const data = await res.json();
        throw new Error(data.error || "No se pudo actualizar");
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container py-5" style={{ maxWidth: 700 }}>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h2 className="fw-bold mb-0">👤 Mi Perfil</h2>

        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => navigate("/app")}
        >
          Volver al menú
        </button>
      </div>

      <div className="card border-0 shadow-lg rounded-4 overflow-hidden mb-4">
        <div
          style={{
            height: "120px",
            background: "linear-gradient(135deg, #0d6efd 0%, #0dcaf0 100%)",
          }}
        ></div>

        <div className="card-body px-5 pb-5 position-relative text-center">
          <div className="mb-4" style={{ marginTop: "-60px" }}>
            <img
              src={
                user.foto ||
                "https://ui-avatars.com/api/?name=" +
                  encodeURIComponent(user.nombre || "Usuario") +
                  "&background=random"
              }
              alt="Perfil"
              className="rounded-circle border border-4 border-white shadow-sm"
              style={{
                width: "120px",
                height: "120px",
                objectFit: "cover",
                backgroundColor: "#fff",
              }}
            />
          </div>

          <h3 className="fw-bold mb-1">{user.nombre}</h3>
          <p className="text-muted mb-3">{user.correo}</p>

          <div className="d-flex justify-content-center gap-2 mb-4">
            <span className="badge bg-primary px-3 py-2 rounded-pill text-capitalize">
              Rol: {user.rol}
            </span>

            <span
              className={`badge px-3 py-2 rounded-pill text-capitalize ${
                user.estado === "activo" ? "bg-success" : "bg-secondary"
              }`}
            >
              Estado: {user.estado || "Activo"}
            </span>
          </div>

          <hr className="text-muted opacity-25" />

          <div className="text-start mt-4">
            <h5 className="fw-semibold mb-3">Información de la Cuenta</h5>

            <div className="row g-3">
              <div className="col-sm-6">
                <div className="p-3 bg-light rounded-3 border">
                  <small className="text-muted d-block mb-1">
                    Nombre Completo
                  </small>
                  <strong className="d-block text-truncate">
                    {user.nombre}
                  </strong>
                </div>
              </div>

              <div className="col-sm-6">
                <div className="p-3 bg-light rounded-3 border">
                  <small className="text-muted d-block mb-1">
                    Correo Electrónico
                  </small>
                  <strong className="d-block text-truncate">
                    {user.correo}
                  </strong>
                </div>
              </div>

              <div className="col-sm-12">
                <div className="p-3 bg-light rounded-3 border">
                  <small className="text-muted d-block mb-1">
                    Documento Tributario (Facturación)
                  </small>
                  <strong className="d-block text-truncate">
                    {user.cuit || (
                      <span className="text-muted fw-normal">
                        No especificado
                      </span>
                    )}
                  </strong>
                </div>
              </div>

              <div className="col-sm-12">
                <div className="p-3 bg-light rounded-3 border">
                  <small className="text-muted d-block mb-1">
                    WhatsApp para notificaciones
                  </small>
                  <strong className="d-block text-truncate">
                    {user.telefono || (
                      <span className="text-muted fw-normal">
                        No especificado
                      </span>
                    )}
                  </strong>
                  <small className="text-muted d-block mt-1">
                    {user.consentimientoRF
                      ? "Notificaciones por reconocimiento facial activadas."
                      : "Notificaciones por reconocimiento facial desactivadas."}
                  </small>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 d-flex justify-content-center">
            <button
              className="btn btn-primary px-5 py-2 fw-semibold shadow-sm"
              onClick={() => setShowModal(true)}
            >
              ✏️ Editar Perfil
            </button>
          </div>
        </div>
      </div>

      <div className="card border-danger bg-light rounded-4 overflow-hidden border-opacity-25 shadow-sm">
        <div className="card-body p-4 d-flex align-items-center justify-content-between">
          <div>
            <h6 className="fw-bold text-danger mb-1">Zona de peligro</h6>
            <p className="small text-muted mb-0">
              Eliminar tu cuenta borrará tus fotos compradas permanentemente.
            </p>
          </div>

          <button
            className="btn btn-outline-danger btn-sm fw-bold"
            onClick={handleDeleteAccount}
          >
            Eliminar mi cuenta
          </button>
        </div>
      </div>

      {showModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold">Actualizar Datos</h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <div className="modal-body">
                <form onSubmit={handleSaveChanges}>
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-semibold">
                      Nombre Completo
                    </label>

                    <input
                      type="text"
                      className="form-control form-control-lg"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                      minLength="3"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-muted small fw-semibold">
                      Documento (Para Facturación)
                    </label>

                    <div className="input-group input-group-lg shadow-sm">
                      <select
                        className="form-select bg-light text-dark fw-bold border-end-0"
                        style={{ maxWidth: "110px", cursor: "pointer" }}
                        value={editDocType}
                        onChange={handleDocTypeChange}
                      >
                        <option value="DNI">DNI</option>
                        <option value="CUIT">CUIT</option>
                        <option value="CUIL">CUIL</option>
                      </select>

                      <input
                        type="text"
                        className="form-control"
                        value={editDocNumber}
                        onChange={handleDocNumberChange}
                        placeholder={
                          editDocType === "DNI"
                            ? "Ej: 35123456"
                            : "Ej: 20-35123456-9"
                        }
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-muted small fw-semibold">
                      WhatsApp para notificaciones
                    </label>

                    <input
                      type="text"
                      className="form-control form-control-lg"
                      value={editTelefono}
                      onChange={(e) => setEditTelefono(e.target.value)}
                      placeholder="Ej: +5493764123456"
                    />

                    <div className="form-text">
                      Usá código de país. Para Argentina: +54 9 + característica + número.
                    </div>
                  </div>

                  <div className="form-check form-switch mb-4">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="consentimientoRF"
                      checked={editConsentimientoRF}
                      onChange={(e) => setEditConsentimientoRF(e.target.checked)}
                    />

                    <label
                      className="form-check-label small text-muted"
                      htmlFor="consentimientoRF"
                    >
                      Recibir avisos por WhatsApp cuando FotoTrack detecte mi
                      rostro en nuevas fotografías.
                    </label>
                  </div>

                  <div className="mb-4">
                    <label className="form-label text-muted small fw-semibold">
                      Correo Electrónico (No editable)
                    </label>

                    <input
                      type="email"
                      className="form-control text-muted bg-light"
                      value={user.correo}
                      disabled
                    />
                  </div>

                  <div className="d-flex justify-content-end gap-2">
                    <button
                      type="button"
                      className="btn btn-light"
                      onClick={() => setShowModal(false)}
                    >
                      Cancelar
                    </button>

                    <button
                      type="submit"
                      className="btn btn-primary px-4"
                      disabled={saving}
                    >
                      {saving ? "Guardando..." : "Guardar Cambios"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;