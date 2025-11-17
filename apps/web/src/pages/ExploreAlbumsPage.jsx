// apps/web/src/pages/ExploreAlbumsPage.jsx

const MOCK_ALBUMS_PUBLICOS = [
  {
    id: 1,
    nombre: "Fecha XCO Cerro Azul",
    fechaEvento: "12/10/2025",
    ubicacion: "Cerro Azul, Misiones",
    fotosTotales: 320,
    precioFoto: 1500,
    precioAlbum: 18000,
    imagenPreview: "/album-placeholder-1.jpg",
  },
  {
    id: 2,
    nombre: "Desafío MTB Posadas",
    fechaEvento: "28/09/2025",
    ubicacion: "Posadas, Misiones",
    fotosTotales: 245,
    precioFoto: 1500,
    precioAlbum: null, // no se vende pack completo
    imagenPreview: "/album-placeholder-2.jpg",
  },
  {
    id: 3,
    nombre: "Travesía Selva Adentro",
    fechaEvento: "14/09/2025",
    ubicacion: "Oberá, Misiones",
    fotosTotales: 410,
    precioFoto: 1500,
    precioAlbum: 20000,
    imagenPreview: "/album-placeholder-3.jpg",
  },
];

export function ExploreAlbumsPage() {
  const albums = MOCK_ALBUMS_PUBLICOS;

  return (
    <div className="d-flex flex-column" style={{ minHeight: "100vh" }}>
      {/* Barra superior simple */}
      <header
        className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom bg-white"
      >
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
                  />
                </div>

                <div className="col-6 col-md-3">
                  <label className="form-label small text-muted">
                    Ubicación
                  </label>
                  <select className="form-select form-select-sm">
                    <option value="">Todas</option>
                    <option value="Posadas, Misiones">Posadas, Misiones</option>
                    <option value="Cerro Azul, Misiones">Cerro Azul, Misiones</option>
                    <option value="Oberá, Misiones">Oberá, Misiones</option>
                  </select>
                </div>

                <div className="col-6 col-md-3">
                  <label className="form-label small text-muted">
                    Ordenar por
                  </label>
                  <select className="form-select form-select-sm">
                    <option value="recientes">Más recientes primero</option>
                    <option value="antiguos">Más antiguos primero</option>
                    <option value="nombre">Nombre del evento (A-Z)</option>
                  </select>
                </div>

                <div className="col-12 col-md-2 d-flex gap-2 justify-content-md-end">
                  <button className="btn btn-sm btn-outline-secondary">
                    Limpiar
                  </button>
                  <button className="btn btn-sm btn-primary">
                    Aplicar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Listado de álbumes */}
        <section>
          {albums.length === 0 ? (
            <div className="alert alert-info">
              Por ahora no hay álbumes disponibles. Volvé a intentar más tarde.
            </div>
          ) : (
            <div className="row g-4">
              {albums.map((album) => (
                <div key={album.id} className="col-12 col-md-6 col-lg-4">
                  <div className="card h-100 border-0 shadow-sm">
                    <div
                      style={{
                        width: "100%",
                        paddingTop: "60%",
                        backgroundImage: `url("${album.imagenPreview}")`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        borderTopLeftRadius: "0.5rem",
                        borderTopRightRadius: "0.5rem",
                      }}
                    />
                    <div className="card-body d-flex flex-column">
                      <h5 className="fw-semibold mb-1">{album.nombre}</h5>
                      <small className="text-muted d-block mb-2">
                        {album.fechaEvento} · {album.ubicacion}
                      </small>

                      <div className="mb-2">
                        <small className="text-muted">
                          {album.fotosTotales} fotos disponibles
                        </small>
                      </div>

                      <div className="mb-3">
                        <div className="small">
                          <strong>Precio por foto:</strong>{" "}
                          {album.precioFoto != null
                            ? `$ ${album.precioFoto.toLocaleString("es-AR")}`
                            : "No disponible"}
                        </div>
                        <div className="small text-muted">
                          <strong>Álbum completo:</strong>{" "}
                          {album.precioAlbum != null
                            ? `$ ${album.precioAlbum.toLocaleString("es-AR")}`
                            : "No se vende como paquete"}
                        </div>
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
