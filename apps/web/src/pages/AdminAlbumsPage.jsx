// src/pages/AdminAlbumsPage.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAlbums, deleteAlbum } from "../api/albums";

function EstadoBadge({ estado }) {
  const baseClass = "badge rounded-pill";
  switch (estado) {
    case "Publicado":
      return <span className={`${baseClass} text-bg-success`}>Publicado</span>;
    case "Borrador":
      return (
        <span className={`${baseClass} text-bg-secondary`}>Borrador</span>
      );
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

  // -----------------------------------------------------
  // CARGAR ÁLBUMES DESDE LA API
  // -----------------------------------------------------
  async function loadAlbums() {
    try {
      setLoading(true);
      const data = await fetchAlbums();

      const adaptados = data.map((a) => ({
        id: a.idAlbum,
        nombre: a.nombreEvento,
        codigo: `ALB-${a.idAlbum}`,
        fechaEvento: new Date(a.fechaEvento).toLocaleDateString("es-AR"),
        ubicacion: a.localizacion,
        fotosTotales: "-", // luego reemplazamos cuando contemos imágenes reales
        estado: a.estado || "Publicado", // la BD usa "activo" por ahora
        visibilidad: a.visibilidad || "Público", // placeholder
      }));

      setAlbums(adaptados);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los álbumes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAlbums();
  }, []);

  // -----------------------------------------------------
  // ELIMINAR ÁLBUM
  // -----------------------------------------------------
  async function handleDelete(id) {
    const confirmDelete = window.confirm(
      "¿Seguro que querés eliminar este álbum? Esto eliminará las fotos asociadas."
    );

    if (!confirmDelete) return;

    try {
      await deleteAlbum(id);
      alert("Álbum eliminado correctamente.");
      loadAlbums();
    } catch (err) {
      console.error(err);
      alert("No se pudo eliminar el álbum.");
    }
  }

  // -----------------------------------------------------
  // RENDER
  // -----------------------------------------------------

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

            <button
              className="btn btn-ft btn-ft-solid btn-sm"
              onClick={() => navigate("/admin/albums/nuevo")}
            >
              ➕ Nuevo álbum
            </button>
          </div>
        </section>

        {/* Tabla */}
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
                        <th>Nombre del álbum</th>
                        <th>Código</th>
                        <th>Evento</th>
                        <th>Fotos</th>
                        <th>Estado</th>
                        <th>Visibilidad</th>
                        <th style={{ width: "160px" }}>Acciones</th>
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
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-outline-secondary"
                                onClick={() =>
                                  navigate(`/admin/albums/${album.id}`)
                                }
                              >
                                Ver
                              </button>

                              <button
                                className="btn btn-outline-secondary"
                                onClick={() =>
                                  navigate(`/admin/albums/editar/${album.id}`)
                                }
                              >
                                Editar
                              </button>

                              <button
                                className="btn btn-outline-danger"
                                onClick={() => handleDelete(album.id)}
                              >
                                Eliminar
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
