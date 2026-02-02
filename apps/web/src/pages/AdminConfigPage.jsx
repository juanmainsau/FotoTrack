// src/pages/AdminConfigPage.jsx
import { useEffect, useState } from "react";
import { PageHeader } from "../components/PageHeader";

export function AdminConfigPage() {
  const [config, setConfig] = useState({
    watermark_enabled: false,
    watermark_opacity: 80,
    watermark_position: "south_east",
    watermark_size: 0.3,
    calidad_default: 80
  });
  
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null); 

  // Imagen de fondo de muestra
  const SAMPLE_BG = "https://images.unsplash.com/photo-1544182383-0666af41dab4?q=80&w=1000&auto=format&fit=crop";

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch("http://localhost:4000/api/config", {
            headers: { "Authorization": `Bearer ${localStorage.getItem("fototrack-token")}` } 
        });
        const data = await res.json();
        
        setConfig({
            ...data,
            watermark_size: data.watermark_size || 0.3,
            watermark_opacity: data.watermark_opacity || 80,
            watermark_position: data.watermark_position || "south_east"
        });

        if (data.watermark_public_id) {
          setPreview(
            `https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUDNAME}/image/upload/${data.watermark_public_id}.png`
          );
        }
      } catch (err) {
        console.error("Error cargando config:", err);
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  const getPositionStyles = (pos) => {
    const map = {
        north_west: { justifyContent: "flex-start", alignItems: "flex-start" },
        north:      { justifyContent: "center",     alignItems: "flex-start" },
        north_east: { justifyContent: "flex-end",   alignItems: "flex-start" },
        west:       { justifyContent: "flex-start", alignItems: "center" },
        center:     { justifyContent: "center",     alignItems: "center" },
        east:       { justifyContent: "flex-end",   alignItems: "center" },
        south_west: { justifyContent: "flex-start", alignItems: "flex-end" },
        south:      { justifyContent: "center",     alignItems: "flex-end" },
        south_east: { justifyContent: "flex-end",   alignItems: "flex-end" },
    };
    return map[pos] || map.south_east;
  };

  const handleUploadWatermark = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file)); 

    const formData = new FormData();
    formData.append("watermark", file);

    try {
      const res = await fetch("http://localhost:4000/api/config/watermark", {
        method: "POST",
        headers: { "Authorization": `Bearer ${localStorage.getItem("fototrack-token")}` },
        body: formData,
      });
      const updated = await res.json();
      setConfig(prev => ({...prev, ...updated}));
      alert("Marca de agua actualizada correctamente.");
    } catch (err) {
      console.error(err);
      alert("Error subiendo watermark");
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/config", {
        method: "PUT",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("fototrack-token")}`
        },
        body: JSON.stringify(config),
      });
      const updated = await res.json();
      setConfig(updated);
      alert("Configuración guardada correctamente.");
    } catch (err) {
      console.error(err);
      alert("Error guardando configuración.");
    }
  };

  if (loading) return <div className="p-3">Cargando...</div>;

  return (
    <>
      <PageHeader titulo="Configuración de Marca de Agua" />

      <div className="container-fluid p-4">
        <div className="row g-4">
          
          {/* CAMBIO 1: GRIDS 50/50 
              Usamos 'col-lg-6' en ambos lados para dividir la pantalla a la mitad en escritorio.
          */}

          {/* === COLUMNA IZQUIERDA: CONTROLES === */}
          <div className="col-12 col-lg-6">
            <div className="card shadow-sm h-100 border-0">
              <div className="card-header bg-white border-bottom fw-bold py-3">
                🎛️ Parámetros de configuración
              </div>
              <div className="card-body p-4">
                
                {/* CAMBIO 2: SWITCH REDISEÑADO 
                    Ahora es una fila flex limpia, integrada correctamente dentro del padding.
                */}
                <div className="d-flex align-items-center justify-content-between mb-4 p-3 border rounded bg-light">
                  <label className="form-check-label fw-bold mb-0 text-dark" htmlFor="wmSwitch">
                    Habilitar Marca de Agua
                  </label>
                  <div className="form-check form-switch m-0">
                    <input
                      className="form-check-input"
                      style={{ width: "3em", height: "1.5em", cursor: "pointer" }}
                      type="checkbox"
                      id="wmSwitch"
                      checked={!!config.watermark_enabled}
                      onChange={(e) => setConfig({ ...config, watermark_enabled: e.target.checked ? 1 : 0 })}
                    />
                  </div>
                </div>

                {/* Upload */}
                <div className="mb-4">
                  <label className="form-label fw-semibold">Subir Logo (PNG Transparente)</label>
                  <input
                    type="file"
                    className="form-control"
                    accept=".png"
                    onChange={handleUploadWatermark}
                  />
                </div>

                <hr className="my-4 text-muted"/>

                {/* Opacidad */}
                <div className="mb-4">
                  <label className="form-label d-flex justify-content-between fw-semibold">
                    <span>Opacidad</span>
                    <span className="text-primary">{config.watermark_opacity}%</span>
                  </label>
                  <input
                    type="range"
                    className="form-range"
                    min="0" max="100" step="5"
                    value={config.watermark_opacity}
                    onChange={(e) => setConfig({ ...config, watermark_opacity: Number(e.target.value) })}
                  />
                </div>

                {/* Tamaño */}
                <div className="mb-4">
                  <label className="form-label d-flex justify-content-between fw-semibold">
                    <span>Tamaño Relativo</span>
                    <span className="text-primary">{(config.watermark_size * 100).toFixed(0)}%</span>
                  </label>
                  <input
                    type="range"
                    className="form-range"
                    min="0.1" max="1.0" step="0.05"
                    value={config.watermark_size}
                    onChange={(e) => setConfig({ ...config, watermark_size: Number(e.target.value) })}
                  />
                  <div className="form-text mt-1">
                    Ajusta qué porcentaje del ancho de la foto ocupará el logo.
                  </div>
                </div>

                {/* Posición */}
                <div className="mb-4">
                  <label className="form-label fw-semibold">Posición en la foto</label>
                  <select
                    className="form-select"
                    value={config.watermark_position}
                    onChange={(e) => setConfig({ ...config, watermark_position: e.target.value })}
                  >
                    <option value="north_west">↖️ Arriba Izquierda</option>
                    <option value="north">⬆️ Arriba Centro</option>
                    <option value="north_east">↗️ Arriba Derecha</option>
                    <option value="west">⬅️ Medio Izquierda</option>
                    <option value="center">⏺️ Centro</option>
                    <option value="east">➡️ Medio Derecha</option>
                    <option value="south_west">↙️ Abajo Izquierda</option>
                    <option value="south">⬇️ Abajo Centro</option>
                    <option value="south_east">↘️ Abajo Derecha</option>
                  </select>
                </div>

                <button className="btn btn-primary w-100 py-2 fw-bold mt-2" onClick={handleSave}>
                  💾 Guardar Cambios
                </button>
              </div>
            </div>
          </div>

          {/* === COLUMNA DERECHA: PREVIEW === */}
          <div className="col-12 col-lg-6">
            <div className="card shadow-sm h-100 border-0">
              <div className="card-header bg-white border-bottom fw-bold d-flex justify-content-between align-items-center py-3">
                <span>👁️ Vista Previa en Vivo</span>
                <span className="badge bg-info text-dark">Simulación</span>
              </div>
              
              {/* Contenedor oscuro centrado */}
              <div className="card-body p-0 d-flex align-items-center justify-content-center bg-dark" style={{ minHeight: "500px" }}>
                
                <div style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    minHeight: '500px', // Aseguramos altura mínima
                    backgroundImage: `url('${SAMPLE_BG}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    overflow: 'hidden',
                    ...getPositionStyles(config.watermark_position),
                    padding: '20px'
                }}>
                    
                    {preview ? (
                        <img 
                            src={preview} 
                            alt="Watermark Preview"
                            style={{
                                width: `${config.watermark_size * 100}%`,
                                opacity: config.watermark_enabled ? (config.watermark_opacity / 100) : 0,
                                transition: 'all 0.2s ease',
                                maxWidth: '400px', // Un poco más grande para pantallas grandes
                                filter: 'drop-shadow(0px 0px 4px rgba(0,0,0,0.6))'
                            }}
                        />
                    ) : (
                        <div className="text-white text-center w-100 bg-black bg-opacity-75 p-5 mx-5 rounded shadow">
                            <h5 className="mb-2">Sin vista previa</h5>
                            <p className="mb-0 small text-light">Sube una imagen .PNG a la izquierda para ver el resultado.</p>
                        </div>
                    )}

                </div>
              </div>
              <div className="card-footer text-muted small bg-light">
                * La vista previa utiliza una imagen de ejemplo. El resultado final se adaptará a las dimensiones reales de tus fotografías.
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default AdminConfigPage;