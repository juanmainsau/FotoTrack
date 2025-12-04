import { useEffect, useMemo, useState } from "react";
import { fetchAlbums } from "../api/albums";

export function ExploreAlbumsPage() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [albumImages, setAlbumImages] = useState({}); // ← miniaturas y conteo

  const [searchText, setSearchText] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [order, setOrder] = useState("recientes");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await fetchAlbums();
        setAlbums(data);

        // 🔥 Pedimos miniaturas + conteos por cada álbum
        const imagesByAlbum = {};

        for (const album of data) {
          try {
            const res = await fetch(
              `http://localhost:4000/api/imagenes/album/${album.idAlbum}`
            );
            const imgs = await res.json();

            imagesByAlbum[album.idAlbum] = {
              count: imgs.length,
              thumbnail: imgs[0]?.rutaMiniatura || null,
            };
          } catch (e) {
            console.error("Error tomando imágenes del álbum:", album.idAlbum);
            imagesByAlbum[album.idAlbum] = { count: 0, thumbnail: null };
          }
        }

        setAlbumImages(imagesByAlbum);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los álbumes.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  function handleClearFilters() {
    setSearchText("");
    setLocationFilter("");
    setOrder("recientes");
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

  const ubicacionesUnicas = useMemo(() => {
    const set = new Set(albums.map((a) => a.localizacion).filter(Boolean));
    return Array.from(set);
  }, [albums]);

  return (
    <div className="d-flex flex-column" style={{ minHeight: "100vh" }}>
      <header className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom bg-white">
        <div>
          <h4 className="fw-bold mb-0">FotoTrack</h4>
          <small className="text-muted">Explorar álbumes</small>
        </div>

        <div className="d-flex align-items-center gap-3">
          <a href="/app/mainscreen" className="btn btn-sm btn-outline-secondary">
            ← Volver al panel
          </a>
        </div>
      </header>

      <main className="flex-grow-1 p-4 p-md-5">
        <section className="mb-4">
          <h2 className="fw-bold mb-2">Explorar álbumes</h2>
          <p className="text-muted mb-0">
            Navegá los eventos disponibles, encontrá el tuyo y buscá tus fotos.
          </p>
        </section>

        {/* Filtros */}
        <section className="mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="row g-3 align-items-end">
                <div className="col-12 col-md-4">
                  <label className="form-label small text-muted">
                    Buscar por nombre de evento o ubicación
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Ej: Posadas, Cerro Azul..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </div>

                <div className="col-6 col-md-3">
                  <label className="form-label small text-muted">Ubicación</label>
                  <select
                    className="form-select form-select-sm"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                  >
                    <option value="">Todas</option>
                    {ubicacionesUnicas.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-6 col-md-3">
                  <label className="form-label small text-muted">Ordenar por</label>
                  <select
                    className="form-select form-select-sm"
                    value={order}
                    onChange={(e) => setOrder(e.target.value)}
                  >
                    <option value="recientes">Más recientes primero</option>
                    <option value="antiguos">Más antiguos primero</option>
                    <option value="nombre">Nombre del evento (A-Z)</option>
                  </select>
                </div>

                <div className="col-12 col-md-2 d-flex gap-2 justify-content-md-end">
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    type="button"
                    onClick={handleClearFilters}
                  >
                    Limpiar
                  </button>
                  <button className="btn btn-sm btn-primary" type="button">
                    Aplicar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* LISTADO */}
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
                const imgData = albumImages[album.idAlbum] || {
                  count: 0,
                  thumbnail: null,
                };

                return (
                  <div key={album.idAlbum} className="col-12 col-md-6 col-lg-4">
                    <div className="card h-100 border-0 shadow-sm">

                      {/* MINIATURA */}
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
                          alt="Miniatura del álbum"
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "160px",
                            backgroundColor: "#d9d9d9",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#666",
                            fontSize: "0.9rem",
                            borderTopLeftRadius: "0.5rem",
                            borderTopRightRadius: "0.5rem",
                          }}
                        >
                          Sin fotos todavía
                        </div>
                      )}

                      <div className="card-body d-flex flex-column">
                        <h5 className="fw-semibold mb-1">{album.nombreEvento}</h5>

                        <small className="text-muted d-block mb-2">
                          {new Date(album.fechaEvento).toLocaleDateString("es-AR")} ·{" "}
                          {album.localizacion}
                        </small>

                        <div className="mb-2">
                          <small className="text-muted">
                            {imgData.count} foto{imgData.count === 1 ? "" : "s"} cargadas
                          </small>
                        </div>

                        <div className="mt-auto d-flex flex-wrap gap-2">
                          <a
                            href={`/app/album/${album.idAlbum}`}
                            className="btn btn-sm btn-ft btn-ft-solid flex-grow-1"
                          >
                            Ver álbum
                          </a>

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                          >
                            Encontrar mis fotos
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
