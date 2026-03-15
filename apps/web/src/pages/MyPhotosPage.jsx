import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// IMPORTANTE: Importamos la misma lógica que usas en las otras pantallas
import { addImageToCart } from "../api/cart"; 
import toast from "react-hot-toast"; // Opcional: si usas toast, si no, se usa el message state

export default function MyPhotosPage() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const [addingId, setAddingId] = useState(null);
  const [message, setMessage] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchMyPhotos();
  }, []);

  // 📥 Obtener fotos desde el backend
  const fetchMyPhotos = async () => {
    try {
      const token = localStorage.getItem("fototrack-token");
      if (!token) return;

      const res = await fetch("http://localhost:4000/api/users/me/photos", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Error al obtener las fotos");

      const data = await res.json();
      if (data.ok) {
        setPhotos(data.photos);
      } else {
        setError(data.error);
      }
    } catch (err) {
      console.error(err);
      setError("Ocurrió un error al cargar tu galería.");
    } finally {
      setLoading(false);
    }
  };

  // 🚀 Búsqueda manual de IA
  const handleManualSearch = async () => {
    setSearching(true);
    try {
      const token = localStorage.getItem("fototrack-token");
      const res = await fetch("http://localhost:4000/api/auth/find-my-photos", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.ok) {
        setMessage(data.mensaje || "¡Búsqueda finalizada!");
        fetchMyPhotos();
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (err) {
      setMessage("❌ Error al conectar con el servidor de IA.");
    } finally {
      setSearching(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  // 🛡️ Confirmar o rechazar match pendiente
  const handleConfirmMatch = async (idImagen, esElUsuario) => {
    // ✋ Validación de seguridad: Si el usuario dice que "No es él", preguntamos antes de borrar
    if (!esElUsuario && !window.confirm("¿Seguro que no sos vos? Esta foto se quitará de tu galería personal.")) {
      return;
    }

    try {
      const token = localStorage.getItem("fototrack-token");
      const res = await fetch("http://localhost:4000/api/auth/confirm-match", {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ idImagen, esElUsuario })
      });

      if (res.ok) {
        setMessage(esElUsuario ? "¡Foto confirmada! 🎉" : "Sugerencia eliminada.");
        fetchMyPhotos();
      }
    } catch (err) {
      console.error("Error al confirmar match:", err);
    } finally {
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // 🛒 Agregar al carrito
  const handleAddToCart = async (photoId) => {
    try {
      setAddingId(photoId);
      await addImageToCart(photoId); 
      setMessage("¡Imagen agregada al carrito! 🛒");
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Error al agregar al carrito:", error);
      setMessage("❌ Error: No se pudo agregar la imagen.");
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setAddingId(null);
    }
  };

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: "60vh" }}>
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3 text-muted">Buscando tus fotos...</p>
      </div>
    );
  }

  const pendientes = photos.filter(p => p.estado === 'pendiente');
  const confirmadas = photos.filter(p => p.estado === 'confirmado');

  return (
    <div className="p-4 p-md-5">
      {/* Alerta de feedback superior */}
      {message && (
        <div className="position-fixed top-0 start-50 translate-middle-x mt-4 z-3" style={{minWidth: '300px'}}>
          <div className="alert alert-dark shadow-lg border-0 rounded-pill px-4 text-white text-center animate__animated animate__fadeInDown">
            {message}
          </div>
        </div>
      )}

      {/* Header con Título y Acción de Búsqueda */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-5 gap-3">
        <div>
          <h2 className="fw-bold mb-1">Mis Fotos Encontradas 📸</h2>
          <p className="text-muted mb-0">
            {confirmadas.length > 0 
              ? `Tenés ${confirmadas.length} fotos confirmadas en el sistema.`
              : "Subí tu selfie en el perfil para que la IA te encuentre automáticamente."}
          </p>
        </div>
        <button 
          className="btn btn-dark rounded-pill px-4 fw-bold shadow-sm"
          onClick={handleManualSearch}
          disabled={searching}
        >
          {searching ? (
            <><span className="spinner-grow spinner-grow-sm me-2"></span>Buscando...</>
          ) : (
            "🔍 Buscar nuevas fotos"
          )}
        </button>
      </div>

      {/* --- SECCIÓN DE FOTOS PENDIENTES (IA EN DUDA) --- */}
      {pendientes.length > 0 && (
        <div className="card border-0 shadow-sm rounded-4 mb-5" style={{ background: "#f0f7ff", border: "1px solid #cce3ff" }}>
          <div className="card-body p-4">
            <h5 className="fw-bold text-primary mb-1">🤔 ¿Sos vos en estas fotos?</h5>
            <p className="small text-muted mb-4">Ayudanos a entrenar a la IA confirmando si aparecés acá:</p>
            
            <div className="d-flex gap-4 overflow-auto pb-3" style={{ scrollbarWidth: "thin" }}>
              {pendientes.map(photo => (
                <div key={photo.idImagen} className="flex-shrink-0" style={{ width: '130px' }}>
                  <div className="position-relative mb-2 shadow-sm rounded-3 overflow-hidden border" style={{ height: '130px' }}>
                    <img 
                      src={photo.rutaMiniatura} 
                      className="w-100 h-100 object-fit-cover" 
                      alt="Sugerencia IA"
                    />
                  </div>
                  <div className="d-flex justify-content-center gap-2">
                    <button 
                      className="btn btn-success btn-sm rounded-circle shadow-sm"
                      onClick={() => handleConfirmMatch(photo.idImagen, true)}
                      title="Sí, soy yo"
                      style={{ width: '32px', height: '32px' }}
                    >✓</button>
                    <button 
                      className="btn btn-danger btn-sm rounded-circle shadow-sm"
                      onClick={() => handleConfirmMatch(photo.idImagen, false)}
                      title="No soy yo"
                      style={{ width: '32px', height: '32px' }}
                    >✕</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- GRILLA DE FOTOS CONFIRMADAS --- */}
      {confirmadas.length === 0 ? (
        <div className="text-center py-5 bg-white rounded-4 shadow-sm border mt-4">
          <div className="mb-3 display-6">📷</div>
          <h4 className="text-secondary">No encontramos fotos confirmadas</h4>
          <p className="text-muted mb-4 px-3">Si recién subiste tu selfie, probá con el botón de "Buscar nuevas fotos".</p>
          <button className="btn btn-outline-primary rounded-pill px-4" onClick={handleManualSearch}>
            Actualizar galería
          </button>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
          {confirmadas.map((photo) => (
            <div key={photo.idImagen} className="col">
              <div className="card h-100 shadow-sm border-0 rounded-4 overflow-hidden card-hover transition-all">
                
                <div className="position-relative" style={{ paddingTop: "85%" }}>
                  <img
                    src={photo.rutaOptimizado || photo.rutaMiniatura}
                    alt="Tu foto"
                    className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
                    loading="lazy"
                  />
                  
                  {/* ✨ Badge de éxito (Derecha) */}
                  <div className="position-absolute top-0 end-0 m-2">
                    <span className="badge bg-success shadow-sm rounded-pill px-3">
                      ✨ ¡Sos vos!
                    </span>
                  </div>

                  {/* ❗ BOTÓN: "No soy yo" (Izquierda) */}
                  <div className="position-absolute top-0 start-0 m-2">
                    <button 
                      className="btn btn-light btn-sm rounded-circle shadow-sm border-0 d-flex align-items-center justify-content-center"
                      style={{ width: '28px', height: '28px', opacity: '0.9', zIndex: 2 }}
                      title="No soy yo"
                      onClick={() => handleConfirmMatch(photo.idImagen, false)}
                    >
                      <span className="fw-bold text-danger" style={{ fontSize: '14px' }}>!</span>
                    </button>
                  </div>
                </div>

                <div className="card-body d-flex flex-column">
                  <h6 className="card-title text-truncate fw-bold mb-1">{photo.nombreEvento}</h6>
                  <p className="text-muted small mb-3">
                    📅 {new Date(photo.fechaEvento).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  
                  <div className="mt-auto d-grid gap-2">
                    <button 
                      className="btn btn-primary btn-sm fw-bold rounded-pill shadow-sm"
                      onClick={() => handleAddToCart(photo.idImagen)}
                      disabled={addingId === photo.idImagen}
                    >
                      {addingId === photo.idImagen ? (
                        <span className="spinner-border spinner-border-sm me-1"></span>
                      ) : "🛒 Comprar foto"}
                    </button>
                    
                    <button 
                      className="btn btn-light btn-sm rounded-pill border"
                      onClick={() => navigate(`/app/albums/${photo.idAlbum}`)}
                    >
                      Ir al álbum
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}