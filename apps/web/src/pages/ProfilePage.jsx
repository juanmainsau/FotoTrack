// src/pages/ProfilePage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Estados para el Popup (Modal)
  const [showModal, setShowModal] = useState(false);
  const [editName, setEditName] = useState("");
  
  // 👈 NUEVOS ESTADOS SEPARADOS PARA EL DOCUMENTO
  const [editDocType, setEditDocType] = useState("DNI"); 
  const [editDocNumber, setEditDocNumber] = useState(""); 
  
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [navigate]);

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
        
        // 🧠 LÓGICA DE DESEMPAQUETADO: "CUIT: 20-12345678-9" -> Tipo y Número
        if (userData.cuit && userData.cuit.includes(": ")) {
          const parts = userData.cuit.split(": ");
          setEditDocType(parts[0]);
          setEditDocNumber(parts[1]);
        } else if (userData.cuit) {
          // Fallback por si había algún dato viejo guardado sin formato
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

  // 🎭 MÁSCARA DINÁMICA: Formatea el input en tiempo real según el tipo
  const handleDocNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, ""); // Borra todo lo que no sea número
    
    if (editDocType === "DNI") {
      value = value.slice(0, 8); // DNI máximo 8 dígitos
      setEditDocNumber(value);
    } else {
      // CUIT/CUIL máximo 11 dígitos y le inyectamos los guiones
      value = value.slice(0, 11);
      if (value.length > 2 && value.length <= 10) {
        value = `${value.slice(0, 2)}-${value.slice(2)}`;
      } else if (value.length > 10) {
        value = `${value.slice(0, 2)}-${value.slice(2, 10)}-${value.slice(10)}`;
      }
      setEditDocNumber(value);
    }
  };

  // 🧹 LIMPIEZA: Si cambia de DNI a CUIT, limpiamos para no dejar formatos cruzados
  const handleDocTypeChange = (e) => {
    setEditDocType(e.target.value);
    setEditDocNumber(""); 
  };

  // Función para guardar los cambios desde el Popup
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem("fototrack-token");
      
      // 📦 EMPAQUETADO: Unimos el tipo y el número para guardarlo en la BD
      const cuitCompleto = editDocNumber ? `${editDocType}: ${editDocNumber}` : null;

      const res = await fetch("http://localhost:4000/api/auth/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ nombre: editName, cuit: cuitCompleto }),
      });

      if (res.ok) {
        setUser({ ...user, nombre: editName, cuit: cuitCompleto });
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
        <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate("/app/perfil")}>
           Volver al menú
        </button>
      </div>

      <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
        <div style={{ height: "120px", background: "linear-gradient(135deg, #0d6efd 0%, #0dcaf0 100%)" }}></div>

        <div className="card-body px-5 pb-5 position-relative text-center">
          <div className="mb-4" style={{ marginTop: "-60px" }}>
            <img 
              src={user.foto || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.nombre) + "&background=random"} 
              alt="Perfil" 
              className="rounded-circle border border-4 border-white shadow-sm"
              style={{ width: "120px", height: "120px", objectFit: "cover", backgroundColor: "#fff" }}
            />
          </div>

          <h3 className="fw-bold mb-1">{user.nombre}</h3>
          <p className="text-muted mb-3">{user.correo}</p>

          <div className="d-flex justify-content-center gap-2 mb-4">
            <span className="badge bg-primary px-3 py-2 rounded-pill text-capitalize">Rol: {user.rol}</span>
            <span className={`badge px-3 py-2 rounded-pill text-capitalize ${user.estado === 'activo' ? 'bg-success' : 'bg-secondary'}`}>
              Estado: {user.estado || 'Activo'}
            </span>
          </div>

          <hr className="text-muted opacity-25" />

          {/* DATOS DEL USUARIO */}
          <div className="text-start mt-4">
            <h5 className="fw-semibold mb-3">Información de la Cuenta</h5>
            <div className="row g-3">
              <div className="col-sm-6">
                <div className="p-3 bg-light rounded-3 border">
                  <small className="text-muted d-block mb-1">Nombre Completo</small>
                  <strong className="d-block text-truncate">{user.nombre}</strong>
                </div>
              </div>
              <div className="col-sm-6">
                <div className="p-3 bg-light rounded-3 border">
                  <small className="text-muted d-block mb-1">Correo Electrónico</small>
                  <strong className="d-block text-truncate">{user.correo}</strong>
                </div>
              </div>
              
              <div className="col-sm-12">
                <div className="p-3 bg-light rounded-3 border">
                  <small className="text-muted d-block mb-1">Documento Tributario (Facturación)</small>
                  <strong className="d-block text-truncate">
                    {/* Al mostrarlo, ya dirá "CUIT: 20-35123456-9" o "DNI: 35123456" automáticamente */}
                    {user.cuit || <span className="text-muted fw-normal">No especificado</span>}
                  </strong>
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

      {/* ========================================== */}
      {/* 🪟 POPUP (MODAL) PARA EDITAR EL PERFIL */}
      {/* ========================================== */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold">Actualizar Datos</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              
              <div className="modal-body">
                <form onSubmit={handleSaveChanges}>
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-semibold">Nombre Completo</label>
                    <input 
                      type="text" 
                      className="form-control form-control-lg" 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                      minLength="3"
                    />
                  </div>

                  {/* 👈 NUEVO: INPUT GROUP CON SELECT Y MÁSCARA */}
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-semibold">Documento (Para Facturación)</label>
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
                        placeholder={editDocType === "DNI" ? "Ej: 35123456" : "Ej: 20-35123456-9"}
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="form-label text-muted small fw-semibold">Correo Electrónico (No editable)</label>
                    <input type="email" className="form-control text-muted bg-light" value={user.correo} disabled />
                  </div>

                  <div className="d-flex justify-content-end gap-2">
                    <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary px-4" disabled={saving}>
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