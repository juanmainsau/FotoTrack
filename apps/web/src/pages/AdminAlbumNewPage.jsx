import { useNavigate } from "react-router-dom";
import { useState } from "react";

export function AdminAlbumNewPage() {
  const navigate = useNavigate();

  // -------------------------
  // Estados del formulario
  // -------------------------
  const [form, setForm] = useState({
    nombreEvento: "",
    codigo: "",
    fechaEvento: "",
    localizacion: "",
    descripcion: "",
    precioFoto: "",
    precioAlbum: "",
    estado: "Borrador",
    visibilidad: "Público",
    tags: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // -------------------------
  // Estados para carga de imágenes
  // -------------------------
  const [createdAlbumId, setCreatedAlbumId] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);

  // -------------------------
  // Manejo de cambios formulario
  // -------------------------
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // -------------------------
  // Submit → POST /api/albums
  // -------------------------
  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:4000/api/albums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Error en la API");

      const data = await res.json(); // { idAlbum }
      console.log("Álbum creado:", data);

      setCreatedAlbumId(data.idAlbum);
      setSuccessMsg(
        `Álbum creado correctamente (ID ${data.idAlbum}). Ahora podés cargar las fotos.`
      );
    } catch (err) {
      console.error(err);
      setErrorMsg("No se pudo crear el álbum.");
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    navigate("/admin/albums");
  }

  // -------------------------
  // Manejo de archivos seleccionados
  // -------------------------
  function handleFilesChange(e) {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
    setUploadError(null);
  }

  // -------------------------
  // Subir imágenes → POST /api/imagenes
  // -------------------------
  async function handleUploadImages() {
    if (!createdAlbumId) {
      setUploadError("Primero tenés que guardar el álbum.");
      return;
    }
    if (selectedFiles.length === 0) {
      setUploadError("Seleccioná al menos una imagen.");
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const nuevas = [];

      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("idAlbum", createdAlbumId);
        formData.append("imagen", file);

        const res = await fetch("http://localhost:4000/api/imagenes", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Error al subir imagen");

        const data = await res.json(); // { idImagen }
        nuevas.push({
          id: data.idImagen,
          ruta: `uploads/miniaturas/${file.name}`,
        });
      }

      setUploadedImages((prev) => [...prev, ...nuevas]);
      setSelectedFiles([]);

    } catch (err) {
      console.error(err);
      setUploadError("Ocurrió un error al subir las imágenes.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {/* SIDEBAR SIMPLE */}
      <aside
        className="border-end d-flex flex-column"
        style={{ width: "260px", backgroundColor: "#f8f9fa" }}
      >
        <div className="p-4 border-bottom">
          <h4 className="fw-bold mb-0">FotoTrack</h4>
          <small className="text-muted">Admin · Nuevo álbum</small>
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

          <hr className="my-3" />

          <button
            type="button"
            onClick={handleCancel}
            className="btn btn-link px-0 py-1 text-start"
          >
            ↩ Volver a álbumes
          </button>
          <a href="#" className="nav-link px-0 py-1 text-danger">
            ⏻ Cerrar sesión
          </a>
        </nav>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-grow-1 p-4 p-md-5">
        <section className="mb-4">
          <h2 className="fw-bold mb-1">Nuevo álbum</h2>
          <p className="text-muted mb-0">
            Primero cargá los datos del evento. Una vez guardado, podés subir
            fotos.
          </p>
        </section>

        {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
        {successMsg && <div className="alert alert-success">{successMsg}</div>}

        <form onSubmit={handleSubmit}>
          <div className="row g-4">
            {/* Columna izquierda */}
            <div className="col-12 col-lg-7">
              <section className="mb-4">
                <h5 className="fw-semibold mb-3">Datos del evento</h5>

                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <div className="mb-3">
                      <label className="form-label">
                        Nombre del álbum / evento *
                      </label>
                      <input
                        name="nombreEvento"
                        type="text"
                        className="form-control"
                        placeholder="Ej: Rally MTB Posadas"
                        value={form.nombreEvento}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Código interno</label>
                      <input
                        name="codigo"
                        type="text"
                        className="form-control"
                        placeholder="Ej: MTB-POS-2025"
                        value={form.codigo}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label">Fecha *</label>
                        <input
                          name="fechaEvento"
                          type="date"
                          className="form-control"
                          value={form.fechaEvento}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="col-12 col-md-6">
                        <label className="form-label">Ubicación *</label>
                        <input
                          name="localizacion"
                          type="text"
                          className="form-control"
                          placeholder="Ciudad, provincia"
                          value={form.localizacion}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="form-label">Descripción</label>
                      <textarea
                        name="descripcion"
                        className="form-control"
                        rows="3"
                        value={form.descripcion}
                        onChange={handleChange}
                        placeholder="Información adicional..."
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Config comercial */}
              <section className="mb-4">
                <h5 className="fw-semibold mb-3">Configuración comercial</h5>

                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label">Precio por foto</label>
                        <input
                          name="precioFoto"
                          type="number"
                          className="form-control"
                          value={form.precioFoto}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="col-12 col-md-6">
                        <label className="form-label">Precio álbum</label>
                        <input
                          name="precioAlbum"
                          type="number"
                          className="form-control"
                          value={form.precioAlbum}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Columna derecha */}
            <div className="col-12 col-lg-5">
              <section className="mb-4">
                <h5 className="fw-semibold mb-3">Estado y visibilidad</h5>

                <div className="card border-0 shadow-sm mb-3">
                  <div className="card-body">
                    <label className="form-label">Estado</label>
                    <select
                      name="estado"
                      className="form-select mb-3"
                      value={form.estado}
                      onChange={handleChange}
                    >
                      <option value="Borrador">Borrador</option>
                      <option value="Publicado">Publicado</option>
                      <option value="Archivado">Archivado</option>
                    </select>

                    <label className="form-label">Visibilidad</label>
                    <select
                      name="visibilidad"
                      className="form-select mb-3"
                      value={form.visibilidad}
                      onChange={handleChange}
                    >
                      <option value="Público">Público</option>
                      <option value="Oculto">Oculto</option>
                    </select>

                    <label className="form-label">Etiquetas</label>
                    <input
                      name="tags"
                      type="text"
                      className="form-control"
                      value={form.tags}
                      onChange={handleChange}
                      placeholder="Ej: XCO, nocturna..."
                    />
                  </div>
                </div>
              </section>

              {/* Carga de fotos */}
              <section className="mb-4">
                <h5 className="fw-semibold mb-3">Carga de fotos</h5>

                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    {!createdAlbumId && (
                      <div className="alert alert-info">
                        Guardá el álbum para habilitar la carga de fotos.
                      </div>
                    )}

                    <div className="mb-3">
                      <label className="form-label">Seleccionar imágenes</label>
                      <input
                        type="file"
                        className="form-control"
                        multiple
                        accept="image/*"
                        onChange={handleFilesChange}
                        disabled={!createdAlbumId || uploading}
                      />
                    </div>

                    {selectedFiles.length > 0 && (
                      <div className="small mb-3">
                        <strong>Archivos seleccionados:</strong>
                        <ul>
                          {selectedFiles.map((f) => (
                            <li key={f.name}>{f.name}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {uploadError && (
                      <div className="alert alert-danger py-2">
                        {uploadError}
                      </div>
                    )}

                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={handleUploadImages}
                      disabled={
                        !createdAlbumId ||
                        selectedFiles.length === 0 ||
                        uploading
                      }
                    >
                      {uploading ? "Subiendo..." : "Subir imágenes"}
                    </button>

                    {uploadedImages.length > 0 && (
                      <>
                        <hr />
                        <div className="small mb-2">
                          <strong>Imágenes subidas:</strong>
                        </div>

                        <div className="d-flex flex-wrap gap-2">
                          {uploadedImages.map((img) => (
                            <div
                              key={img.id}
                              style={{
                                width: 80,
                                height: 80,
                                borderRadius: 8,
                                overflow: "hidden",
                                border: "1px solid #ddd",
                              }}
                            >
                              <img
                                src={`http://localhost:4000/${img.ruta}`}
                                alt=""
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </section>

              {/* Acciones finales */}
              <section>
                <div className="d-flex flex-wrap gap-2 justify-content-end">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={handleCancel}
                    disabled={loading || uploading}
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="btn btn-ft btn-ft-solid"
                    disabled={loading}
                  >
                    {loading ? "Guardando..." : "Guardar álbum"}
                  </button>
                </div>
              </section>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
