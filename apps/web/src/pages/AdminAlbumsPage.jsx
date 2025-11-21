// apps/web/src/pages/AdminAlbumsPage.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAlbums } from "../api/albums";

function EstadoBadge({ estado }) {
  const baseClass = "badge rounded-pill";
  switch (estado) {
    case "Publicado":
      return <span className={`${baseClass} text-bg-success`}>Publicado</span>;
    case "Borrador":
      return <span className={`${baseClass} text-bg-secondary`}>Borrador</span>;
    case "Archivado":
      return <span className={`${baseClass} text-bg-warning`}>Archivado</span>;
    default:
      return <span className={baseClass}>{estado}</span>;
  }
}

function VisibilidadBadge({ visibilidad }) {
  const baseClass = "badge rounded-pill";
  switch (visibilidad) {
    case "Público":
      return <span className={`${baseClass} text-bg-primary`}>Público</span>;
    case "Oculto":
      return <span className={`${baseClass} text-bg-dark`}>Oculto</span>;
    default:
      return <span className={baseClass}>{visibilidad}</span>;
  }
}

export function AdminAlbumsPage() {
  const navigate = useNavigate();

  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await fetchAlbums();

        // Adaptamos los datos reales de la BD al formato que usaba el mock
        const adaptados = data.map((a) => ({
          id: a.idAlbum,
          nombre: a.nombreEvento,
          codigo: `ALB-${a.idAlbum}`, // placeholder por ahora
          fechaEvento: new Date(a.fechaEvento).toLocaleDateString("es-AR"),
          ubicacion: a.localizacion,
          fotosTotales: "-", // cuando tengamos conteo real, lo reemplazamos
          estado: a.estado === "activo" ? "Publicado" : "Archivado",
          visibilidad: "Público", // más adelante esto saldrá de la BD
        }));

        setAlbums(adaptados);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los álbumes.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

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
        <div className="p-4 border-bottom">
          <h4 className="fw-bold mb-0">FotoTrack</h4>
          <small className="text-muted">Admin · Álbumes</small>
        </div>

        <nav className="nav flex-column px-3 py-3 gap-1">
          <span className="text-uppercase text-muted small mb-2">
            Navegación
          </span>

          <a href="/admin" className="nav-link px-0 py-1">
            📊 Dashboard
          </a>
          <a href="/admin/albums" className="nav-link px-0 py-1 fw-semibold">
            📸 Gestión de álbumes
          </a>
          <a href="/admin/users" className="nav-link px-0 py-1">
            👥 Gestión de usuarios
          </a>
          <a href="/admin/reportes" className="nav-link px-0 py-1">
            📈 Reportes
          </a>
          <a href="/admin/auditoria" className="nav-link px-0 py-1">
            🕵️ Auditoría
          </a>

          <hr className="my-3" />

          <a href="/" className="nav-link px-0 py-1">
            ↩ Vista de usuario
          </a>
          <a href="#" className="nav-link px-0 py-1 text-danger">
            ⏻ Cerrar sesión
          </a>
        </nav>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-grow-1 p-4 p-md-5">
        {/* Título y acciones */}
        <section className="mb-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div>
              <h2 className="fw-bold mb-1">Gestión de álbumes</h2>
              <p className="text-muted mb-0">
                Administrá los álbumes de eventos MTB, su estado y visibilidad.
              </p>
            </div>

            <div className="d-flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-ft btn-ft-solid btn-sm"
                onClick={() => navigate("/admin/albums/nuevo")}
              >
                ➕ Nuevo álbum
              </button>
            </div>
          </div>
        </section>

        {/* Filtros (aún sin lógica, solo UI) */}
        <section className="mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="row g-3 align-items-end">
                <div className="col-12 col-md-4">
                  <label className="form-label small text-muted">
                    Buscar por nombre, código o ubicación
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Ej: Cerro Azul, MTB Posadas..."
                    // más adelante agregamos estado para filtros
                  />
                </div>

                <div className="col-6 col-md-3">
                  <label className="form-label small text-muted">
                    Estado
                  </label>
                  <select className="form-select form-select-sm">
                    <option value="">Todos</option>
                    <option value="Borrador">Borrador</option>
                    <option value="Publicado">Publicado</option>
                    <option value="Archivado">Archivado</option>
                  </select>
                </div>

                <div className="col-6 col-md-3">
                  <label className="form-label small text-muted">
                    Visibilidad
                  </label>
                  <select className="form-select form-select-sm">
                    <option value="">Todas</option>
                    <option value="Público">Público</option>
                    <option value="Oculto">Oculto</option>
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

        {/* Tabla de álbumes */}
        <section>
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              {loading && (
                <div className="p-3">
                  <div className="alert alert-secondary mb-0">
                    Cargando álbumes...
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3">
                  <div className="alert alert-danger mb-0">{error}</div>
                </div>
              )}

              {!loading && !error && (
                <div className="table-responsive">
                  <table className="table mb-0 align-middle">
                    <thead>
                      <tr>
                        <th scope="col">Nombre del álbum</th>
                        <th scope="col">Código</th>
                        <th scope="col">Evento</th>
                        <th scope="col">Fotos</th>
                        <th scope="col">Estado</th>
                        <th scope="col">Visibilidad</th>
                        <th scope="col" style={{ width: "150px" }}>
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {albums.map((album) => (
                        <tr key={album.id}>
                          <td className="fw-semibold">{album.nombre}</td>
                          <td>
                            <code className="small">{album.codigo}</code>
                          </td>
                          <td>
                            <div>{album.ubicacion}</div>
                            <small className="text-muted">
                              {album.fechaEvento}
                            </small>
                          </td>
                          <td>{album.fotosTotales}</td>
                          <td>
                            <EstadoBadge estado={album.estado} />
                          </td>
                          <td>
                            <VisibilidadBadge visibilidad={album.visibilidad} />
                          </td>
                          <td>
                            <div
                              className="btn-group btn-group-sm"
                              role="group"
                            >
                              <button className="btn btn-outline-secondary">
                                Ver
                              </button>
                              <button className="btn btn-outline-secondary">
                                Editar
                              </button>
                              <button className="btn btn-outline-secondary">
                                ⋮
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {albums.length === 0 && (
                        <tr>
                          <td colSpan={7} className="text-center py-4">
                            <span className="text-muted">
                              No se encontraron álbumes.
                            </span>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
