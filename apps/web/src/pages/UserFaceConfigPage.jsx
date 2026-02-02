import { useState } from "react";
import axios from "axios";
import { PageHeader } from "../components/PageHeader"; // Tu componente de título
// Asumo que tienes un Layout de usuario o usas el AdminLayout si es para probar
import { AdminLayout } from "../layouts/AdminLayout"; 

export function UserFaceConfigPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("selfie", file);

    try {
      const token = localStorage.getItem("fototrack-token");
      const res = await axios.post("http://localhost:4000/api/users/face-setup", formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data" 
        }
      });
      
      setResult({
        type: "success",
        msg: `¡Listo! Configuración guardada. Encontramos ${res.data.matches} fotos tuyas en álbumes anteriores.`
      });
    } catch (err) {
      console.error(err);
      setResult({
        type: "error",
        msg: err.response?.data?.error || "Error al procesar tu rostro."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    // Usa el Layout que corresponda a tu panel de usuario
    <div className="container p-4">
      <PageHeader titulo="Configurar Reconocimiento Facial" />
      
      <div className="card shadow-sm mt-4" style={{ maxWidth: "600px" }}>
        <div className="card-body text-center">
          <p className="text-muted">
            Sube una selfie clara donde solo aparezcas tú. 
            El sistema buscará tus fotos en todos los álbumes existentes y te avisará de los nuevos.
          </p>

          {/* Área de Preview */}
          <div className="my-4 d-flex justify-content-center">
            <div style={{ width: "200px", height: "200px", borderRadius: "50%", overflow: "hidden", border: "5px solid #eee", backgroundColor: "#f8f9fa" }}>
              {preview ? (
                <img src={preview} alt="Selfie" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                  Sin foto
                </div>
              )}
            </div>
          </div>

          <div className="mb-3">
            <input type="file" className="form-control" accept="image/*" onChange={handleFileChange} />
          </div>

          <button 
            className="btn btn-primary w-100 py-2 fw-bold" 
            onClick={handleUpload} 
            disabled={!file || loading}
          >
            {loading ? "Analizando rostro..." : "📸 Activar Reconocimiento"}
          </button>

          {result && (
            <div className={`alert mt-3 ${result.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
              {result.msg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}