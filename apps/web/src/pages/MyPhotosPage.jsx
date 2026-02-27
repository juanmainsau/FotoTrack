import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// IMPORTANTE: Importamos la misma lógica que usas en las otras pantallas
import { addImageToCart } from "../api/cart"; 

export default function MyPhotosPage() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingId, setAddingId] = useState(null); // Para mostrar loading en el botón específico
  const [message, setMessage] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchMyPhotos();
  }, []);

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

  // 🔹 Función corregida para agregar al carrito usando tu API real
  const handleAddToCart = async (photoId) => {
    try {
      setAddingId(photoId);
      // Usamos la función que ya sabemos que funciona en las otras pantallas
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

  return (
    <div className="p-4 p-md-5">
      {/* Alerta de feedback */}
      {message && (
        <div className="position-fixed top-0 start-50 translate-middle-x mt-4 z-3">
          <div className="alert alert-success shadow-lg border-0 rounded-pill px-4">
            {message}
          </div>
        </div>
      )}

      <div className="mb-4">
        <h2 className="fw-bold mb-1">Mis Fotos Encontradas 📸</h2>
        <p className="text-muted">
          La Inteligencia Artificial encontró <b>{photos.length}</b> coincidencias.
        </p>
      </div>

      {photos.length === 0 ? (
        <div className="text-center py-5 bg-white rounded-4 shadow-sm border">
          <h4 className="text-secondary">Aún no hay fotos detectadas</h4>
          <p className="text-muted">Asegurate de tener configurada tu selfie biométrica.</p>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
          {photos.map((photo) => (
            <div key={photo.idImagen} className="col">
              <div className="card h-100 shadow-sm border-0 rounded-4 overflow-hidden card-hover">
                
                <div className="position-relative" style={{ paddingTop: "75%" }}>
                  <img
                    src={photo.rutaOptimizado || photo.rutaMiniatura}
                    alt="Tu foto"
                    className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
                  />
                  <span className="badge bg-success position-absolute bottom-0 end-0 m-2 shadow-sm">
                    ✨ ¡Sos vos!
                  </span>
                </div>

                <div className="card-body">
                  <h6 className="card-title text-truncate fw-bold mb-1">{photo.nombreEvento}</h6>
                  <p className="text-muted small mb-3">
                    📅 {new Date(photo.fechaEvento).toLocaleDateString()}
                  </p>
                  
                  <div className="d-grid gap-2">
                    <button 
                      className="btn btn-primary btn-sm fw-bold rounded-pill"
                      onClick={() => handleAddToCart(photo.idImagen)}
                      disabled={addingId === photo.idImagen}
                    >
                      {addingId === photo.idImagen ? (
                        <span className="spinner-border spinner-border-sm"></span>
                      ) : "🛒 Comprar foto"}
                    </button>
                    
                    <button 
                      className="btn btn-outline-secondary btn-sm rounded-pill"
                      onClick={() => navigate(`/app/albums/${photo.idAlbum}`)}
                    >
                      👀 Ir al álbum
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