export function Step1DatosEvento({ form, setForm, next }) {
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <div className="card border-0 shadow-sm p-4">
      <h4 className="fw-semibold mb-3">Datos del evento</h4>
      <p className="text-muted mb-4">
        Completá la información principal del evento. Podrás revisar todo antes
        de publicar.
      </p>

      <div className="row g-3">
        {/* Nombre del evento */}
        <div className="col-12">
          <label className="form-label">Nombre del evento / álbum</label>
          <input
            type="text"
            name="nombreEvento"
            className="form-control"
            placeholder="Ej: Rally MTB Posadas"
            value={form.nombreEvento}
            onChange={handleChange}
          />
        </div>

        {/* Fecha + Ubicación */}
        <div className="col-12 col-md-6">
          <label className="form-label">Fecha del evento</label>
          <input
            type="date"
            name="fechaEvento"
            className="form-control"
            value={form.fechaEvento}
            onChange={handleChange}
          />
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label">Ubicación</label>
          <input
            type="text"
            name="localizacion"
            className="form-control"
            placeholder="Ciudad, provincia"
            value={form.localizacion}
            onChange={handleChange}
          />
        </div>

        {/* Descripción */}
        <div className="col-12">
          <label className="form-label">Descripción</label>
          <textarea
            name="descripcion"
            className="form-control"
            rows="3"
            placeholder="Información adicional sobre el evento (categorías, circuito, etc.)"
            value={form.descripcion}
            onChange={handleChange}
          />
        </div>

        {/* Tags */}
        <div className="col-12">
          <label className="form-label">Tags (opcional)</label>
          <input
            type="text"
            name="tags"
            className="form-control"
            placeholder="Ej: XCO, nocturna, rally..."
            value={form.tags}
            onChange={handleChange}
          />
          <div className="form-text">
            Usá palabras clave separadas por comas para ayudar a buscar este álbum en el futuro.
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-end mt-4">
        <button className="btn btn-primary" type="button" onClick={next}>
          Siguiente
        </button>
      </div>
    </div>
  );
}
