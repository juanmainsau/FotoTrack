import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchAlbums } from "../api/albums";
import axios from "axios";

export function MainscreenPage() {
  const navigate = useNavigate();

  const [albums, setAlbums] = useState([]);
  const [loadingAlbums, setLoadingAlbums] = useState(true);
  const [errorAlbums, setErrorAlbums] = useState(null);
  
  // Estado real del usuario
  const [usuario, setUsuario] = useState({ nombre: "Fotógrafo", stats: { fotos: 0, compras: 0 } });

  useEffect(() => {
    async function loadData() {
      try {
        setLoadingAlbums(true);
        const token = localStorage.getItem("fototrack-token");

        // 1. Obtener datos del usuario real
        if (token) {
          const userRes = await axios.get("http://localhost:4000/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (userRes.data?.user) {
            setUsuario(prev => ({ ...prev, nombre: userRes.data.user.nombre || "Usuario" }));
          }
        }

        // 2. Obtener Álbumes
        const data = await fetchAlbums();
        const visibles = data.filter(a => a.estado === "Publicado" && a.visibilidad === "Público");

        // Enriquecer con miniaturas (solo los últimos 3 para el dashboard)
        const ultimosAlbums = visibles.slice(0, 3);
        const enriched = await Promise.all(
          ultimosAlbums.map(async (album) => {
            try {
              const res = await fetch(`http://localhost:4000/api/imagenes/album/${album.idAlbum}`);
              const imgs = await res.json();
              return { ...album, img_portada: imgs.ok ? imgs.imagenes[0]?.rutaMiniatura : null };
            } catch {
              return { ...album, img_portada: null };
            }
          })
        );
        
        // Actualizamos estado (Guardamos total para stats, y los enriquecidos para mostrar)
        setUsuario(prev => ({ ...prev, stats: { ...prev.stats, albumes: visibles.length } }));
        setAlbums(enriched);
      } catch (err) {
        console.error(err);
        setErrorAlbums("No se pudieron cargar los datos recientes.");
      } finally {
        setLoadingAlbums(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="p-4 p-md-5 bg-light" style={{ minHeight: "100vh" }}>

      <div className="mb-5">
        <h2 className="fw-bolder mb-2 text-dark">¡Hola, {usuario.nombre}! 👋</h2>
        <p className="text-secondary fs-6">Bienvenido a tu panel. Desde aquí podés encontrar tus fotos con IA, explorar eventos y gestionar tus compras.</p>
      </div>

      {/* ---------- ACCESOS RAPIDOS (Mejorados) ---------- */}
      <h5 className="fw-bold mb-3 text-dark">¿Qué querés hacer hoy?</h5>
      <div className="row g-3 mb-5">
        <div className="col-6 col-md-3">
          <Link to="/app/my-photos" className="text-decoration-none">
            <div className="card border-0 shadow-sm rounded-4 h-100 text-center p-4 bg-primary text-white hover-zoom" style={{ transition: "transform 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"} onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}>
              <h2 className="display-5 mb-2">🙂</h2>
              <h6 className="fw-bold mb-0">Encontrar mis fotos</h6>
            </div>
          </Link>
        </div>
        <div className="col-6 col-md-3">
          <Link to="/app/albums" className="text-decoration-none">
            <div className="card border-0 shadow-sm rounded-4 h-100 text-center p-4 bg-white text-dark hover-zoom" style={{ transition: "transform 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"} onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}>
              <h2 className="display-5 mb-2">📸</h2>
              <h6 className="fw-bold mb-0 text-secondary">Explorar galería</h6>
            </div>
          </Link>
        </div>
        <div className="col-6 col-md-3">
          <Link to="/app/mis-compras" className="text-decoration-none">
            <div className="card border-0 shadow-sm rounded-4 h-100 text-center p-4 bg-white text-dark hover-zoom" style={{ transition: "transform 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"} onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}>
              <h2 className="display-5 mb-2">📦</h2>
              <h6 className="fw-bold mb-0 text-secondary">Mis compras</h6>
            </div>
          </Link>
        </div>
        <div className="col-6 col-md-3">
          <Link to="/app/cart" className="text-decoration-none">
            <div className="card border-0 shadow-sm rounded-4 h-100 text-center p-4 bg-white text-dark hover-zoom" style={{ transition: "transform 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"} onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}>
              <h2 className="display-5 mb-2">🛒</h2>
              <h6 className="fw-bold mb-0 text-secondary">Ir al carrito</h6>
            </div>
          </Link>
        </div>
      </div>


      {/* ---------- ALBUMES RECIENTES ---------- */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold text-dark mb-0">Eventos Recientes</h5>
        <Link to="/app/albums" className="text-primary text-decoration-none fw-semibold">Ver todos</Link>
      </div>

      {loadingAlbums ? (
        <div className="spinner-border text-primary" role="status"></div>
      ) : errorAlbums ? (
        <div className="alert alert-danger rounded-4 shadow-sm">{errorAlbums}</div>
      ) : albums.length === 0 ? (
        <div className="alert alert-secondary rounded-4 shadow-sm">No hay eventos recientes.</div>
      ) : (
        <div className="row g-4">
          {albums.map((album) => (
            <div key={album.idAlbum} className="col-md-4">
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
                {album.img_portada ? (
                  <img src={album.img_portada} className="card-img-top" style={{ height: "180px", objectFit: "cover" }} alt={album.nombreEvento} />
                ) : (
                  <div className="d-flex align-items-center justify-content-center bg-secondary text-white" style={{ height: "180px" }}>Sin imagen</div>
                )}
                <div className="card-body p-4">
                  <h6 className="card-title fw-bold text-truncate">{album.nombreEvento}</h6>
                  <p className="text-muted small mb-3">
                    {new Date(album.fechaEvento).toLocaleDateString("es-AR")} · {album.localizacion}
                  </p>
                  <button className="btn btn-outline-primary btn-sm w-100 fw-semibold rounded-pill" onClick={() => navigate(`/app/albums/${album.idAlbum}`)}>
                    Ver álbum
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}