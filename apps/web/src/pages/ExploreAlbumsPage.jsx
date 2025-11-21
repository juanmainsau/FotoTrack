// apps/web/src/pages/ExploreAlbumsPage.jsx

import { useEffect, useMemo, useState } from "react";
import { fetchAlbums } from "../api/albums";

export function ExploreAlbumsPage() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // filtros
  const [searchText, setSearchText] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [order, setOrder] = useState("recientes");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await fetchAlbums();
        setAlbums(data);
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

  // obtener listado de ubicaciones únicas para el combo
  const ubicacionesUnicas = useMemo(() => {
    const set = new Set(albums.map((a) => a.localizacion).filter(Boolean));
    return Array.from(set);
  }, [albums]);

  return (
    <div className="d-flex flex-column" style={{ minHeight: "100vh" }}>
      {/* Barra superior simple */}
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

      {/* Contenido */}
      <main className="flex-grow-1 p-4 p-md-5">
        {/* Título + descripción */}
        <section className="mb-4">
          <h2 className="fw-bold mb-2">Explorar álbumes</h2>
          <p className="text-muted mb-0">
            Navegá los eventos disponibles, encontrá el tuyo y después podés usar el
            reconocimiento facial para localizar tus fotos dentro de cada álbum.
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
                  <label className="form-label small text-muted">
                    Ubicación
                  </label>
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
                  <label className="form-label small text-muted">
                    Ordenar por
                  </label>
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
                  {/* El botón Aplicar ahora no es necesario, pero lo dejamos por UI */}
                  <button
                    className="btn btn-sm btn-primary"
                    type="button"
                    onClick={() => {}}
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Listado de álbumes */}
        <section>
          {loading ? (
            <div className="alert alert-secondary">
              Cargando álbumes...
            </div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : filteredAlbums.length === 0 ? (
            <div className="alert alert-info">
              Por ahora no hay álbumes disponibles. Volvé a intentar más tarde.
            </div>
          ) : (
            <div className="row g-4">
              {filteredAlbums.map((album) => (
                <div key={album.idAlbum} className="col-12 col-md-6 col-lg-4">
                  <div className="card h-100 border-0 shadow-sm">
                    {/* Por ahora, placeholder de preview */}
                    <div
                      style={{
                        width: "100%",
                        paddingTop: "60%",
                        background:
                          "linear-gradient(135deg, #0b6623, #2eb897)",
                        borderTopLeftRadius: "0.5rem",
                        borderTopRightRadius: "0.5rem",
                      }}
                    />
                    <div className="card-body d-flex flex-column">
                      <h5 className="fw-semibold mb-1">
                        {album.nombreEvento}
                      </h5>
                      <small className="text-muted d-block mb-2">
                        {new Date(album.fechaEvento).toLocaleDateString(
                          "es-AR"
                        )}{" "}
                        · {album.localizacion}
                      </small>

                      <div className="mb-2">
                        <small className="text-muted">
                          Próximamente se mostrarán cantidad de fotos y precios.
                        </small>
                      </div>

                      <div className="mt-auto d-flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-ft btn-ft-solid flex-grow-1"
                        >
                          Ver álbum
                        </button>
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
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

