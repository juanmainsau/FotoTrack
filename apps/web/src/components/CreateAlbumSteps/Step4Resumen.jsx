// src/components/CreateAlbumSteps/Step4Resumen.jsx
import { useEffect, useState } from "react";

export function Step4Resumen({ form, imagenes, back, onSubmit, submitting, submitError }) {
  const primeras6 = imagenes.slice(0, 6);
  const [urls, setUrls] = useState([]);

  // Generamos las URLs de vista previa al montar para evitar fugas de memoria
  useEffect(() => {
    const objectUrls = primeras6.map(file => URL.createObjectURL(file));
    setUrls(objectUrls);
    
    // Cleanup: liberamos las URLs de la memoria al desmontar el componente
    return () => objectUrls.forEach(url => URL.revokeObjectURL(url));
  }, [imagenes]);

  return (
    <div className="card border-0 shadow-sm p-4">
      <div className="d-flex align-items-center mb-3">
        <div className="bg-dark text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: 32, height: 32}}>4</div>
        <h4 className="fw-semibold mb-0">Resumen final</h4>
      </div>
      
      <p className="text-muted mb-4">
        Revisá toda la información antes de crear el álbum. Si algo no está bien,
        podés volver atrás para corregirlo.
      </p>

      <div className="row g-4">
        {/* BLOQUE 1 — DATOS DEL EVENTO */}
        <div className="col-md-6">
          <h6 className="fw-bold text-primary mb-2 text-uppercase small">Datos del evento</h6>
          <div className="border rounded p-3 bg-light shadow-sm h-100">
            <p className="mb-1"><strong>Nombre:</strong> {form.nombreEvento || "-"}</p>
            <p className="mb-1"><strong>Fecha:</strong> {form.fechaEvento || "-"}</p>
            <p className="mb-1"><strong>Ubicación:</strong> {form.localizacion || "-"}</p>
            <p className="mb-1"><strong>Descripción:</strong> {form.descripcion || "-"}</p>
            <p className="mb-0"><strong>Tags:</strong> <span className="badge bg-secondary">{form.tags || "Sin tags"}</span></p>
          </div>
        </div>

        {/* BLOQUE 2 — PRECIOS + ESTADO + VISIBILIDAD */}
        <div className="col-md-6">
          <h6 className="fw-bold text-primary mb-2 text-uppercase small">Configuración comercial</h6>
          <div className="border rounded p-3 bg-light shadow-sm h-100">
            <p className="mb-1">
              <strong>Precio por foto:</strong>{" "}
              <span className="text-success fw-bold">{form.precioFoto ? `$${form.precioFoto}` : "-"}</span>
            </p>
            <p className="mb-1">
              <strong>Precio por álbum:</strong>{" "}
              <span className="text-primary fw-bold">{form.precioAlbum ? `$${form.precioAlbum}` : "-"}</span>
            </p>
            <hr className="my-2" />
            <p className="mb-1">
              <strong>Estado:</strong> <span className={`badge ${form.estado === 'Publicado' ? 'bg-success' : 'bg-warning text-dark'}`}>{form.estado}</span>
            </p>
            <p className="mb-0">
              <strong>Visibilidad:</strong> <span className="badge bg-info text-dark">{form.visibilidad}</span>
            </p>
          </div>
        </div>

        {/* BLOQUE 3 — IMÁGENES */}
        <div className="col-12">
          <h6 className="fw-bold text-primary mb-2 text-uppercase small">Imágenes seleccionadas ({imagenes.length})</h6>
          <div className="border rounded p-3 bg-light shadow-sm">
            <div className="d-flex flex-wrap gap-3">
              {urls.map((url, index) => (
                <div
                  key={index}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 8,
                    overflow: "hidden",
                    border: "2px solid white",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                  }}
                >
                  <img
                    src={url}
                    alt={`preview-${index}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
              ))}
              
              {imagenes.length > 6 && (
                <div 
                  className="d-flex align-items-center justify-content-center bg-secondary text-white fw-bold"
                  style={{ width: 80, height: 80, borderRadius: 8, fontSize: '0.9rem' }}
                >
                  +{imagenes.length - 6}
                </div>
              )}
            </div>
            {imagenes.length > 0 && (
              <p className="text-muted small mt-3 mb-0">
                Se subirán <strong>{imagenes.length}</strong> archivos en total.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ERRORES SUBMIT */}
      {submitError && (
        <div className="alert alert-danger mt-4 d-flex align-items-center">
          <span className="me-2">⚠️</span>
          {submitError}
        </div>
      )}

      {/* BOTONES FINALES */}
      <div className="d-flex justify-content-between mt-5 pt-3 border-top">
        <button className="btn btn-outline-secondary px-4 fw-bold" onClick={back} disabled={submitting}>
          Volver
        </button>

        <button
          className="btn btn-success px-5 fw-bold shadow"
          onClick={onSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Subiendo fotos...
            </>
          ) : (
            "🚀 Confirmar y crear álbum"
          )}
        </button>
      </div>
    </div>
  );
}