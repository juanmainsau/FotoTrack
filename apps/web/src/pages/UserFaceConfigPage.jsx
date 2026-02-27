import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; 

export function UserFaceConfigPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [currentUserFoto, setCurrentUserFoto] = useState(null); // 👈 Para guardar la foto si ya tiene una
  
  const navigate = useNavigate();

  // 1. Cargar la foto que ya tiene en la base de datos (si existe)
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem("fototrack-token");
        if (!token) return;
        
        const res = await axios.get("http://localhost:4000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Si el backend nos devuelve que ya tiene foto_referencia, la mostramos
        if (res.data?.user?.foto_referencia) {
          setCurrentUserFoto(`http://localhost:4000${res.data.user.foto_referencia}`);
        }
      } catch (error) {
        console.error("Error al cargar datos del usuario:", error);
      }
    };
    loadUser();
  }, []);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      // Validamos que sea imagen
      if (!f.type.startsWith("image/")) {
        setResult({ type: "error", msg: "Por favor, selecciona un archivo de imagen válido." });
        return;
      }
      setFile(f);
      setPreview(URL.createObjectURL(f)); // Genera la vista previa al instante
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("selfie", file); // ⚠️ Debe llamarse "selfie" porque así lo configuramos en Multer

    try {
      const token = localStorage.getItem("fototrack-token");
      
      // 🚀 Llamamos a la nueva ruta que creamos
      const res = await axios.post("http://localhost:4000/api/auth/upload-selfie", formData, {
        headers: { 
          Authorization: `Bearer ${token}`
          // 🛑 MUY IMPORTANTE: NO pongas "Content-Type" aquí. Axios lo hace automáticamente con FormData.
        }
      });
      
      setResult({
        type: "success",
        msg: "¡Listo! Tu foto biométrica fue guardada con éxito."
      });

      // Actualizamos la foto en pantalla con la que nos devuelve el servidor
      if (res.data.url) {
         setCurrentUserFoto(`http://localhost:4000${res.data.url}`);
      }
      setFile(null); // Limpiamos el input
      
    } catch (err) {
      console.error("Error subiendo foto:", err);
      setResult({
        type: "error",
        msg: err.response?.data?.error || "Error al procesar tu rostro."
      });
    } finally {
      setLoading(false);
    }
  };

  // Decide qué imagen mostrar: la nueva que está subiendo, la que ya tenía, o nada.
  const displayImage = preview || currentUserFoto;

  return (
    <div className="container py-5" style={{ maxWidth: 700 }}>
      
      {/* HEADER */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h2 className="fw-bold mb-0">👁️ Reconocimiento Facial</h2>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate("/app/perfil")}>
           Volver al menú
        </button>
      </div>
      
      {/* TARJETA PRINCIPAL */}
      <div className="card shadow-sm mt-4 border-0 rounded-4">
        <div className="card-body text-center p-5">
          <h5 className="fw-semibold">Configura tu identidad biométrica</h5>
          <p className="text-muted small px-md-5">
            Sube una selfie clara donde solo aparezcas tú. 
            El sistema buscará tus fotos en todos los álbumes existentes.
          </p>

          {/* ÁREA DE PREVIEW (FOTO CIRCULAR) */}
          <div className="my-4 d-flex justify-content-center position-relative">
            <div style={{ width: "220px", height: "220px", borderRadius: "50%", overflow: "hidden", border: "5px solid #eee", backgroundColor: "#f8f9fa" }}>
              {displayImage ? (
                <img src={displayImage} alt="Selfie" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                  Sin foto
                </div>
              )}
            </div>
            {/* Cartelito verde flotante si ya tiene foto oficial */}
            {currentUserFoto && !preview && (
                <span className="position-absolute top-0 start-50 translate-middle-x badge rounded-pill bg-success border border-light" style={{ marginTop: "-10px" }}>
                  Configurado ✓
                </span>
            )}
          </div>

          {/* INPUT DE ARCHIVO */}
          <div className="mb-4 text-start">
            <label className="form-label fw-semibold">Seleccionar nueva foto</label>
            <input 
              type="file" 
              className="form-control form-control-lg bg-light" 
              accept="image/*" 
              onChange={handleFileChange} 
            />
          </div>

          {/* BOTÓN DE GUARDADO */}
          <button 
            className="btn btn-primary btn-lg w-100 fw-bold shadow-sm" 
            onClick={handleUpload} 
            disabled={!file || loading}
          >
            {loading ? (
              <><span className="spinner-border spinner-border-sm me-2"></span> Procesando rostro...</>
            ) : (
              "📸 Guardar y Activar Reconocimiento"
            )}
          </button>

          {/* MENSAJES DE ÉXITO O ERROR */}
          {result && (
            <div className={`alert mt-4 shadow-sm ${result.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
              {result.msg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserFaceConfigPage;