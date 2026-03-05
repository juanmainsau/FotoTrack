// src/pages/AdminConfigPage.jsx
import { useEffect, useState } from "react";
import { PageHeader } from "../components/PageHeader";

export function AdminConfigPage() {
  const [config, setConfig] = useState({
    // Config de Marca de Agua
    watermark_enabled: false,
    watermark_opacity: 80,
    watermark_position: "south_east",
    watermark_size: 0.3,
    calidad_default: 80,
    // 🏢 Nuevos datos de Vendedor
    vendedor_nombre: "",
    vendedor_cuit: "",
    vendedor_direccion: "",
    vendedor_telefono: "",
    vendedor_email: ""
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
            `https://res.cloudinary.com/deevgco8l/image/upload/${data.watermark_public_id}.png?t=${Date.now()}`
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
    const file = e.target.files;
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

  // 🎭 MÁSCARA DINÁMICA PARA EL CUIT DEL VENDEDOR
  const handleCuitChange = (e) => {
    let value = e.target.value.replace(/\D/g, ""); // Remueve letras y símbolos
    value = value.slice(0, 11); // Limita a 11 dígitos numéricos
    
    // Inyecta los guiones
    if (value.length > 2 && value.length <= 10) {
      value = `${value.slice(0, 2)}-${value.slice(2)}`;
    } else if (value.length > 10) {
      value = `${value.slice(0, 2)}-${value.slice(2, 10)}-${value.slice(10)}`;
    }
    
    setConfig(prev => ({
      ...prev,
      vendedor_cuit: value
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
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
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-3">Cargando...</div>;

  return (
    <>
      <PageHeader titulo="Configuración del Sistema" />

      <div className="container-fluid p-4">
        
        {/* ========================================= */}
        {/* SECCIÓN 1: MARCA DE AGUA */}
        {/* ========================================= */}
        <div className="row g-4 mb-4">
          <div className="col-12 col-lg-6">
            <div className="card shadow-sm h-100 border-0">
              <div className="card-header bg-white border-bottom fw-bold py-3">
                🎛️ Parámetros de Marca de Agua
              </div>
              <div className="card-body p-4">
                
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
                      name="watermark_enabled"
                      checked={!!config.watermark_enabled}
                      onChange={handleChange}
                    />
                  </div>
                </div>

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

                <div className="mb-4">
                  <label className="form-label d-flex justify-content-between fw-semibold">
                    <span>Opacidad</span>
                    <span className="text-primary">{config.watermark_opacity}%</span>
                  </label>
                  <input
                    type="range"
                    className="form-range"
                    name="watermark_opacity"
                    min="0" max="100" step="5"
                    value={config.watermark_opacity}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label d-flex justify-content-between fw-semibold">
                    <span>Tamaño Relativo</span>
                    <span className="text-primary">{(config.watermark_size * 100).toFixed(0)}%</span>
                  </label>
                  <input
                    type="range"
                    className="form-range"
                    name="watermark_size"
                    min="0.1" max="1.0" step="0.05"
                    value={config.watermark_size}
                    onChange={handleChange}
                  />
                  <div className="form-text mt-1">
                    Ajusta qué porcentaje del ancho de la foto ocupará el logo.
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">Posición en la foto</label>
                  <select
                    className="form-select"
                    name="watermark_position"
                    value={config.watermark_position}
                    onChange={handleChange}
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
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-6">
            <div className="card shadow-sm h-100 border-0">
              <div className="card-header bg-white border-bottom fw-bold d-flex justify-content-between align-items-center py-3">
                <span>👁️ Vista Previa en Vivo</span>
                <span className="badge bg-info text-dark">Simulación</span>
              </div>
              
              <div className="card-body p-0 d-flex align-items-center justify-content-center bg-dark" style={{ minHeight: "500px" }}>
                
                <div style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    minHeight: '500px',
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
                                opacity: config.watermark_opacity / 100,
                                transition: 'all 0.2s ease',
                                maxWidth: '400px', 
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
              <div className="card-footer text-muted small bg-light border-0">
                * La vista previa utiliza una imagen de ejemplo. El resultado final se adaptará a las dimensiones reales de tus fotografías.
              </div>
            </div>
          </div>
        </div>

        {/* ========================================= */}
        {/* SECCIÓN 2: DATOS DEL VENDEDOR */}
        {/* ========================================= */}
        <div className="row">
          <div className="col-12">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-dark text-white fw-bold py-3 border-0">
                🏢 Datos para Emisión de Comprobantes
              </div>
              <div className="card-body p-4 bg-light">
                <div className="alert alert-warning border-0 shadow-sm small">
                  Estos datos son <strong>obligatorios</strong> para cumplir con la emisión de recibos/comprobantes de las ventas generadas en la plataforma.
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold small text-muted text-uppercase">Razón Social / Negocio</label>
                    <input type="text" className="form-control" name="vendedor_nombre" placeholder="Ej: FotoTrack Studio" value={config.vendedor_nombre || ""} onChange={handleChange} />
                  </div>
                  
                  {/* 👇 INPUT NORMALIZADO CON MÁSCARA CUIT 👇 */}
                  <div className="col-md-6">
                    <label className="form-label fw-bold small text-muted text-uppercase">CUIT / Identificación Fiscal</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      name="vendedor_cuit" 
                      placeholder="Ej: 20-12345678-9" 
                      value={config.vendedor_cuit || ""} 
                      onChange={handleCuitChange} // Llama a la nueva función de máscara
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-bold small text-muted text-uppercase">Dirección Comercial</label>
                    <input type="text" className="form-control" name="vendedor_direccion" placeholder="Ej: San Martín 123, Misiones" value={config.vendedor_direccion || ""} onChange={handleChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold small text-muted text-uppercase">Teléfono de Contacto</label>
                    <input type="text" className="form-control" name="vendedor_telefono" placeholder="+54 9 376..." value={config.vendedor_telefono || ""} onChange={handleChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold small text-muted text-uppercase">Email de Contacto / Facturación</label>
                    <input type="email" className="form-control" name="vendedor_email" placeholder="contacto@tuweb.com" value={config.vendedor_email || ""} onChange={handleChange} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================= */}
        {/* BOTÓN DE GUARDADO GLOBAL */}
        {/* ========================================= */}
        <div className="d-flex justify-content-end mt-4">
          <button 
            className="btn btn-primary btn-lg px-5 fw-bold shadow-sm rounded-pill" 
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Guardando..." : "💾 Guardar Toda la Configuración"}
          </button>
        </div>

      </div>
    </>
  );
}

export default AdminConfigPage;