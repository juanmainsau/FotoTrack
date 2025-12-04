export function Step4Resumen({ form, imagenes, back, onSubmit, submitting, submitError }) {
  const primeras6 = imagenes.slice(0, 6);

  return (
    <div className="card border-0 shadow-sm p-4">
      <h4 className="fw-semibold mb-3">Resumen final</h4>
      <p className="text-muted mb-4">
        Revisá toda la información antes de crear el álbum. Si algo no está bien,
        podés volver atrás para corregirlo.
      </p>

      <div className="row g-4">

        {/* BLOQUE 1 — DATOS DEL EVENTO */}
        <div className="col-12">
          <h6 className="fw-semibold text-primary mb-2">Datos del evento</h6>

          <div className="border rounded p-3 bg-light">
            <p className="mb-1"><strong>Nombre:</strong> {form.nombreEvento || "-"}</p>
            <p className="mb-1"><strong>Fecha:</strong> {form.fechaEvento || "-"}</p>
            <p className="mb-1"><strong>Ubicación:</strong> {form.localizacion || "-"}</p>
            <p className="mb-1"><strong>Descripción:</strong> {form.descripcion || "-"}</p>
            <p className="mb-0"><strong>Tags:</strong> {form.tags || "-"}</p>
          </div>
        </div>

        {/* BLOQUE 2 — PRECIOS + ESTADO + VISIBILIDAD */}
        <div className="col-12">
          <h6 className="fw-semibold text-primary mb-2">
            Configuración comercial + Estado
          </h6>

          <div className="border rounded p-3 bg-light">
            <p className="mb-1">
              <strong>Precio por foto:</strong>{" "}
              {form.precioFoto ? `$${form.precioFoto}` : "-"}
            </p>
            <p className="mb-1">
              <strong>Precio por álbum:</strong>{" "}
              {form.precioAlbum ? `$${form.precioAlbum}` : "-"}
            </p>
            <p className="mb-1">
              <strong>Estado:</strong> {form.estado}
            </p>
            <p className="mb-0">
              <strong>Visibilidad:</strong> {form.visibilidad}
            </p>
          </div>
        </div>

        {/* BLOQUE 3 — IMÁGENES */}
        <div className="col-12">
          <h6 className="fw-semibold text-primary mb-2">Imágenes seleccionadas</h6>

          <div className="border rounded p-3 bg-light">
            <p className="mb-3">
              <strong>Total:</strong> {imagenes.length} imágenes
            </p>

            {/* PREVIEW DE 6 MINIATURAS */}
            <div className="d-flex flex-wrap gap-3">
              {primeras6.map((file, index) => {
                const url = URL.createObjectURL(file);
                return (
                  <div
                    key={index}
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 8,
                      overflow: "hidden",
                      border: "1px solid #ccc",
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
                );
              })}
            </div>

            {imagenes.length > 6 && (
              <p className="text-muted small mt-2 mb-0">
                (Mostrando 6 de {imagenes.length} imágenes)
              </p>
            )}
          </div>
        </div>

      </div>

      {/* ERRORES SUBMIT */}
      {submitError && (
        <div className="alert alert-danger mt-3">{submitError}</div>
      )}

      {/* BOTONES FINALES */}
      <div className="d-flex justify-content-between mt-4">
        <button className="btn btn-secondary" onClick={back}>
          Volver
        </button>

        <button
          className="btn btn-success"
          onClick={onSubmit}
          disabled={submitting}
        >
          {submitting ? "Publicando..." : "Confirmar creación"}
        </button>
      </div>
    </div>
  );
}
