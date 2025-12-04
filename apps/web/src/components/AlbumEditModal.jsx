// src/components/AlbumEditModal.jsx
import { useState, useEffect } from "react";

export function AlbumEditModal({ album, onClose, onSave }) {
  const [form, setForm] = useState({
    nombreEvento: "",
    descripcion: "",
    fechaEvento: "",
    localizacion: "",
    precioFoto: "",
    precioAlbum: "",
    estado: "",
    visibilidad: "",
    tags: "",
  });

  const [imagenes, setImagenes] = useState([]);

  // Cargar datos iniciales
  useEffect(() => {
    if (album) {
      setForm({
        nombreEvento: album.nombre || "",
        descripcion: album.descripcion || "",
        fechaEvento: album.fechaEventoOriginal || "",
        localizacion: album.ubicacion || "",
        precioFoto: album.precioFoto || "",
        precioAlbum: album.precioAlbum || "",
        estado: album.estado || "Borrador",
        visibilidad: album.visibilidad || "Público",
        tags: album.tags || "",
      });

      // Cargar imágenes del álbum
      fetch(`http://localhost:4000/api/imagenes/album/${album.id}`)
        .then((res) => res.json())
        .then((data) => setImagenes(data))
        .catch((err) =>
          console.error("Error cargando imágenes:", err)
        );
    }
  }, [album]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  function handleSubmit() {
    onSave(album.id, form);
  }

  // -----------------------------
  // ELIMINAR FOTO INDIVIDUAL
  // -----------------------------
  async function handleDeleteImage(idImagen) {
    const confirmar = window.confirm(
      "¿Eliminar esta imagen? Esta acción no se puede deshacer."
    );
    if (!confirmar) return;

    const url = `http://localhost:4000/api/imagenes/${idImagen}`;
    const token = localStorage.getItem("fototrack-token");

    console.log("[DeleteImage] Eliminando imagen:", {
      idImagen,
      url,
      tokenPresente: !!token,
    });

    try {
      const res = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const text = await res.text();
      let json;
      try {
        json = text ? JSON.parse(text) : null;
      } catch {
        json = text;
      }

      console.log("[DeleteImage] Respuesta API:", {
        status: res.status,
        ok: res.ok,
        body: json,
      });

      if (!res.ok) {
        alert("La API devolvió un error al eliminar la imagen. Revisá consola.");
        return;
      }

      // Si todo OK, actualizamos el estado local
      setImagenes((prev) =>
        prev.filter((img) => img.idImagen !== idImagen)
      );
    } catch (err) {
      console.error("Error al eliminar imagen:", err);
      alert("No se pudo eliminar la imagen (error de red o servidor apagado).");
    }
  }

  return (
    <div
      className="modal fade show"
      style={{
        display: "block",
        background: "rgba(0,0,0,0.4)",
      }}
    >
      <div className="modal-dialog modal-xl">
        <div
          className="modal-content"
          style={{ maxHeight: "90vh", overflowY: "auto" }}
        >
          {/* HEADER */}
          <div className="modal-header d-flex justify-content-between align-items-center">
            <div>
              <h5 className="modal-title fw-bold">
                📸 Editar álbum —{" "}
                <span className="text-primary">{album.codigo}</span>
              </h5>
              <div className="text-muted small">{album.nombre}</div>
            </div>

            {album.miniatura && (
              <img
                src={album.miniatura}
                alt="miniatura"
                style={{
                  width: 80,
                  height: 80,
                  objectFit: "cover",
                  borderRadius: 8,
                }}
              />
            )}

            <button className="btn-close" onClick={onClose}></button>
          </div>

          {/* BODY */}
          <div className="modal-body">
            {/* 1) INFORMACIÓN GENERAL */}
            <h5 className="fw-semibold mb-3">Información general</h5>
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Nombre del evento
                  </label>
                  <input
                    className="form-control"
                    name="nombreEvento"
                    value={form.nombreEvento}
                    onChange={handleChange}
                  />
                </div>

                <div className="row g-3">
                  <div className="col-6">
                    <label className="form-label fw-semibold">
                      Fecha del evento
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      name="fechaEvento"
                      value={form.fechaEvento}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-6">
                    <label className="form-label fw-semibold">
                      Ubicación
                    </label>
                    <input
                      className="form-control"
                      name="localizacion"
                      value={form.localizacion}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="form-label fw-semibold">
                    Descripción
                  </label>
                  <textarea
                    className="form-control"
                    name="descripcion"
                    rows={3}
                    value={form.descripcion}
                    onChange={handleChange}
                  ></textarea>
                </div>

                <div className="mt-3">
                  <label className="form-label fw-semibold">Tags</label>
                  <input
                    className="form-control"
                    name="tags"
                    value={form.tags}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* 2) PRECIOS */}
            <h5 className="fw-semibold mb-3">Precios</h5>
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body row g-3">
                <div className="col-6">
                  <label className="form-label fw-semibold">
                    Precio por foto
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    name="precioFoto"
                    value={form.precioFoto}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-6">
                  <label className="form-label fw-semibold">
                    Precio álbum completo
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    name="precioAlbum"
                    value={form.precioAlbum}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* 3) ESTADO & VISIBILIDAD */}
            <h5 className="fw-semibold mb-3">Estado y visibilidad</h5>
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body row g-3">
                <div className="col-6">
                  <label className="form-label fw-semibold">
                    Estado
                  </label>
                  <select
                    className="form-select"
                    name="estado"
                    value={form.estado}
                    onChange={handleChange}
                  >
                    <option value="Borrador">Borrador</option>
                    <option value="Publicado">Publicado</option>
                    <option value="Archivado">Archivado</option>
                  </select>
                </div>

                <div className="col-6">
                  <label className="form-label fw-semibold">
                    Visibilidad
                  </label>
                  <select
                    className="form-select"
                    name="visibilidad"
                    value={form.visibilidad}
                    onChange={handleChange}
                  >
                    <option value="Público">Público</option>
                    <option value="Oculto">Oculto</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 4) IMÁGENES DEL ÁLBUM */}
            <h5 className="fw-semibold mb-3">
              Imágenes del álbum ({imagenes.length})
            </h5>

            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                {imagenes.length === 0 && (
                  <div className="text-muted text-center py-3">
                    No hay imágenes cargadas
                  </div>
                )}

                {/* CONTENEDOR SCROLLEABLE */}
                <div
                  style={{
                    maxHeight: "480px",
                    overflowY: "auto",
                    border: "1px solid #ddd",
                    borderRadius: 8,
                    padding: 8,
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(8, 1fr)",
                      gap: "8px",
                    }}
                  >
                    {imagenes.map((img) => (
                      <div
                        key={img.idImagen}
                        style={{
                          position: "relative",
                          width: "100%",
                          paddingBottom: "100%",
                          borderRadius: 6,
                          overflow: "hidden",
                          border: "1px solid #ccc",
                        }}
                      >
                        <img
                          src={img.rutaMiniatura}
                          alt=""
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />

                        {/* BOTÓN ELIMINAR */}
                        <button
                          onClick={() =>
                            handleDeleteImage(img.idImagen)
                          }
                          title="Eliminar imagen"
                          style={{
                            position: "absolute",
                            top: 4,
                            right: 4,
                            background: "rgba(0,0,0,0.6)",
                            border: "none",
                            color: "white",
                            borderRadius: 4,
                            padding: "2px 5px",
                            cursor: "pointer",
                            fontSize: "0.75rem",
                            zIndex: 1000, // ← importante
                          }}
                        >
                          🗑️
                        </button>

                        {/* HOVER (ya no bloquea clics) */}
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            background: "rgba(0,0,0,0.15)",
                            opacity: 0,
                            transition: "0.2s",
                            pointerEvents: "none", // ← clave
                          }}
                        ></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              Guardar cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
