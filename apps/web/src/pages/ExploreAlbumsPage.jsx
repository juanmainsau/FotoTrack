import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchAlbums } from "../api/albums";
import { addAlbumToCart } from "../api/cart";

export function ExploreAlbumsPage() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [albumImages, setAlbumImages] = useState({});
  const [message, setMessage] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [order, setOrder] = useState("recientes");

  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await fetchAlbums();
        const activos = data.filter(a => a.estado === "Publicado");
        setAlbums(activos);

        const imagesByAlbum = {};
        for (const album of activos) {
          try {
            const res = await fetch(`http://localhost:4000/api/imagenes/album/${album.idAlbum}`);
            const imgs = await res.json();
            const imagenes = imgs.ok ? imgs.imagenes : imgs;
            imagesByAlbum[album.idAlbum] = { count: imagenes.length, thumbnail: imagenes[0]?.rutaMiniatura || null };
          } catch {
            imagesByAlbum[album.idAlbum] = { count: 0, thumbnail: null };
          }
        }
        setAlbumImages(imagesByAlbum);
      } catch (err) {
        setError("No se pudieron cargar los álbumes.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleAddAlbum(album) {
    try {
      await addAlbumToCart(album.idAlbum);
      setMessage(`El álbum "${album.nombreEvento}" se agregó al carrito 👍`);
      setTimeout(() => setMessage(null), 3000);
    } catch {
      setMessage("❌ Error al agregar el álbum");
      setTimeout(() => setMessage(null), 3000);
    }
  }

  const filteredAlbums = useMemo(() => {
    let list = [...albums];
    if (searchText.trim()) {
      const text = searchText.toLowerCase();
      list = list.filter(a => a.nombreEvento.toLowerCase().includes(text) || (a.localizacion || "").toLowerCase().includes(text));
    }
    list.sort((a, b) => {
      if (order === "recientes") return new Date(b.fechaEvento) - new Date(a.fechaEvento);
      if (order === "antiguos") return new Date(a.fechaEvento) - new Date(b.fechaEvento);
      if (order === "nombre") return a.nombreEvento.localeCompare(b.nombreEvento);
      return 0;
    });
    return list;
  }, [albums, searchText, order]);

  return (
    <div className="d-flex flex-column bg-light" style={{ minHeight: "100vh" }}>
      <main className="flex-grow-1 p-4 p-md-5">
        
        {/* ALERTA FLOTANTE */}
        {message && (
          <div className="position-fixed top-0 start-50 translate-middle-x mt-4 z-3">
            <div className="alert alert-success shadow fw-bold px-4 py-3 rounded-pill">
              {message}
            </div>
          </div>
        )}

        <section className="mb-5 text-center text-md-start">
          <h1 className="fw-bolder text-dark mb-2">Explorar Álbumes</h1>
          <p className="text-secondary fs-5">Encontrá tu evento, reviví los momentos y llevate tus fotos.</p>
        </section>

        {/* BARRA DE BÚSQUEDA Y FILTROS */}
        <section className="bg-white p-3 rounded-4 shadow-sm mb-5 d-flex flex-column flex-md-row gap-3">
          <input 
            type="text" 
            className="form-control form-control-lg border-light bg-light w-100" 
            placeholder="🔍 Buscar por nombre o ubicación..." 
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <select 
            className="form-select form-select-lg border-light bg-light" 
            style={{ minWidth: "200px" }}
            value={order} 
            onChange={(e) => setOrder(e.target.value)}
          >
            <option value="recientes">Más recientes</option>
            <option value="antiguos">Más antiguos</option>
            <option value="nombre">Orden alfabético</option>
          </select>
        </section>

        <section>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : error ? (
            <div className="alert alert-danger rounded-4 shadow-sm">{error}</div>
          ) : filteredAlbums.length === 0 ? (
            <div className="text-center py-5 bg-white rounded-4 shadow-sm">
              <h4 className="text-muted fw-bold">No se encontraron resultados</h4>
              <p className="text-muted">Prueba buscando con otros términos.</p>
            </div>
          ) : (
            <div className="row g-4">
              {filteredAlbums.map((album) => {
                const imgData = albumImages[album.idAlbum] ?? { count: 0, thumbnail: null };

                return (
                  <div key={album.idAlbum} className="col-12 col-md-6 col-lg-4">
                    <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden h-100" style={{ transition: "transform 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"} onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}>
                      
                      <div className="position-relative">
                        {imgData.thumbnail ? (
                          <img src={imgData.thumbnail} alt={album.nombreEvento} style={{ width: "100%", height: "200px", objectFit: "cover" }} />
                        ) : (
                          <div className="d-flex align-items-center justify-content-center bg-secondary text-white" style={{ width: "100%", height: "200px" }}>
                            <small>Sin fotos aún</small>
                          </div>
                        )}
                        <span className="badge bg-dark position-absolute top-0 end-0 m-3 px-3 py-2 rounded-pill shadow-sm">
                          📷 {imgData.count} fotos
                        </span>
                      </div>

                      <div className="card-body d-flex flex-column p-4">
                        <h5 className="fw-bold text-dark mb-1 text-truncate">{album.nombreEvento}</h5>
                        <p className="text-muted small mb-4">
                          <i className="bi bi-calendar-event me-1"></i> {new Date(album.fechaEvento).toLocaleDateString("es-AR")} <br/>
                          <i className="bi bi-geo-alt me-1"></i> {album.localizacion || "Ubicación no especificada"}
                        </p>

                        <div className="mt-auto d-flex flex-column gap-2">
                          <button 
                            className="btn btn-primary fw-semibold rounded-pill py-2"
                            onClick={() => navigate(`/app/albums/${album.idAlbum}`)}
                          >
                            Ver galería completa
                          </button>
                          <button 
                            className="btn btn-outline-secondary fw-semibold rounded-pill py-2"
                            onClick={() => handleAddAlbum(album)}
                          >
                            🛒 Comprar Álbum (${album.precioAlbum || "0"})
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}