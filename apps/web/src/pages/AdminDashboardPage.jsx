// apps/web/src/pages/AdminDashboardPage.jsx

import { Link } from "react-router-dom";

const MOCK_ADMIN_RESUMEN = {
  albumsPublicados: 12,
  fotosProcesadas: 1840,
  albumsPendientes: 3,
  comprasUltimas24h: 27,
};

const MOCK_ACTIVIDAD_RECIENTE = [
  {
    id: 1,
    tipo: "Álbum publicado",
    detalle: "Desafío MTB Posadas",
    fecha: "11/11/2025 18:32",
  },
  {
    id: 2,
    tipo: "Fotos procesadas",
    detalle: "Fecha XCO Cerro Azul (320 fotos)",
    fecha: "11/11/2025 17:05",
  },
  {
    id: 3,
    tipo: "Compra completada",
    detalle: "Paquete de fotos — Usuario: c.ramirez",
    fecha: "11/11/2025 16:41",
  },
];

export function AdminDashboardPage() {
  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {/* SIDEBAR ADMIN */}
      <aside
        className="border-end d-flex flex-column"
        style={{
          width: "260px",
          backgroundColor: "#f8f9fa",
        }}
      >
        {/* Header */}
        <div className="p-4 border-bottom">
          <h4 className="fw-bold mb-0">FotoTrack</h4>
          <small className="text-muted">Panel de administración</small>
        </div>

        {/* Navegación */}
        <nav className="nav flex-column px-3 py-3 gap-1">
          <span className="text-uppercase text-muted small mb-2">
            Navegación
          </span>

          <Link to="/admin" className="nav-link px-0 py-1 fw-semibold">
            📊 Dashboard
          </Link>

          <Link to="/admin/albums" className="nav-link px-0 py-1">
            📸 Gestión de álbumes e imágenes
          </Link>

          <Link to="/admin/users" className="nav-link px-0 py-1">
            👥 Gestión de usuarios
          </Link>

          <Link to="/admin/reportes" className="nav-link px-0 py-1">
            📈 Reportes
          </Link>

          <Link to="/admin/auditoria" className="nav-link px-0 py-1">
            🕵️ Auditoría del sistema
          </Link>

          <hr className="my-3" />

          <Link to="/app/mainscreen" className="nav-link px-0 py-1">
            ↩ Ver vista de usuario
          </Link>

          <Link to="/" className="nav-link px-0 py-1 text-danger">
            ⏻ Cerrar sesión
          </Link>
        </nav>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-grow-1 p-4 p-md-5">
        {/* Título y descripción */}
        <section className="mb-4">
          <h2 className="fw-bold mb-2">Panel de administración</h2>
          <p className="text-muted mb-0">
            Desde aquí vas a poder publicar y gestionar álbumes, controlar usuarios,
            consultar reportes y monitorear la auditoría del sistema.
          </p>
        </section>

        {/* Métricas resumen */}
        <section className="mb-4">
          <div className="row g-3">
            <div className="col-12 col-md-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="text-muted small mb-1">Álbumes publicados</div>
                  <div className="h4 mb-0">{MOCK_ADMIN_RESUMEN.albumsPublicados}</div>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="text-muted small mb-1">Fotos procesadas</div>
                  <div className="h4 mb-0">{MOCK_ADMIN_RESUMEN.fotosProcesadas}</div>
                  <small className="text-muted">
                    redimensionadas, con marca de agua, listas para venta
                  </small>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="text-muted small mb-1">Álbumes pendientes</div>
                  <div className="h4 mb-0">{MOCK_ADMIN_RESUMEN.albumsPendientes}</div>
                  <small className="text-muted">
                    requieren revisión o publicación
                  </small>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="text-muted small mb-1">Compras últimas 24 hs</div>
                  <div className="h4 mb-0">{MOCK_ADMIN_RESUMEN.comprasUltimas24h}</div>
                  <small className="text-muted">
                    entrega automatizada por correo
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
            <div className="col-12 col-md-4">
              <button className="btn w-100 text-start border-0 shadow-sm py-3">
                <div className="fw-semibold">➕ Crear nuevo álbum</div>
                <small className="text-muted">
                  Iniciá la carga de fotos para un nuevo evento MTB.
                </small>
              </button>
            </div>

            <div className="col-12 col-md-4">
              <button className="btn w-100 text-start border-0 shadow-sm py-3">
                <div className="fw-semibold">📂 Gestionar álbumes</div>
                <small className="text-muted">
                  Editá datos, estados y visibilidad de los álbumes ya cargados.
                </small>
              </button>
            </div>

            <div className="col-12 col-md-4">
              <button className="btn w-100 text-start border-0 shadow-sm py-3">
                <div className="fw-semibold">⚙️ Procesos automatizados</div>
                <small className="text-muted">
                  Monitoreá el procesamiento de imágenes y entrega de compras.
                </small>
              </button>
            </div>
          </div>
        </section>

        {/* Actividad reciente */}
        <section className="mb-4">
          <h5 className="fw-semibold mb-3">Actividad reciente</h5>

          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table mb-0 align-middle">
                  <thead>
                    <tr>
                      <th scope="col">Tipo</th>
                      <th scope="col">Detalle</th>
                      <th scope="col">Fecha y hora</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_ACTIVIDAD_RECIENTE.map((evento) => (
                      <tr key={evento.id}>
                        <td>{evento.tipo}</td>
                        <td>{evento.detalle}</td>
                        <td className="text-muted small">{evento.fecha}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Placeholder */}
        <section>
          <h5 className="fw-semibold mb-2">Tareas pendientes</h5>
          <div className="alert alert-secondary mb-0">
            Próximamente vas a poder ver aquí un listado de tareas sugeridas,
            como revisar álbumes pendientes, verificar ejecuciones de reconocimiento
            facial o chequear posibles errores en la entrega automática de compras.
          </div>
        </section>
      </main>
    </div>
  );
}
