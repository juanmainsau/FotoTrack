// apps/web/src/pages/MainscreenPage.jsx

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchAlbums } from "../api/albums";

export function MainscreenPage() {
  const navigate = useNavigate();

  const [albums, setAlbums] = useState([]);
  const [loadingAlbums, setLoadingAlbums] = useState(true);
  const [errorAlbums, setErrorAlbums] = useState(null);

  const nombreUsuario = "Juanma"; // Luego vendrá del backend

  useEffect(() => {
    async function load() {
      try {
        setLoadingAlbums(true);

        // 1️⃣ Obtener lista de álbumes
        const data = await fetchAlbums();

        // 2️⃣ Obtener miniaturas como en ExploreAlbumsPage
        const enrichedAlbums = await Promise.all(
          data.map(async (album) => {
            try {
              const res = await fetch(
                `http://localhost:4000/api/imagenes/album/${album.idAlbum}`
              );
              const imgs = await res.json();

              return {
                ...album,
                img_portada: imgs[0]?.rutaMiniatura || null,
              };
            } catch {
              return { ...album, img_portada: null };
            }
          })
        );

        setAlbums(enrichedAlbums);
      } catch (err) {
        console.error(err);
        setErrorAlbums("No se pudieron cargar los álbumes.");
      } finally {
        setLoadingAlbums(false);
      }
    }

    load();
  }, []);

  return (
    <div className="p-4 p-md-5">

      {/* Saludo */}
      <h2 className="fw-bold mb-2">Hola, {nombreUsuario}</h2>
      <p className="text-muted mb-4">
        Desde aquí vas a poder explorar álbumes, encontrar tus fotos mediante reconocimiento
        facial y revisar tus compras.
      </p>

      {/* Resumen numérico */}
      <div className="row g-3 mb-4">
        
        {/* Álbumes disponibles */}
        <div className="col-12 col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="text-muted small mb-1">Álbumes disponibles</div>
              <div className="h4 mb-0">{albums.length}</div>
            </div>
          </div>
        </div>

        {/* Fotos detectadas */}
        <div className="col-12 col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="text-muted small mb-1">Fotos detectadas para vos</div>
              <div className="h4 mb-0">0</div>
              <small className="text-muted">reconocimiento facial</small>
            </div>
          </div>
        </div>

        {/* Compras realizadas */}
        <div className="col-12 col-md-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="text-muted small mb-1">Compras realizadas</div>
              <div className="h4 mb-0">0</div>
              <small className="text-muted">entrega automática por correo</small>
            </div>
          </div>
        </div>
      </div>

      {/* Accesos rápidos */}
      <h5 className="fw-semibold mb-3">Accesos rápidos</h5>
      <div className="row g-3 mb-4">
        
        {/* Explorar álbums */}
        <div className="col-12 col-md-3">
          <button
            className="btn w-100 text-start border-0 shadow-sm py-3"
            onClick={() => navigate("/app/albums")}
          >
            <div className="fw-semibold">📸 Explorar álbumes</div>
            <small className="text-muted">Navegá por los eventos publicados.</small>
          </button>
        </div>

        {/* Mis fotos IA */}
        <div className="col-12 col-md-3">
          <button
            className="btn w-100 text-start border-0 shadow-sm py-3"
            onClick={() => navigate("/app/my-photos")}
          >
            <div className="fw-semibold">🙂 Encontrar mis fotos</div>
            <small className="text-muted">Reconocimiento facial.</small>
          </button>
        </div>

        {/* Mis compras */}
        <div className="col-12 col-md-3">
          <button
            className="btn w-100 text-start border-0 shadow-sm py-3"
            onClick={() => navigate("/app/purchases")}
          >
            <div className="fw-semibold">🧾 Mis compras</div>
            <small className="text-muted">Historial de pedidos.</small>
          </button>
        </div>

        {/* Carrito */}
        <div className="col-12 col-md-3">
          <button
            className="btn w-100 text-start border-0 shadow-sm py-3"
            onClick={() => navigate("/app/cart")}
          >
            <div className="fw-semibold">🛒 Carrito</div>
            <small className="text-muted">Revisá tu compra.</small>
          </button>
        </div>
      </div>

      {/* Álbumes recientes */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-semibold mb-0">Álbumes recientes</h5>

        <Link to="/app/albums" className="btn btn-link btn-sm text-decoration-none">
          Ver todos los álbumes
        </Link>
      </div>

      {loadingAlbums ? (
        <div className="alert alert-secondary">Cargando álbumes...</div>
      ) : errorAlbums ? (
        <div className="alert alert-danger">{errorAlbums}</div>
      ) : albums.length === 0 ? (
        <div className="alert alert-info">Aún no hay álbumes disponibles.</div>
      ) : (
        <div className="row g-3">
          {albums.map((album) => (
            <div key={album.idAlbum} className="col-12 col-md-4 col-lg-3">
              <div className="card border-0 shadow-sm h-100">

                {/* Miniatura real */}
                <div
                  style={{
                    width: "100%",
                    paddingTop: "60%",
                    backgroundImage: album.img_portada
                      ? `url(${album.img_portada})`
                      : "linear-gradient(135deg, #0b6623, #2eb897)",
                    backgroundSize: album.img_portada ? "cover" : "auto",
                    backgroundPosition: "center",
                    borderTopLeftRadius: "0.5rem",
                    borderTopRightRadius: "0.5rem",
                  }}
                ></div>

                <div className="card-body">
                  <h6 className="fw-semibold mb-1">{album.nombreEvento}</h6>
                  <small className="text-muted">
                    {new Date(album.fechaEvento).toLocaleDateString("es-AR")} · {album.localizacion}
                  </small>

                  <button
                    className="btn btn-outline-secondary btn-sm mt-2"
                    onClick={() => navigate(`/app/album/${album.idAlbum}`)}
                  >
                    Ver álbum
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Últimas fotos */}
      <h5 className="fw-semibold mt-4 mb-2">Mis últimas fotos</h5>
      <div className="alert alert-secondary">
        Próximamente vas a ver aquí las fotos detectadas mediante reconocimiento facial.
      </div>
    </div>
  );
}
