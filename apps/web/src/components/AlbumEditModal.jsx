// src/components/AlbumEditModal.jsx
import { useEffect, useState, useRef } from "react";
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
  
  // Estados para la subida de nuevas imágenes
  const [uploading, setUploading] = useState(false);
  const [syncing, setSyncing] = useState(false); // 👈 Nuevo estado para la sincronización
  const fileInputRef = useRef(null);

  // Cargar datos iniciales del álbum al abrir el modal
  useEffect(() => {
    if (!album) return;

    setForm({
      nombreEvento: album.nombre || "",
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

  // 🚀 Función para disparar el re-escaneo de caras (Sincronización IA)
  const handleSyncIA = async () => {
    if (!window.confirm("¿Re-escanear todo el álbum? Esto buscará nuevas caras y generará matches con usuarios registrados.")) return;
    
    setSyncing(true);
    try {
      const res = await fetch(`http://localhost:4000/api/albums/${album.id}/reprocess`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${localStorage.getItem("fototrack-token")}` }
      });
      const data = await res.json();
      if (data.ok) {
        toast.success(data.message || "Sincronización terminada", { icon: '🤖' });
      } else {
        toast.error(data.error || "Error al sincronizar");
      }
    } catch (err) {
      toast.error("Error de conexión con el servidor de IA.");
    } finally {
      setSyncing(false);
    }
  };

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
    if (!window.confirm("¿Estás seguro de eliminar esta foto? Esta acción no se puede deshacer.")) return;

    try {
      const res = await fetch(`http://localhost:4000/api/imagenes/${img.idImagen}`, { 
        method: "DELETE",
        headers: { "Authorization": `Bearer ${localStorage.getItem("fototrack-token")}` }
      });
      const data = await res.json();

      if (!res.ok || !data.ok) throw new Error(data.error || "Error al eliminar");

      setImagenes((prev) => prev.filter((i) => i.idImagen !== img.idImagen));
      toast.success("Imagen eliminada correctamente");
    } catch (err) {
      console.error(err);
      toast.error("No se pudo eliminar la imagen");
    }
  }

  async function handleUploadNewImages(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("images", files[i]);
    }

    try {
      const res = await fetch(`http://localhost:4000/api/albums/${album.id}/images`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${localStorage.getItem("fototrack-token")}` },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error en el servidor al subir archivos");
      }

      toast.success(`${files.length} imágenes añadidas. La IA las está procesando.`);
      loadImages(album.id);
    } catch (err) {
      console.error("Error subiendo imágenes:", err);
      toast.error(err.message || "Error al subir las nuevas fotos.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  if (!album) return null;

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1050 }} onClick={onClose}></div>

      <div className="modal fade show" style={{ display: "block", zIndex: 1060 }} tabIndex="-1">
        <div className="modal-dialog modal-xl modal-dialog-scrollable shadow-lg">
          <div className="modal-content border-0">
            
            <div className="modal-header bg-white border-bottom">
              <h5 className="modal-title fw-bold">Editar álbum #{album.id} - {album.nombre}</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>

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
                    <label className="form-label fw-bold small text-muted text-uppercase">Estado actual</label>
                    <select 
                      className="form-select border-primary-subtle" 
                      name="estado" 
                      value={form.estado} 
                      onChange={handleChange}
                    >
                      <option value="Borrador">Borrador (Oculto para clientes)</option>
                      <option value="Publicado">Publicado (Visible y a la venta)</option>
                      <option value="oculto">Archivado</option>
                    </select>
                    <div className="form-text small">
                      {form.estado === 'Borrador' && "⚠️ Los clientes no podrán ver este álbum."}
                      {form.estado === 'Publicado' && "✅ El álbum está en vivo y procesando ventas."}
                      {form.estado === 'oculto' && "📁 El álbum se moverá al archivo histórico."}
                    </div>
                  </div>

                 {/* <div className="col-md-3">
                    <label className="form-label fw-bold small text-muted">Visibilidad</label>
                    <select className="form-select" name="visibilidad" value={form.visibilidad} onChange={handleChange}>
                      <option value="Público">Público</option>
                      <option value="Privado">Privado</option>
                    </select>
                  </div>*/}

                  <div className="col-md-12">
                    <label className="form-label fw-bold small text-muted">Tags</label>
                    <input type="text" className="form-control" name="tags" value={form.tags} onChange={handleChange} placeholder="xco, mtb, san vicente..." />
                  </div>
                </div>

                <hr className="my-4" />

                <div className="d-flex justify-content-between align-items-center mb-3 bg-light p-3 rounded border">
                   <div>
                     <h6 className="fw-bold mb-1">Galería de Imágenes</h6>
                     <p className="small text-muted mb-0">Total: {imagenes.length} fotos cargadas</p>
                   </div>
                   
                   <div className="d-flex gap-2">
                     {/* 🤖 BOTÓN DE SINCRONIZACIÓN IA AGREGADO */}
                     <button 
                        type="button" 
                        className="btn btn-warning btn-sm fw-bold shadow-sm"
                        onClick={handleSyncIA}
                        disabled={syncing || uploading}
                     >
                       {syncing ? (
                         <>
                           <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                           Procesando IA...
                         </>
                       ) : (
                         "🤖 Re-escanear Caras"
                       )}
                     </button>

                     <input 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        className="d-none" 
                        ref={fileInputRef}
                        onChange={handleUploadNewImages}
                     />
                     <button 
                        type="button" 
                        className="btn btn-primary btn-sm fw-bold shadow-sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading || syncing}
                     >
                       {uploading ? (
                         <>
                           <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                           Subiendo...
                         </>
                       ) : (
                         "➕ Subir Nuevas Fotos"
                       )}
                     </button>
                   </div>
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
                        <div className="card h-100 border-0 shadow-sm overflow-hidden position-relative">
                          <img 
                            src={img.rutaMiniatura} 
                            className="card-img-top" 
                            style={{ aspectRatio: "1/1", objectFit: "cover" }} 
                            alt="" 
                          />
                          <button 
                             type="button" 
                             className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 p-1 lh-1" 
                             style={{ borderRadius: "50%", width: "24px", height: "24px" }}
                             onClick={() => handleDeleteImage(img)}
                             title="Eliminar foto"
                           >
                             ✖
                           </button>
                        </div>
                      </div>
                    ))}
                    {imagenes.length === 0 && <p className="text-center text-muted py-4 w-100">No hay fotos en este álbum.</p>}
                  </div>
                )}
              </form>
            </div>

            <div className="modal-footer border-top bg-light">
              <button type="button" className="btn btn-secondary px-4" onClick={onClose} disabled={saving || uploading || syncing}>
                Cancelar
              </button>
              <button type="submit" form="editAlbumForm" className="btn btn-success px-4" disabled={saving || uploading || syncing}>
                {saving ? "Guardando..." : "💾 Guardar Cambios"}
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}