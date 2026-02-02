// src/pages/MainscreenPage.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchAlbums } from "../api/albums";

export function MainscreenPage() {
  const navigate = useNavigate();

  const [albums, setAlbums] = useState([]);
  const [loadingAlbums, setLoadingAlbums] = useState(true);
  const [errorAlbums, setErrorAlbums] = useState(null);

  const nombreUsuario = "Juanma";

  useEffect(() => {
    async function load() {
      try {
        setLoadingAlbums(true);

        const data = await fetchAlbums();

        // ✅ MOSTRAR SOLO ALBUMES PUBLICADOS Y VISIBLES
        const visibles = data.filter(
          (a) => a.estado === "Publicado" && a.visibilidad === "Público"
        );

        // Obtener miniaturas reales
        const enriched = await Promise.all(
          visibles.map(async (album) => {
            try {
              const res = await fetch(
                `http://localhost:4000/api/imagenes/album/${album.idAlbum}`
              );

              const imgs = await res.json();
              const imagenes = imgs.ok ? imgs.imagenes : imgs;

              return {
                ...album,
                img_portada: imagenes[0]?.rutaMiniatura || null,
              };
            } catch (err) {
              console.error("Error cargando miniaturas:", err);
              return { ...album, img_portada: null };
            }
          })
        );

        setAlbums(enriched);
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
    <div className="p-4">

      <h2 className="fw-bold mb-1">Hola, {nombreUsuario}</h2>
      <p className="text-muted">
        Desde aquí vas a poder explorar álbumes, encontrar tus fotos mediante reconocimiento facial y revisar tus compras.
      </p>

      {/* ---------- ESTADISTICAS ---------- */}
      <div className="row g-3 mt-3">
        <div className="col-md-4">
          <div className="border rounded p-3 shadow-sm bg-white">
            <h5 className="fw-bold">Álbumes disponibles</h5>
            <p className="display-6">{albums.length}</p>
          </div>
        </div>

        <div className="col-md-4">
          <div className="border rounded p-3 shadow-sm bg-white">
            <h5 className="fw-bold">Fotos detectadas para vos</h5>
            <p className="display-6">0</p>
          </div>
        </div>

        <div className="col-md-4">
          <div className="border rounded p-3 shadow-sm bg-white">
            <h5 className="fw-bold">Compras realizadas</h5>
            <p className="display-6">0</p>
          </div>
        </div>
      </div>

      {/* ---------- ACCESOS RAPIDOS ---------- */}
      <h4 className="fw-bold mt-5 mb-3">Accesos rápidos</h4>

      <div className="row g-3">
        <div className="col-md-3">
          <Link to="/app/albums" className="text-decoration-none">
            <div className="border rounded p-3 shadow-sm bg-white h-100">
              <h6 className="fw-bold">📸 Explorar álbumes</h6>
              <p className="text-muted mb-0">Navegá por los eventos publicados.</p>
            </div>
          </Link>
        </div>

        <div className="col-md-3">
          <Link to="/app/myphotos" className="text-decoration-none">
            <div className="border rounded p-3 shadow-sm bg-white h-100">
              <h6 className="fw-bold">🙂 Encontrar mis fotos</h6>
              <p className="text-muted mb-0">Reconocimiento facial.</p>
            </div>
          </Link>
        </div>

        <div className="col-md-3">
          <Link to="/app/mis-compras" className="text-decoration-none">
            <div className="border rounded p-3 shadow-sm bg-white h-100">
              <h6 className="fw-bold">📄 Mis compras</h6>
              <p className="text-muted mb-0">Historial de pedidos.</p>
            </div>
          </Link>
        </div>

        <div className="col-md-3">
          <Link to="/app/cart" className="text-decoration-none">
            <div className="border rounded p-3 shadow-sm bg-white h-100">
              <h6 className="fw-bold">🛒 Carrito</h6>
              <p className="text-muted mb-0">Revisá tu compra.</p>
            </div>
          </Link>
        </div>
      </div>

      {/* ---------- ALBUMES ---------- */}
      <h4 className="fw-bold mt-5 mb-3">Álbumes recientes</h4>

      {loadingAlbums && <p className="text-muted">Cargando...</p>}

      {errorAlbums && (
        <div className="alert alert-danger">{errorAlbums}</div>
      )}

      {!loadingAlbums && albums.length === 0 && (
        <p className="text-muted">No hay álbumes disponibles.</p>
      )}

      <div className="row g-4">
        {albums.map((album) => (
          <div key={album.idAlbum} className="col-md-4">
            <div className="card border-0 shadow-sm">

              {album.img_portada ? (
                <img
                  src={album.img_portada}
                  className="card-img-top"
                  style={{ height: "180px", objectFit: "cover" }}
                  alt=""
                />
              ) : (
                <div
                  style={{
                    background: "#d9d9d9",
                    height: "180px",
                    borderRadius: "0.5rem 0.5rem 0 0",
                  }}
                />
              )}

              <div className="card-body">
                <h5 className="card-title fw-semibold">
                  {album.nombreEvento}
                </h5>

                <p className="text-muted mb-1">
                  {new Date(album.fechaEvento).toLocaleDateString("es-AR")} ·{" "}
                  {album.localizacion}
                </p>

                <button
                  className="btn btn-success w-100 mt-2"
                  onClick={() => navigate(`/app/albums/${album.idAlbum}`)}
                >
                  Ver álbum
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
