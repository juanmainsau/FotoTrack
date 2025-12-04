// src/pages/AdminAlbumsPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlbumEditModal } from "../components/AlbumEditModal";

// API calls
async function fetchAlbums() {
  const res = await fetch("http://localhost:4000/api/albums");
  return res.json();
}

async function deleteAlbum(id) {
  const token = localStorage.getItem("fototrack-token");
  await fetch(`http://localhost:4000/api/albums/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

function EstadoBadge({ estado }) {
  const base = "badge rounded-pill";
  switch (estado) {
    case "Publicado":
      return <span className={`${base} text-bg-success`}>Publicado</span>;
    case "Borrador":
      return <span className={`${base} text-bg-secondary`}>Borrador</span>;
    case "Archivado":
      return <span className={`${base} text-bg-warning`}>Archivado</span>;
    default:
      return <span className={base}>{estado}</span>;
  }
}

function VisibilidadBadge({ visibilidad }) {
  const base = "badge rounded-pill";
  switch (visibilidad) {
    case "Público":
      return <span className={`${base} text-bg-primary`}>Público</span>;
    case "Oculto":
      return <span className={`${base} text-bg-dark`}>Oculto</span>;
    default:
      return <span className={base}>{visibilidad}</span>;
  }
}

export function AdminAlbumsPage() {
  const navigate = useNavigate();

  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [albumEdit, setAlbumEdit] = useState(null);

  async function loadAlbums() {
    try {
      setLoading(true);
      const data = await fetchAlbums();

      const formatted = data.map((a) => ({
        id: a.idAlbum,
        nombre: a.nombreEvento,
        codigo: a.codigoInterno ?? `ALB-${a.idAlbum}`,
        fechaEvento: new Date(a.fechaEvento).toLocaleDateString("es-AR"),
        fechaEventoOriginal: a.fechaEvento,
        ubicacion: a.localizacion,
        descripcion: a.descripcion,
        estado: a.estado,
        visibilidad: a.visibilidad,
        precioFoto: a.precioFoto,
        precioAlbum: a.precioAlbum,
        tags: a.tags,

        // cantidad real de fotos que devolverá backend
        fotosTotales: a.totalFotos ?? 0,

        // miniatura principal del álbum
        miniatura: a.miniatura || null,
      }));

      setAlbums(formatted);
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

  async function handleDelete(id) {
    const confirmar = window.confirm(
      "¿Seguro que querés eliminar este álbum? Esto eliminará todas las fotos asociadas."
    );
    if (!confirmar) return;

    try {
      await deleteAlbum(id);
      alert("Álbum eliminado.");
      loadAlbums();
    } catch (err) {
      console.error(err);
      alert("No se pudo eliminar el álbum.");
    }
  }

  async function handleUpdateAlbum(id, data) {
    try {
      const token = localStorage.getItem("fototrack-token");

      await fetch(`http://localhost:4000/api/albums/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      setAlbumEdit(null);
      loadAlbums();
      alert("Álbum actualizado.");
    } catch (err) {
      console.error(err);
      alert("No se pudo actualizar el álbum.");
    }
  }

  return (
    <div className="p-4 p-md-5">

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Gestión de álbumes</h2>
          <p className="text-muted">
            Administrá tus álbumes, estados, visibilidad y contenido.
          </p>
        </div>

        <button
          className="btn btn-ft btn-ft-solid btn-sm"
          onClick={() => navigate("/admin/albums/nuevo")}
        >
          ➕ Crear álbum
        </button>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">

          {loading && (
            <div className="p-3">Cargando álbumes...</div>
          )}

          {!loading && !error && (
            <div className="table-responsive">
              <table className="table mb-0 align-middle">
                <thead>
                  <tr>
                    <th></th>
                    <th>Nombre</th>
                    <th>Código</th>
                    <th>Evento</th>
                    <th>Fotos</th>
                    <th>Estado</th>
                    <th>Visibilidad</th>
                    <th className="text-center" style={{ width: "160px" }}>
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {albums.map((album) => (
                    <tr key={album.id}>

                      {/* MINIATURA */}
                      <td>
                        {album.miniatura ? (
                          <img
                            src={album.miniatura}
                            alt="miniatura"
                            style={{
                              width: 60,
                              height: 60,
                              objectFit: "cover",
                              borderRadius: 6,
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 60,
                              height: 60,
                              background: "#eee",
                              borderRadius: 6,
                            }}
                          ></div>
                        )}
                      </td>

                      <td className="fw-semibold">{album.nombre}</td>

                      <td><code>{album.codigo}</code></td>

                      <td>
                        {album.ubicacion}
                        <br />
                        <small className="text-muted">{album.fechaEvento}</small>
                      </td>

                      <td>{album.fotosTotales}</td>

                      <td><EstadoBadge estado={album.estado} /></td>

                      <td><VisibilidadBadge visibilidad={album.visibilidad} /></td>

                      <td>
                        <div className="d-flex justify-content-center gap-2">

                          {/* EDITAR */}
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => setAlbumEdit(album)}
                            title="Editar"
                          >
                            ✏️
                          </button>

                          {/* ELIMINAR */}
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDelete(album.id)}
                            title="Eliminar"
                          >
                            🗑️
                          </button>

                        </div>
                      </td>
                    </tr>
                  ))}

                  {albums.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-4 text-muted">
                        No hay álbumes cargados.
                      </td>
                    </tr>
                  )}
                </tbody>

              </table>
            </div>
          )}
        </div>
      </div>

      {/* MODAL EDICIÓN */}
      {albumEdit && (
        <AlbumEditModal
          album={albumEdit}
          onClose={() => setAlbumEdit(null)}
          onSave={handleUpdateAlbum}
        />
      )}

    </div>
  );
}
