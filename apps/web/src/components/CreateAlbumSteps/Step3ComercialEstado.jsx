// src/components/albums/Step3ComercialEstado.jsx
import { useEffect } from "react";

export function Step3ComercialEstado({ form, setForm, imagenes, next, back }) {
  
  useEffect(() => {
    const fetchDefaultPrice = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/config", {
          headers: { "Authorization": `Bearer ${localStorage.getItem("fototrack-token")}` }
        });
        const config = await res.json();
        
        // 🔍 LOG DE CONTROL: Verifica en la consola de F12 que el valor sea el que cambiaste
        console.log("💰 Configuración recibida de la API:", config);

        // Convertimos a número para evitar problemas de comparación con "500.00"
        const precioSugerido = parseFloat(config.precio_foto_default) || 500;
        const cantidadFotos = imagenes.length;

        setForm((prev) => {
          // BLINDAJE: Actualizamos si no hay precio, si es vacío, o si es el viejo default (500)
          // Usamos Number() para asegurar que la comparación sea numérica y no de texto
          const valorActual = parseFloat(prev.precioFoto);
          const debeActualizar = !prev.precioFoto || prev.precioFoto === "" || valorActual === 500;
          
          const nuevoPrecioFoto = debeActualizar ? precioSugerido : valorActual;

          return {
            ...prev,
            precioFoto: nuevoPrecioFoto,
            // El precio del álbum SIEMPRE se recalcula aquí según la cantidad real de fotos
            precioAlbum: nuevoPrecioFoto * cantidadFotos
          };
        });
      } catch (error) {
        console.error("❌ Error al obtener precio base:", error);
      }
    };

    fetchDefaultPrice();
  }, [imagenes.length]); // Solo se dispara si cambia la cantidad de fotos o al montar el componente

  // Manejador de cambios manuales
  function handleChange(e) {
    const { name, value } = e.target;
    
    setForm((prev) => {
      const updatedForm = { ...prev, [name]: value };
      
      // 🧮 Recalculo dinámico en tiempo real
      if (name === "precioFoto") {
        const valNum = parseFloat(value) || 0;
        updatedForm.precioAlbum = valNum * imagenes.length;
      }
      
      return updatedForm;
    });
  }

  return (
    <div className="card border-0 shadow-sm p-4">
      {/* Indicador de Paso */}
      <div className="d-flex align-items-center mb-3">
        <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: 32, height: 32, fontSize: '0.9rem'}}>3</div>
        <h4 className="fw-semibold mb-0">Configuración comercial + Estado</h4>
      </div>

      {/* 📊 Resumen visual de la carga previa */}
      <div className="alert alert-primary border-0 bg-light p-3 mb-4 d-flex align-items-center shadow-sm">
        <div className="fs-3 me-3">📊</div>
        <div>
          <span className="d-block small text-uppercase fw-bold text-muted">Contador de archivos</span>
          <span className="fw-bold text-dark">Se detectaron {imagenes.length} imágenes para este álbum.</span>
        </div>
      </div>

      <div className="row g-4">
        {/* Sección: CONFIGURACIÓN COMERCIAL */}
        <div className="col-12">
          <h6 className="fw-semibold mb-3 text-primary text-uppercase small" style={{letterSpacing: '1px'}}>
            Configuración de Precios
          </h6>
          <div className="row g-3">
            {/* Precio por foto */}
            <div className="col-12 col-md-6">
              <label className="form-label fw-bold small text-secondary">Precio por foto ($)</label>
              <div className="input-group input-group-lg">
                <span className="input-group-text bg-white border-end-0 text-muted">$</span>
                <input
                  type="number"
                  name="precioFoto"
                  className="form-control border-start-0 ps-0"
                  value={form.precioFoto}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>
              <div className="form-text mt-2 text-muted small">Valor recuperado automáticamente de la configuración global.</div>
            </div>

            {/* Precio por álbum */}
            <div className="col-12 col-md-6">
              <label className="form-label fw-bold small text-secondary">Precio total sugerido ($)</label>
              <div className="input-group input-group-lg">
                <span className="input-group-text bg-light border-end-0 text-muted">$</span>
                <input
                  type="number"
                  name="precioAlbum"
                  className="form-control bg-light border-start-0 ps-0 fw-bold text-primary"
                  value={form.precioAlbum}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>
              <div className="form-text mt-2 text-primary fw-medium small">
                Calculado: {imagenes.length} fotos x ${form.precioFoto || 0}
              </div>
            </div>
          </div>
        </div>

        <div className="col-12">
          <hr className="opacity-10" />
        </div>

        {/* Sección: ESTADO Y VISIBILIDAD */}
        <div className="col-12">
          <h6 className="fw-semibold mb-3 text-primary text-uppercase small" style={{letterSpacing: '1px'}}>
            Estado
          </h6>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-bold small text-secondary">Estado actual</label>
              <select 
                name="estado" 
                className="form-select form-select-lg" 
                value={form.estado} 
                onChange={handleChange}
              >
                <option value="Borrador">Borrador (Oculto para clientes)</option>
                <option value="Publicado">Publicado (Visible y a la venta)</option>
                <option value="Archivado">Archivado</option>
              </select>
            </div>
            <div className="col-md-6">
              {/*<label className="form-label fw-bold small text-secondary">Visibilidad en Galería</label>
              <select 
                name="visibilidad" 
                className="form-select form-select-lg" 
                value={form.visibilidad} 
                onChange={handleChange}
              >
                <option value="Público">Público (Aparece en la web principal)</option>
                <option value="Oculto">Oculto (Solo accesible con el enlace)</option>
              </select>*/}
            </div>
          </div>
        </div>
      </div>

      {/* Navegación del Wizard */}
      <div className="d-flex justify-content-between mt-5 pt-3 border-top">
        <button className="btn btn-outline-secondary px-4 fw-bold" type="button" onClick={back}>
          ← Volver a las fotos
        </button>
        <button className="btn btn-primary px-5 fw-bold shadow-sm" type="button" onClick={next}>
          Revisar y finalizar →
        </button>
      </div>
    </div>
  );
}