// src/components/AlbumEditModal.jsx
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export function AlbumEditModal({ album, onClose, onUpdated }) {
  const [form, setForm] = useState({
    nombreEvento: "",
    fechaEvento: "",
    localizacion: "",
    descripcion: "",
    precioFoto: "",
    precioAlbum: "",
    estado: "",
    visibilidad: "",
    tags: "",
  });

  const [imagenes, setImagenes] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [saving, setSaving] = useState(false);

  // Cargar datos iniciales del álbum
  useEffect(() => {
    if (!album) return;

    setForm({
      nombreEvento: album.nombreEvento || "",
      fechaEvento: album.fechaEvento
        ? album.fechaEvento.substring(0, 10)
        : "",
      localizacion: album.localizacion || "",
      descripcion: album.descripcion || "",
      precioFoto: album.precioFoto ?? "",
      precioAlbum: album.precioAlbum ?? "",
      estado: album.estado || "activo",
      visibilidad: album.visibilidad || "Público",
      tags: album.tags || "",
    });

    loadImages(album.idAlbum);
  }, [album]);

  async function loadImages(idAlbum) {
    try {
      setLoadingImages(true);
      const res = await fetch(
        `http://localhost:4000/api/imagenes/album/${idAlbum}`
      );
      const data = await res.json();

      if (data.ok) {
        setImagenes(data.imagenes || []);
      } else {
        setImagenes([]);
      }
    } catch (err) {
      console.error("Error cargando imágenes del álbum:", err);
      setImagenes([]);
    } finally {
      setLoadingImages(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!album) return;

    try {
      setSaving(true);

      const payload = {
        ...form,
        precioFoto: form.precioFoto === "" ? null : Number(form.precioFoto),
        precioAlbum: form.precioAlbum === "" ? null : Number(form.precioAlbum),
      };

      const res = await fetch(
        `http://localhost:4000/api/albums/${album.idAlbum}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "No se pudo actualizar el álbum");
      }

      toast.success("Álbum actualizado correctamente");
      onUpdated?.();
      onClose?.();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Error al actualizar el álbum");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteImage(img) {
    if (!window.confirm("¿Eliminar esta imagen del álbum?")) return;

    try {
      console.log("[DeleteImage] Eliminando imagen:", img);

      const res = await fetch(
        `http://localhost:4000/api/imagenes/${img.idImagen}`,
        { method: "DELETE" }
      );

      const data = await res.json();
      console.log("[DeleteImage] Respuesta API:", data);

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "No se pudo eliminar la imagen");
      }

      setImagenes((prev) =>
        prev.filter((i) => i.idImagen !== img.idImagen)
      );
      toast.success("Imagen eliminada");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Error al eliminar la imagen");
    }
  }

  if (!album) return null;

  return (
    <div className="modal-backdrop fade show" style={{ display: "block" }}>
      <div
        className="modal fade show"
        style={{ display: "block" }}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-xl modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                Editar álbum #{album.idAlbum} - {album.nombreEvento}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
              ></button>
            </div>

            <div className="modal-body">
              {/* Datos del evento */}
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Nombre del evento</label>
                    <input
                      type="text"
                      className="form-control"
                      name="nombreEvento"
                      value={form.nombreEvento}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Fecha del evento</label>
                    <input
                      type="date"
                      className="form-control"
                      name="fechaEvento"
                      value={form.fechaEvento}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Localización</label>
                    <input
                      type="text"
                      className="form-control"
                      name="localizacion"
                      value={form.localizacion}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-12">
                    <label className="form-label">Descripción</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      name="descripcion"
                      value={form.descripcion}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Precio por foto</label>
                    <input
                      type="number"
                      className="form-control"
                      name="precioFoto"
                      value={form.precioFoto}
                      onChange={handleChange}
                      min="0"
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Precio álbum completo</label>
                    <input
                      type="number"
                      className="form-control"
                      name="precioAlbum"
                      value={form.precioAlbum}
                      onChange={handleChange}
                      min="0"
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Estado</label>
                    <select
                      className="form-select"
                      name="estado"
                      value={form.estado}
                      onChange={handleChange}
                    >
                      <option value="activo">Activo</option>
                      <option value="archivado">Archivado</option>
                    </select>
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Visibilidad</label>
                    <select
                      className="form-select"
                      name="visibilidad"
                      value={form.visibilidad}
                      onChange={handleChange}
                    >
                      <option value="Público">Público</option>
                      <option value="Privado">Privado</option>
                    </select>
                  </div>

                  <div className="col-md-12">
                    <label className="form-label">Tags</label>
                    <input
                      type="text"
                      className="form-control"
                      name="tags"
                      value={form.tags}
                      onChange={handleChange}
                      placeholder="xco, mtb, san vicente..."
                    />
                  </div>
                </div>

                <hr className="my-4" />

                {/* Grid de imágenes */}
                <h6>
                  Imágenes del álbum{" "}
                  <span className="badge bg-secondary ms-2">
                    {imagenes.length} fotos
                  </span>
                </h6>

                {loadingImages && <p>Cargando imágenes...</p>}

                {!loadingImages && imagenes.length === 0 && (
                  <p className="text-muted">Este álbum aún no tiene fotos.</p>
                )}

                <div className="row g-2 mt-2">
                  {imagenes.map((img) => (
                    <div
                      key={img.idImagen}
                      className="col-4 col-md-3 col-lg-2 d-flex flex-column align-items-stretch"
                    >
                      <img
                        src={img.rutaMiniatura}
                        alt=""
                        className="img-fluid rounded shadow-sm"
                        style={{
                          width: "100%",
                          aspectRatio: "1 / 1",
                          objectFit: "cover",
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm mt-1"
                        onClick={() => handleDeleteImage(img)}
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
                </div>

                <hr className="my-4" />

                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={onClose}
                    disabled={saving}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? "Guardando..." : "Guardar cambios"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
