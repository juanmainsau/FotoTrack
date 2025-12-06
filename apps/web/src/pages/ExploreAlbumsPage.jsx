import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAlbums } from "../api/albums";
import { addAlbumToCart } from "../api/cart";

export function ExploreAlbumsPage() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [albumImages, setAlbumImages] = useState({});
  const [message, setMessage] = useState(null);

  const [searchText, setSearchText] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [order, setOrder] = useState("recientes");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await fetchAlbums();

        // ✅ CORRECCIÓN IMPORTANTE:
        // Mostrar solo los álbumes PUBLICADOS
        const activos = data.filter(a => a.estado === "Publicado");
        setAlbums(activos);

        const imagesByAlbum = {};

        for (const album of activos) {
          try {
            const res = await fetch(
              `http://localhost:4000/api/imagenes/album/${album.idAlbum}`
            );
            const imgs = await res.json();

            const imagenes = imgs.ok ? imgs.imagenes : imgs;

            imagesByAlbum[album.idAlbum] = {
              count: imagenes.length,
              thumbnail: imagenes[0]?.rutaMiniatura || null,
            };
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
      setMessage("Álbum agregado al carrito 👍");
      setTimeout(() => setMessage(null), 2000);
    } catch {
      setMessage("Error al agregar el álbum ❌");
      setTimeout(() => setMessage(null), 2000);
    }
  }

  const filteredAlbums = useMemo(() => {
    let list = [...albums];

    if (searchText.trim()) {
      const text = searchText.toLowerCase();
      list = list.filter(
        (a) =>
          a.nombreEvento.toLowerCase().includes(text) ||
          (a.localizacion || "").toLowerCase().includes(text)
      );
    }

    if (locationFilter) {
      list = list.filter((a) => (a.localizacion || "") === locationFilter);
    }

    list.sort((a, b) => {
      if (order === "recientes") {
        return new Date(b.fechaEvento) - new Date(a.fechaEvento);
      }
      if (order === "antiguos") {
        return new Date(a.fechaEvento) - new Date(b.fechaEvento);
      }
      if (order === "nombre") {
        return a.nombreEvento.localeCompare(b.nombreEvento);
      }
      return 0;
    });

    return list;
  }, [albums, searchText, locationFilter, order]);

  return (
    <div className="d-flex flex-column" style={{ minHeight: "100vh" }}>
      <header className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom bg-white">
        <div>
          <h4 className="fw-bold mb-0">FotoTrack</h4>
          <small className="text-muted">Explorar álbumes</small>
        </div>

        <div className="d-flex align-items-center gap-3">
          <Link to="/app/mainscreen" className="btn btn-sm btn-outline-secondary">
            ← Volver al panel
          </Link>
        </div>
      </header>

      <main className="flex-grow-1 p-4 p-md-5">
        {message && <div className="alert alert-success py-2">{message}</div>}

        <section className="mb-4">
          <h2 className="fw-bold mb-2">Explorar álbumes</h2>
          <p className="text-muted mb-0">
            Navegá los eventos disponibles, encontrá el tuyo y buscá tus fotos.
          </p>
        </section>

        <section>
          {loading ? (
            <div className="alert alert-secondary">Cargando álbumes...</div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : filteredAlbums.length === 0 ? (
            <div className="alert alert-info">
              No se encontraron álbumes con esos filtros.
            </div>
          ) : (
            <div className="row g-4">
              {filteredAlbums.map((album) => {
                const imgData = albumImages[album.idAlbum] ?? {
                  count: 0,
                  thumbnail: null,
                };

                return (
                  <div key={album.idAlbum} className="col-12 col-md-6 col-lg-4">
                    <div className="card h-100 border-0 shadow-sm">
                      {imgData.thumbnail ? (
                        <img
                          src={imgData.thumbnail}
                          style={{
                            width: "100%",
                            height: "160px",
                            objectFit: "cover",
                            borderTopLeftRadius: "0.5rem",
                            borderTopRightRadius: "0.5rem",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "160px",
                            backgroundColor: "#d9d9d9",
                          }}
                        ></div>
                      )}

                      <div className="card-body d-flex flex-column">
                        <h5 className="fw-semibold mb-1">{album.nombreEvento}</h5>

                        <small className="text-muted d-block mb-2">
                          {new Date(album.fechaEvento).toLocaleDateString("es-AR")}
                          {" · "}
                          {album.localizacion}
                        </small>

                        <small className="text-muted mb-3">
                          {imgData.count} foto{imgData.count !== 1 ? "s" : ""}
                        </small>

                        <div className="mt-auto d-flex flex-column gap-2">
                          <Link
                            to={`/app/albums/${album.idAlbum}`}
                            className="btn btn-sm btn-ft btn-ft-solid"
                          >
                            Ver álbum
                          </Link>

                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleAddAlbum(album)}
                          >
                            🛒 Comprar álbum completo
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
