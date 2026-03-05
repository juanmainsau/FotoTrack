// src/components/AlbumEditModal.jsx
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export function AlbumEditModal({ album, onClose, onSave }) {
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

  // Cargar datos iniciales del álbum al abrir el modal
  useEffect(() => {
    if (!album) return;

    setForm({
      nombreEvento: album.nombre || "",
      // Usamos fechaEventoOriginal (YYYY-MM-DD) para que el input date funcione
      fechaEvento: album.fechaEventoOriginal
        ? album.fechaEventoOriginal.substring(0, 10)
        : "",
      localizacion: album.ubicacion || "",
      descripcion: album.descripcion || "",
      precioFoto: album.precioFoto ?? "",
      precioAlbum: album.precioAlbum ?? "",
      estado: album.estado || "activo",
      visibilidad: album.visibilidad || "Público",
      tags: album.tags || "",
    });

    loadImages(album.id);
  }, [album]);

  async function loadImages(id) {
    try {
      setLoadingImages(true);
      const res = await fetch(`http://localhost:4000/api/imagenes/album/${id}`);
      const data = await res.json();

      if (data.ok) {
        setImagenes(data.imagenes || []);
      } else {
        setImagenes([]);
      }
    } catch (err) {
      console.error("Error cargando imágenes:", err);
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

    setSaving(true);
    const payload = {
      ...form,
      precioFoto: form.precioFoto === "" ? null : Number(form.precioFoto),
      precioAlbum: form.precioAlbum === "" ? null : Number(form.precioAlbum),
    };

    try {
      await onSave(album.id, payload);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteImage(img) {
    if (!window.confirm("¿Eliminar esta imagen del álbum?")) return;

    try {
      const res = await fetch(`http://localhost:4000/api/imagenes/${img.idImagen}`, { 
        method: "DELETE" 
      });
      const data = await res.json();

      if (!res.ok || !data.ok) throw new Error(data.error || "Error al eliminar");

      setImagenes((prev) => prev.filter((i) => i.idImagen !== img.idImagen));
      toast.success("Imagen eliminada");
    } catch (err) {
      console.error(err);
      toast.error("No se pudo eliminar la imagen");
    }
  }

  if (!album) return null;

  return (
    <>
      {/* FONDO OSCURO (Backdrop) - Separado para evitar transparencia en el contenido */}
      <div 
        className="modal-backdrop fade show" 
        style={{ zIndex: 1050 }}
        onClick={onClose}
      ></div>

      {/* MODAL CONTAINER */}
      <div 
        className="modal fade show" 
        style={{ display: "block", zIndex: 1060 }} 
        tabIndex="-1"
      >
        <div className="modal-dialog modal-xl modal-dialog-scrollable shadow-lg">
          <div className="modal-content border-0">
            
            {/* Header */}
            <div className="modal-header bg-white border-bottom">
              <h5 className="modal-title fw-bold">
                Editar álbum #{album.id} - {album.nombre}
              </h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>

            {/* Body */}
            <div className="modal-body p-4 bg-white">
              <form id="editAlbumForm" onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold small text-muted">Nombre del evento</label>
                    <input type="text" className="form-control" name="nombreEvento" value={form.nombreEvento} onChange={handleChange} required />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label fw-bold small text-muted">Fecha del evento</label>
                    <input type="date" className="form-control" name="fechaEvento" value={form.fechaEvento} onChange={handleChange} required />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label fw-bold small text-muted">Localización</label>
                    <input type="text" className="form-control" name="localizacion" value={form.localizacion} onChange={handleChange} />
                  </div>

                  <div className="col-md-12">
                    <label className="form-label fw-bold small text-muted">Descripción</label>
                    <textarea className="form-control" rows="2" name="descripcion" value={form.descripcion} onChange={handleChange} />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label fw-bold small text-muted">Precio por foto</label>
                    <div className="input-group">
                      <span className="input-group-text">$</span>
                      <input type="number" className="form-control" name="precioFoto" value={form.precioFoto} onChange={handleChange} min="0" />
                    </div>
                  </div>

                  <div className="col-md-3">
                    <label className="form-label fw-bold small text-muted">Precio álbum completo</label>
                    <div className="input-group">
                      <span className="input-group-text">$</span>
                      <input type="number" className="form-control" name="precioAlbum" value={form.precioAlbum} onChange={handleChange} min="0" />
                    </div>
                  </div>

                  <div className="col-md-3">
                    <label className="form-label fw-bold small text-muted">Estado</label>
                    <select className="form-select" name="estado" value={form.estado} onChange={handleChange}>
                      <option value="activo">Activo</option>
                      <option value="borrador">Borrador</option>
                      <option value="archivado">Archivado</option>
                    </select>
                  </div>

                  <div className="col-md-3">
                    <label className="form-label fw-bold small text-muted">Visibilidad</label>
                    <select className="form-select" name="visibilidad" value={form.visibilidad} onChange={handleChange}>
                      <option value="Público">Público</option>
                      <option value="Oculto">Oculto</option>
                    </select>
                  </div>

                  <div className="col-md-12">
                    <label className="form-label fw-bold small text-muted">Tags</label>
                    <input type="text" className="form-control" name="tags" value={form.tags} onChange={handleChange} placeholder="xco, mtb, san vicente..." />
                  </div>
                </div>

                <hr className="my-4" />

                {/* Grid de imágenes con Scroll Propio */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                   <h6 className="fw-bold mb-0">Imágenes del álbum ({imagenes.length})</h6>
                </div>

                {loadingImages ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="mt-2 text-muted">Cargando galería...</p>
                  </div>
                ) : (
                  <div className="row g-2 overflow-auto" style={{ maxHeight: "400px", padding: "10px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
                    {imagenes.map((img) => (
                      <div key={img.idImagen} className="col-6 col-sm-4 col-md-3 col-lg-2">
                        <div className="card h-100 border-0 shadow-sm overflow-hidden">
                          <img 
                            src={img.rutaMiniatura} 
                            className="card-img-top" 
                            style={{ aspectRatio: "1/1", objectFit: "cover" }} 
                            alt="" 
                          />
                          <div className="card-body p-1">
                            <button 
                              type="button" 
                              className="btn btn-danger btn-sm w-100" 
                              style={{ fontSize: "0.7rem" }}
                              onClick={() => handleDeleteImage(img)}
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {imagenes.length === 0 && <p className="text-center text-muted py-4">No hay fotos en este álbum.</p>}
                  </div>
                )}
              </form>
            </div>

            {/* Footer */}
            <div className="modal-footer border-top bg-light">
              <button type="button" className="btn btn-secondary px-4" onClick={onClose} disabled={saving}>
                Cancelar
              </button>
              <button type="submit" form="editAlbumForm" className="btn btn-primary px-4" disabled={saving}>
                {saving ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}