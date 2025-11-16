// apps/web/src/pages/Mainscreen.jsx

const MOCK_USER = {
  nombre: "Juanma",
};

const MOCK_RESUMEN = {
  albumsDisponibles: 5,
  fotosDetectadas: 32,
  comprasRealizadas: 4,
};

const MOCK_ALBUMS_RECIENTES = [
  {
    id: 1,
    nombre: "Fecha XCO Cerro Azul",
    fecha: "12/10/2025",
    ubicacion: "Cerro Azul, Misiones",
    imagenPreview: "/album-placeholder-1.jpg",
  },
  {
    id: 2,
    nombre: "Desafío MTB Posadas",
    fecha: "28/09/2025",
    ubicacion: "Posadas, Misiones",
    imagenPreview: "/album-placeholder-2.jpg",
  },
  {
    id: 3,
    nombre: "Travesía Selva Adentro",
    fecha: "14/09/2025",
    ubicacion: "Oberá, Misiones",
    imagenPreview: "/album-placeholder-3.jpg",
  },
];

export function MainscreenPage() {
  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {/* SIDEBAR */}
      <aside
        className="border-end d-flex flex-column"
        style={{
          width: "260px",
          backgroundColor: "#f8f9fa",
        }}
      >
        {/* Header sidebar */}
        <div className="p-4 border-bottom">
          <h4 className="fw-bold mb-0">FotoTrack</h4>
          <small className="text-muted">
            Panel del usuario
          </small>
        </div>

        {/* Usuario / avatar mini */}
        <div className="d-flex align-items-center gap-2 px-4 py-3 border-bottom">
          <div
            className="d-flex align-items-center justify-content-center rounded-circle"
            style={{
              width: 36,
              height: 36,
              backgroundColor: "#0b6623",
              color: "#fff",
              fontWeight: 600,
            }}
          >
            {MOCK_USER.nombre.charAt(0)}
          </div>
          <div>
            <div className="fw-semibold small">{MOCK_USER.nombre}</div>
            <div className="text-muted small">Usuario registrado</div>
          </div>
        </div>

        {/* Navegación */}
        <nav className="nav flex-column px-3 py-3 gap-1">
          <span className="text-uppercase text-muted small mb-2">
            Navegación
          </span>
          <a href="#" className="nav-link px-0 py-1 fw-semibold">
            🏠 Inicio
          </a>
          <a href="#" className="nav-link px-0 py-1">
            📸 Explorar álbumes
          </a>
          <a href="#" className="nav-link px-0 py-1">
            🙂 Mis fotos (reconocimiento facial)
          </a>
          <a href="#" className="nav-link px-0 py-1">
            🧾 Mis compras
          </a>
          <a href="#" className="nav-link px-0 py-1">
            🛒 Carrito
          </a>
          <a href="#" className="nav-link px-0 py-1">
            ⚙️ Mi perfil
          </a>

          <hr className="my-2" />

          <a href="#" className="nav-link px-0 py-1 text-danger">
            ⏻ Cerrar sesión
          </a>
        </nav>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-grow-1 p-4 p-md-5">
        {/* Saludo + resumen */}
        <section className="mb-4">
          <h2 className="fw-bold mb-2">
            Hola, {MOCK_USER.nombre}
          </h2>
          <p className="text-muted mb-3">
            Desde aquí vas a poder explorar álbumes, encontrar tus fotos mediante reconocimiento facial
            y revisar tus compras.
          </p>

          {/* Resumen numérico */}
          <div className="row g-3">
            <div className="col-12 col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="text-muted small mb-1">Álbumes disponibles</div>
                  <div className="h4 mb-0">{MOCK_RESUMEN.albumsDisponibles}</div>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="text-muted small mb-1">Fotos detectadas para vos</div>
                  <div className="h4 mb-0">{MOCK_RESUMEN.fotosDetectadas}</div>
                  <small className="text-muted">
                    via reconocimiento facial (face-api.js)
                  </small>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="text-muted small mb-1">Compras realizadas</div>
                  <div className="h4 mb-0">{MOCK_RESUMEN.comprasRealizadas}</div>
                  <small className="text-muted">
                    entrega automática por correo
                  </small>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Accesos rápidos */}
        <section className="mb-4">
          <h5 className="fw-semibold mb-3">Accesos rápidos</h5>
          <div className="row g-3">
            <div className="col-12 col-md-3">
              <button className="btn w-100 text-start border-0 shadow-sm py-3">
                <div className="fw-semibold">📸 Explorar álbumes</div>
                <small className="text-muted">
                  Navegá por los eventos publicados.
                </small>
              </button>
            </div>
            <div className="col-12 col-md-3">
              <button className="btn w-100 text-start border-0 shadow-sm py-3">
                <div className="fw-semibold">🙂 Encontrar mis fotos</div>
                <small className="text-muted">
                  Usá reconocimiento facial para encontrarte.
                </small>
              </button>
            </div>
            <div className="col-12 col-md-3">
              <button className="btn w-100 text-start border-0 shadow-sm py-3">
                <div className="fw-semibold">🧾 Mis compras</div>
                <small className="text-muted">
                  Consultá el estado de tus pedidos.
                </small>
              </button>
            </div>
            <div className="col-12 col-md-3">
              <button className="btn w-100 text-start border-0 shadow-sm py-3">
                <div className="fw-semibold">🛒 Carrito</div>
                <small className="text-muted">
                  Revisá lo que estás por comprar.
                </small>
              </button>
            </div>
          </div>
        </section>

        {/* Álbumes recientes */}
        <section className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-semibold mb-0">Álbumes recientes</h5>
            <button className="btn btn-link btn-sm text-decoration-none">
              Ver todos los álbumes
            </button>
          </div>

          {MOCK_ALBUMS_RECIENTES.length === 0 ? (
            <div className="alert alert-info mb-0">
              Por ahora no hay álbumes recientes disponibles.
            </div>
          ) : (
            <div className="row g-3">
              {MOCK_ALBUMS_RECIENTES.map((album) => (
                <div key={album.id} className="col-12 col-md-4 col-lg-3">
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
                    <div className="card-body">
                      <h6 className="fw-semibold mb-1">{album.nombre}</h6>
                      <small className="text-muted d-block">
                        {album.fecha} · {album.ubicacion}
                      </small>
                      <button className="btn btn-sm btn-outline-secondary mt-2">
                        Ver álbum
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Mis últimas fotos (placeholder por ahora) */}
        <section>
          <h5 className="fw-semibold mb-2">Mis últimas fotos</h5>
          <div className="alert alert-secondary mb-0">
            Próximamente vas a ver aquí una vista previa de las fotos en las que te detectemos automáticamente
            mediante reconocimiento facial.
          </div>
        </section>
      </main>
    </div>
  );
}
