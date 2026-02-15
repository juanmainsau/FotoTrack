import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function MyPhotosPage() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMyPhotos();
  }, []);

  const fetchMyPhotos = async () => {
    try {
      const token = localStorage.getItem("fototrack-token");
      if (!token) return;

      const res = await fetch("http://localhost:4000/api/users/me/photos", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

  if (loading) {
    return (
      <div className="p-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2 text-muted">Buscando tus recuerdos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-4 p-md-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Mis Fotos Encontradas 📸</h2>
          <p className="text-muted mb-0">
            La Inteligencia Artificial encontró {photos.length} fotos donde apareces.
          </p>
        </div>
      </div>

      {photos.length === 0 ? (
        <div className="text-center py-5 bg-light rounded shadow-sm">
          <h3>🤷‍♂️ Aún no te hemos visto</h3>
          <p className="text-muted">
            No hemos encontrado coincidencias en los álbumes públicos todavía.
            <br />
            ¡Asegúrate de que tu selfie de perfil sea clara!
          </p>
          <Link to="/profile" className="btn btn-outline-primary mt-3">
            Revisar mi Selfie
          </Link>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
          {photos.map((photo) => (
            <div key={photo.idImagen} className="col">
              <div className="card h-100 shadow-sm border-0 overflow-hidden">
                {/* Imagen con efecto hover simple */}
                <div style={{ position: "relative", paddingTop: "75%" /* Aspect Ratio 4:3 */ }}>
                  <img
                    src={photo.rutaOptimizado || photo.rutaMiniatura}
                    alt={`Foto del evento ${photo.nombreEvento}`}
                    className="card-img-top"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  {/* Badge de "Encontrada" */}
                  <span 
                    className="badge bg-success position-absolute" 
                    style={{ top: "10px", right: "10px", opacity: 0.9 }}
                  >
                    ✨ ¡Eres tú!
                  </span>
                </div>

                <div className="card-body">
                  <h6 className="card-title text-truncate fw-bold">
                    {photo.nombreEvento}
                  </h6>
                  <p className="card-text small text-muted">
                    📅 {new Date(photo.fechaEvento).toLocaleDateString()}
                  </p>
                  
                  <div className="d-grid gap-2">
                    {/* Botón para ver detalle o agregar al carrito */}
                    <button className="btn btn-sm btn-primary">
                      🛒 Comprar / Ver
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