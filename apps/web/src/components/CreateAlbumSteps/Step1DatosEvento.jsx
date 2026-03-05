import { useState, useEffect } from "react";

export function Step1DatosEvento({ form, setForm, next }) {
  const [sugerencias, setSugerencias] = useState([]);
  const [busqueda, setBusqueda] = useState(form.localizacion || "");

  // 1. Cargar sugerencias cuando el usuario escribe (API GeoRef)
  const buscarCiudad = (e) => {
    const valor = e.target.value;
    setBusqueda(valor);

    if (valor.length > 2) {
      fetch(`https://apis.datos.gob.ar/georef/api/municipios?nombre=${valor}&max=10`)
        .then(res => res.json())
        .then(data => {
          if (data.municipios) setSugerencias(data.municipios);
        });
    } else {
      setSugerencias([]);
    }
  };

  const seleccionarCiudad = (muni) => {
    const localizacionFinal = `${muni.nombre}, ${muni.provincia.nombre}`;
    setForm({ ...form, localizacion: localizacionFinal });
    setBusqueda(muni.nombre);
    setSugerencias([]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  return (
    <div className="card border-0 shadow-sm p-4">
      <h4 className="fw-semibold mb-4 text-primary">Datos del evento</h4>
      
      <div className="row g-3">
        {/* Nombre del evento */}
        <div className="col-12">
          <label className="form-label fw-bold">Nombre del evento / álbum</label>
          <input
            type="text"
            name="nombreEvento"
            className="form-control bg-light border-0"
            placeholder="Ej: Rally MTB Posadas"
            value={form.nombreEvento}
            onChange={handleChange}
          />
        </div>

        {/* Descripción */}
        <div className="col-12">
          <label className="form-label fw-bold">Descripción</label>
          <textarea
            name="descripcion"
            className="form-control bg-light border-0"
            rows="3"
            placeholder="Información adicional (categorías, circuito, etc.)"
            value={form.descripcion}
            onChange={handleChange}
          />
        </div>

        {/* Tags */}
        <div className="col-12">
          <label className="form-label fw-bold">Tags (opcional)</label>
          <input
            type="text"
            name="tags"
            className="form-control bg-light border-0"
            placeholder="Ej: XCO, nocturna, rally..."
            value={form.tags}
            onChange={handleChange}
          />
          <div className="form-text">Separados por comas. Ayudan a la búsqueda del álbum.</div>
        </div>

        <hr className="my-3 opacity-25" />

        {/* Fecha */}
        <div className="col-12 col-md-4">
          <label className="form-label fw-bold">Fecha</label>
          <input 
            type="date" 
            name="fechaEvento"
            className="form-control bg-light border-0" 
            value={form.fechaEvento} 
            onChange={handleChange} 
          />
        </div>

        {/* Ubicación con API */}
        <div className="col-12 col-md-8">
          <label className="form-label fw-bold">Buscar Ciudad (Argentina)</label>
          <div className="position-relative">
            <input 
              type="text" 
              className="form-control bg-light border-0" 
              placeholder="Escribí el nombre de la ciudad..." 
              value={busqueda}
              onChange={buscarCiudad}
            />
            
            {sugerencias.length > 0 && (
              <ul className="list-group position-absolute w-100 shadow-sm z-3 mt-1">
                {sugerencias.map(m => (
                  <button 
                    key={m.id} 
                    type="button"
                    className="list-group-item list-group-item-action text-start"
                    onClick={() => seleccionarCiudad(m)}
                  >
                    <strong>{m.nombre}</strong>, <span className="text-muted">{m.provincia.nombre}</span>
                  </button>
                ))}
              </ul>
            )}
          </div>
          <small className="text-primary fw-bold mt-1 d-block">
            Ubicación: {form.localizacion || "No seleccionada"}
          </small>
        </div>
      </div>

      <div className="d-flex justify-content-end mt-5 pt-3 border-top">
        <button 
          className="btn btn-primary px-5 rounded-pill fw-bold" 
          onClick={next} 
          disabled={!form.localizacion || !form.nombreEvento}
        >
          Siguiente ➔
        </button>
      </div>
    </div>
  );
}