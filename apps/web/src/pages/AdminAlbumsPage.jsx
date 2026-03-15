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

// BADGES - Componentes visuales para el estado
function EstadoBadge({ estado }) {
  const base = "badge rounded-pill";
  const valor = (estado || "").toLowerCase();

  if (valor === "publicado" || valor === "activo") {
    return <span className={`${base} text-bg-success`}>Publicado</span>;
  }
  if (valor === "borrador") {
    return <span className={`${base} text-bg-secondary`}>Borrador</span>;
  }
  return <span className={base}>{estado}</span>;
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
        visibilidad: a.visibilidad, // Mantenemos en memoria por si el BE lo pide
        precioFoto: a.precioFoto,
        precioAlbum: a.precioAlbum,
        tags: a.tags,
        fotosTotales: a.totalFotos ?? 0,
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
      "¡ATENCIÓN! ¿Seguro que querés ELIMINAR este álbum de forma permanente? Se borrarán todos los datos asociados. Esta acción no se puede deshacer."
    );
    if (!confirmar) return;

    try {
      await deleteAlbum(id);
      alert("Álbum eliminado correctamente.");
      loadAlbums(); 
    } catch (err) {
      console.error(err);
      alert("No se pudo eliminar el álbum.");
    }
  }

  async function handleUpdateAlbum(id, data) {
    try {
      const token = localStorage.getItem("fototrack-token");

      const res = await fetch(`http://localhost:4000/api/albums/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Error en la respuesta del servidor");

      setAlbumEdit(null);
      loadAlbums(); 
      alert("Álbum actualizado correctamente.");
    } catch (err) {
      console.error(err);
      alert("No se pudo actualizar el álbum.");
    }
  }

  return (
    <div className="p-4 p-md-5">
      {/* HEADER SECCIÓN */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Gestión de álbumes</h2>
          <p className="text-muted">
            ABM: Administrá tus álbumes, estados y contenido.
          </p>
        </div>

        <button
          className="btn btn-primary btn-sm px-4 rounded-pill fw-bold"
          onClick={() => navigate("/admin/albums/nuevo")}
        >
          ➕ Crear álbum
        </button>
      </div>

      {/* TABLA DE GESTIÓN */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          {loading && <div className="p-4 text-center">Cargando álbumes...</div>}

          {!loading && error && (
            <div className="p-4 text-center text-danger">{error}</div>
          )}

          {!loading && !error && (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: 80 }} className="ps-4 text-center">Miniatura</th>
                    <th>Nombre</th>
                    <th>Código</th>
                    <th>Ubicación / Fecha</th>
                    <th className="text-center">Fotos</th>
                    <th className="text-center">Estado</th>
                    <th className="text-center pe-4" style={{ width: 140 }}>
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {albums.map((album) => (
                    <tr key={album.id}>
                      <td className="ps-4 text-center">
                        {album.miniatura ? (
                          <img
                            src={album.miniatura}
                            alt="miniatura"
                            style={{
                              width: 50,
                              height: 50,
                              objectFit: "cover",
                              borderRadius: 8,
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 50,
                              height: 50,
                              background: "#f0f0f0",
                              borderRadius: 8,
                              display: "inline-block" // Para que centre bien con text-center
                            }}
                          ></div>
                        )}
                      </td>

                      <td className="fw-bold">{album.nombre}</td>

                      <td>
                        <span className="badge bg-light text-dark border font-monospace">
                          {album.codigo}
                        </span>
                      </td>

                      <td>
                        <div className="small fw-semibold">{album.ubicacion}</div>
                        <div className="small text-muted">{album.fechaEvento}</div>
                      </td>

                      <td className="text-center fw-bold">{album.fotosTotales}</td>

                      <td className="text-center">
                        <EstadoBadge estado={album.estado} />
                      </td>

                      <td className="pe-4 text-center">
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => setAlbumEdit(album)}
                            title="Editar Álbum"
                          >
                            ✏️
                          </button>

                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDelete(album.id)}
                            title="Eliminar Álbum"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {albums.length === 0 && (
                    <tr>
                      {/* ✅ FIX: colSpan reducido a 7 porque quitamos Visibilidad */}
                      <td colSpan={7} className="text-center py-5 text-muted">
                        No hay álbumes cargados en el sistema.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* MODAL PARA MODIFICACIÓN (ABM) */}
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