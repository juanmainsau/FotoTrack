// apps/web/src/pages/AdminDashboardPage.jsx

import { Link } from "react-router-dom";

// Por ahora no tenemos datos reales, dejamos todo en 0
const ADMIN_RESUMEN_INICIAL = {
  albumsPublicados: 0,
  fotosProcesadas: 0,
  albumsPendientes: 0,
  comprasUltimas24h: 0,
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
  const resumen = ADMIN_RESUMEN_INICIAL;

  return (
    // Igual que en Mainscreen: solo el contenido.
    // El sidebar lo aporta el AdminLayout.
    <div className="p-4 p-md-5">
      {/* Título */}
      <section className="mb-4">
        <h2 className="fw-bold mb-2">Panel de administración</h2>
        <p className="text-muted mb-0">
          Desde aquí vas a poder publicar y gestionar álbumes, controlar usuarios,
          consultar reportes y monitorear la auditoría del sistema.
        </p>
      </section>

      {/* Métricas */}
      <section className="mb-4">
        <div className="row g-3">
          {/* Álbumes publicados */}
          <div className="col-12 col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="text-muted small mb-1">Álbumes publicados</div>
                <div className="h4 mb-0">{resumen.albumsPublicados}</div>
              </div>
            </div>
          </div>

          {/* Fotos procesadas */}
          <div className="col-12 col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="text-muted small mb-1">Fotos procesadas</div>
                <div className="h4 mb-0">{resumen.fotosProcesadas}</div>
                <small className="text-muted">
                  redimensionadas, con marca de agua, listas para venta
                </small>
              </div>
            </div>
          </div>

          {/* Álbumes pendientes */}
          <div className="col-12 col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="text-muted small mb-1">Álbumes pendientes</div>
                <div className="h4 mb-0">{resumen.albumsPendientes}</div>
                <small className="text-muted">
                  requieren revisión o publicación
                </small>
              </div>
            </div>
          </div>

          {/* Compras últimas 24hs */}
          <div className="col-12 col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="text-muted small mb-1">Compras últimas 24 hs</div>
                <div className="h4 mb-0">{resumen.comprasUltimas24h}</div>
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
          {/* Crear álbum */}
          <div className="col-12 col-md-4">
            <Link
              to="/admin/albums/nuevo"
              className="btn w-100 text-start border-0 shadow-sm py-3"
            >
              <div className="fw-semibold">➕ Crear nuevo álbum</div>
              <small className="text-muted">
                Iniciá la carga de fotos para un nuevo evento MTB.
              </small>
            </Link>
          </div>

          {/* Gestionar álbumes */}
          <div className="col-12 col-md-4">
            <Link
              to="/admin/albums"
              className="btn w-100 text-start border-0 shadow-sm py-3"
            >
              <div className="fw-semibold">📂 Gestionar álbumes</div>
              <small className="text-muted">
                Editá datos, estados y visibilidad de los álbumes ya cargados.
              </small>
            </Link>
          </div>

          {/* Auditoría / procesos */}
          <div className="col-12 col-md-4">
            <Link
              to="/admin/audit"
              className="btn w-100 text-start border-0 shadow-sm py-3"
            >
              <div className="fw-semibold">⚙️ Procesos automatizados</div>
              <small className="text-muted">
                Monitoreá el procesamiento de imágenes y entrega de compras.
              </small>
            </Link>
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

      {/* Placeholder tareas */}
      <section>
        <h5 className="fw-semibold mb-2">Tareas pendientes</h5>
        <div className="alert alert-secondary mb-0">
          Próximamente vas a poder ver aquí un listado de tareas sugeridas,
          como revisar álbumes pendientes, verificar ejecuciones de reconocimiento
          facial o chequear posibles errores en la entrega automática de compras.
        </div>
      </section>
    </div>
  );
}
