export function Step2ComercialEstado({ form, setForm, next, back }) {
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <div className="card border-0 shadow-sm p-4">
      <h4 className="fw-semibold mb-3">Configuración comercial + Estado</h4>

      <div className="row g-4">

        {/* Sección: CONFIGURACIÓN COMERCIAL */}
        <div className="col-12">
          <h6 className="fw-semibold mb-3 text-primary">
            Configuración comercial
          </h6>

          <div className="row g-3">
            {/* Precio por foto */}
            <div className="col-12 col-md-6">
              <label className="form-label">Precio por foto</label>
              <input
                type="number"
                name="precioFoto"
                className="form-control"
                placeholder="Ej: 1000"
                value={form.precioFoto}
                onChange={handleChange}
              />
              <div className="form-text">
                Podés modificar el precio sugerido del sistema.
              </div>
            </div>

            {/* Precio por álbum */}
            <div className="col-12 col-md-6">
              <label className="form-label">Precio del álbum completo</label>
              <input
                type="number"
                name="precioAlbum"
                className="form-control"
                placeholder="Ej: 8000"
                value={form.precioAlbum}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Separador visual */}
        <div className="col-12">
          <hr className="mt-2 mb-2" />
        </div>

        {/* Sección: ESTADO Y VISIBILIDAD */}
        <div className="col-12">
          <h6 className="fw-semibold mb-3 text-primary">
            Estado y visibilidad
          </h6>

          {/* Estado */}
          <div className="mb-3">
            <label className="form-label">Estado del álbum</label>
            <select
              name="estado"
              className="form-select"
              value={form.estado}
              onChange={handleChange}
            >
              <option value="Borrador">Borrador (Recomendado mientras cargas fotos)</option>
              <option value="Publicado">Publicado</option>
              <option value="Archivado">Archivado</option>
            </select>
          </div>

          {/* Visibilidad */}
          <div>
            <label className="form-label">Visibilidad</label>
            <select
              name="visibilidad"
              className="form-select"
              value={form.visibilidad}
              onChange={handleChange}
            >
              <option value="Público">Público</option>
              <option value="Oculto">Oculto</option>
            </select>
          </div>
        </div>
      </div>

      {/* BOTONES */}
      <div className="d-flex justify-content-between mt-4">
        <button className="btn btn-secondary" type="button" onClick={back}>
          Volver
        </button>

        <button className="btn btn-primary" type="button" onClick={next}>
          Siguiente
        </button>
      </div>
    </div>
  );
}
