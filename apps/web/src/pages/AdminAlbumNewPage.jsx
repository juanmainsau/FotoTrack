// apps/web/src/pages/AdminAlbumNewPage.jsx
import { useNavigate } from "react-router-dom";

export function AdminAlbumNewPage() {
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    // Más adelante: enviar datos al backend
    console.log("Álbum nuevo (mock) enviado");
  };

  const handleCancel = () => {
    navigate("/admin/albums");
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {/* SIDEBAR SIMPLE */}
      <aside
        className="border-end d-flex flex-column"
        style={{
          width: "260px",
          backgroundColor: "#f8f9fa",
        }}
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
        {/* Título + descripción */}
        <section className="mb-4">
          <h2 className="fw-bold mb-1">Nuevo álbum</h2>
          <p className="text-muted mb-0">
            Definí los datos del evento, la configuración comercial y las opciones
            de procesamiento automático. Más adelante vamos a conectar este formulario
            con la API y la base de datos.
          </p>
        </section>

        <form onSubmit={handleSubmit}>
          <div className="row g-4">
            {/* Columna izquierda: datos generales */}
            <div className="col-12 col-lg-7">
              {/* Datos del evento */}
              <section className="mb-4">
                <h5 className="fw-semibold mb-3">Datos del evento</h5>

                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <div className="mb-3">
                      <label className="form-label">
                        Nombre del álbum / evento <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ej: Desafío MTB Posadas 2025"
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">
                        Código interno del álbum
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ej: MTB-POS-2025"
                      />
                      <div className="form-text">
                        Este código sirve como identificador interno en la gestión y en los reportes.
                      </div>
                    </div>

                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label">
                          Fecha del evento <span className="text-danger">*</span>
                        </label>
                        <input type="date" className="form-control" required />
                      </div>

                      <div className="col-12 col-md-6">
                        <label className="form-label">
                          Ubicación <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Ciudad, provincia"
                          required
                        />
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="form-label">Descripción</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        placeholder="Información adicional sobre la carrera, categorías, etc."
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Configuración comercial */}
              <section className="mb-4">
                <h5 className="fw-semibold mb-3">Configuración comercial</h5>

                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label">
                          Precio por foto (ARS) <span className="text-danger">*</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="form-control"
                          placeholder="Ej: 1500"
                          required
                        />
                      </div>

                      <div className="col-12 col-md-6">
                        <label className="form-label">
                          Precio por álbum completo (ARS)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="form-control"
                          placeholder="Ej: 18000"
                        />
                        <div className="form-text">
                          Dejar en blanco si no se vende el álbum completo como paquete.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Procesamiento automático */}
              <section className="mb-4">
                <h5 className="fw-semibold mb-3">Procesos automáticos</h5>

                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <p className="text-muted small mb-3">
                      Estos procesos se ejecutan del lado del servidor cuando se cargan las fotos.
                      Más adelante se van a vincular con la API y los jobs que procesan imágenes.
                    </p>

                    <div className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="proc-optimizar"
                        defaultChecked
                      />
                      <label className="form-check-label" htmlFor="proc-optimizar">
                        Optimizar tamaño y peso de las imágenes para visualización web
                      </label>
                    </div>

                    <div className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="proc-watermark"
                        defaultChecked
                      />
                      <label className="form-check-label" htmlFor="proc-watermark">
                        Aplicar marca de agua de Resolana Fotografía en las previsualizaciones
                      </label>
                    </div>

                    <div className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="proc-face"
                        defaultChecked
                      />
                      <label className="form-check-label" htmlFor="proc-face">
                        Preparar imágenes para reconocimiento facial (face-api.js)
                      </label>
                    </div>

                    <div className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="proc-entrega"
                        defaultChecked
                      />
                      <label className="form-check-label" htmlFor="proc-entrega">
                        Habilitar entrega automática de compras por correo electrónico
                      </label>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Columna derecha: estado, visibilidad y carga de fotos */}
            <div className="col-12 col-lg-5">
              {/* Estado y visibilidad */}
              <section className="mb-4">
                <h5 className="fw-semibold mb-3">Estado y visibilidad</h5>

                <div className="card border-0 shadow-sm mb-3">
                  <div className="card-body">
                    <div className="mb-3">
                      <label className="form-label">
                        Estado del álbum <span className="text-danger">*</span>
                      </label>
                      <select className="form-select" defaultValue="Borrador" required>
                        <option value="Borrador">Borrador</option>
                        <option value="Publicado">Publicado</option>
                        <option value="Archivado">Archivado</option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">
                        Visibilidad <span className="text-danger">*</span>
                      </label>
                      <select className="form-select" defaultValue="Público" required>
                        <option value="Público">Público (visible para los usuarios)</option>
                        <option value="Oculto">Oculto (solo visible para admin)</option>
                      </select>
                    </div>

                    <div className="mb-0">
                      <label className="form-label">Etiquetas (tags)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ej: XCO, nocturna, campeonato provincial..."
                      />
                      <div className="form-text">
                        Opcional. Pueden ayudar a búsquedas internas y reportes.
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Carga de fotos (placeholder) */}
              <section className="mb-4">
                <h5 className="fw-semibold mb-3">Carga de fotos</h5>

                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <div
                      className="border rounded-3 d-flex flex-column justify-content-center align-items-center text-center p-4"
                      style={{
                        borderStyle: "dashed",
                        backgroundColor: "#f8f9fa",
                      }}
                    >
                      <span className="mb-2">📁</span>
                      <p className="mb-1 fw-semibold">
                        Arrastrá y soltá las fotos aquí
                      </p>
                      <p className="text-muted small mb-2">
                        O hacé clic para seleccionar archivos desde tu computadora.
                      </p>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                      >
                        Seleccionar archivos
                      </button>
                    </div>

                    <div className="form-text mt-2">
                      Esta sección es solo maquetado por ahora. Más adelante se conectará
                      con el backend para subir archivos, procesarlos y vincularlos al álbum.
                    </div>
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
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-ft btn-ft-solid">
                    Guardar álbum
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
