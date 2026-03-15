// src/pages/AdminConfigPage.jsx
import { useEffect, useState } from "react";
import { PageHeader } from "../components/PageHeader";

export function AdminConfigPage() {
  const [config, setConfig] = useState({
    watermark_enabled: false,
    watermark_opacity: 80,
    watermark_position: "south_east",
    watermark_size: 0.3,
    calidad_default: 80,
    vendedor_nombre: "",
    vendedor_cuit: "",
    vendedor_direccion: "",
    vendedor_telefono: "",
    vendedor_email: "",
    precio_foto_default: 0, // 👈 Aseguramos que empiece en 0
    precio_album_default: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(null); 

  const SAMPLE_BG = "https://images.unsplash.com/photo-1544182383-0666af41dab4?q=80&w=1000&auto=format&fit=crop";

  // 1. CARGA DE DATOS: Usamos una lógica de mezcla (merge) más segura
  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch("http://localhost:4000/api/config", {
            headers: { "Authorization": `Bearer ${localStorage.getItem("fototrack-token")}` } 
        });
        const data = await res.json();
        
        console.log("🛠️ Config cargada de la API:", data);

        setConfig(prev => ({
            ...prev,
            ...data, // Aquí entran los 750 de la DB
            // Validamos tipos numéricos por si la DB devuelve strings
            precio_foto_default: parseFloat(data.precio_foto_default) || 0
        }));

        if (data.watermark_public_id) {
          setPreview(`https://res.cloudinary.com/deevgco8l/image/upload/${data.watermark_public_id}.png?t=${Date.now()}`);
        }
      } catch (err) {
        console.error("Error cargando config:", err);
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  // 2. ACTUALIZACIÓN DE ESTADO: Manejo de inputs numéricos
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
    }));
  };

  const handleCuitChange = (e) => {
    let value = e.target.value.replace(/\D/g, "").slice(0, 11);
    if (value.length > 2 && value.length <= 10) value = `${value.slice(0, 2)}-${value.slice(2)}`;
    else if (value.length > 10) value = `${value.slice(0, 2)}-${value.slice(2, 10)}-${value.slice(10)}`;
    setConfig(prev => ({ ...prev, vendedor_cuit: value }));
  };

  // 3. GUARDADO: Forzamos el envío de los campos numéricos correctamente
  const handleSave = async () => {
    setSaving(true);
    try {
      // Limpiamos el objeto antes de enviar para asegurar que precio_foto_default sea número
      const payload = {
        ...config,
        precio_foto_default: parseFloat(config.precio_foto_default) || 0,
        watermark_opacity: parseInt(config.watermark_opacity) || 80,
        watermark_size: parseFloat(config.watermark_size) || 0.3
      };

      console.log("📤 Enviando a la API:", payload);

      const res = await fetch("http://localhost:4000/api/config", {
        method: "PUT",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("fototrack-token")}`
        },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) throw new Error("Error en el servidor");

      const result = await res.json();
      
      // IMPORTANTE: En vez de setConfig(result), hacemos merge para no perder campos
      setConfig(prev => ({ ...prev, ...payload }));
      alert("✅ Configuración guardada y sincronizada.");
      
    } catch (err) {
      console.error(err);
      alert("❌ Error al guardar.");
    } finally {
      setSaving(false);
    }
  };

  // Estilos de posición para la preview (se mantienen igual)
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
      if (updated.watermark_public_id) {
        setPreview(`https://res.cloudinary.com/deevgco8l/image/upload/${updated.watermark_public_id}.png?t=${Date.now()}`);
      }
    } catch (err) { alert("Error subiendo logo"); }
  };

  if (loading) return <div className="p-5 text-center"><div className="spinner-border text-primary"></div></div>;

  return (
    <>
      <PageHeader titulo="Configuración del Sistema" />
      <div className="container-fluid p-4">
        
        {/* SECCIÓN 1: MARCA DE AGUA */}
        <div className="row g-4 mb-4">
          <div className="col-12 col-lg-6">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-header bg-white fw-bold py-3">🎛️ Parámetros de Marca de Agua</div>
              <div className="card-body p-4">
                <div className="d-flex align-items-center justify-content-between mb-4 p-3 border rounded bg-light">
                  <label className="form-check-label fw-bold mb-0">Habilitar Marca de Agua</label>
                  <div className="form-check form-switch m-0">
                    <input className="form-check-input" type="checkbox" name="watermark_enabled" checked={!!config.watermark_enabled} onChange={handleChange} style={{ width: "3em", height: "1.5em" }} />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="form-label fw-semibold">Subir Logo (PNG)</label>
                  <input type="file" className="form-control" accept=".png" onChange={handleUploadWatermark} />
                </div>
                <div className="mb-4">
                  <label className="form-label d-flex justify-content-between fw-semibold">
                    <span>Opacidad</span>
                    <span className="text-primary">{config.watermark_opacity}%</span>
                  </label>
                  <input type="range" className="form-range" name="watermark_opacity" min="0" max="100" step="5" value={config.watermark_opacity} onChange={handleChange} />
                </div>
                <div className="mb-4">
                  <label className="form-label d-flex justify-content-between fw-semibold">
                    <span>Tamaño</span>
                    <span className="text-primary">{(config.watermark_size * 100).toFixed(0)}%</span>
                  </label>
                  <input type="range" className="form-range" name="watermark_size" min="0.1" max="1.0" step="0.05" value={config.watermark_size} onChange={handleChange} />
                </div>
                <div className="mb-4">
                  <label className="form-label fw-semibold">Posición</label>
                  <select className="form-select" name="watermark_position" value={config.watermark_position} onChange={handleChange}>
                    <option value="center">Centro</option>
                    <option value="south_east">Abajo Derecha</option>
                    <option value="south_west">Abajo Izquierda</option>
                    <option value="north_east">Arriba Derecha</option>
                    <option value="north_west">Arriba Izquierda</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* PREVIEW */}
          <div className="col-12 col-lg-6">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-header bg-white fw-bold py-3">👁️ Vista Previa</div>
              <div className="card-body p-0 bg-dark d-flex align-items-center justify-content-center" style={{ minHeight: "450px" }}>
                <div style={{
                    width: '100%', height: '450px',
                    backgroundImage: `url('${SAMPLE_BG}')`,
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    display: 'flex', ...getPositionStyles(config.watermark_position),
                    padding: '20px'
                }}>
                    {preview && (
                        <img src={preview} alt="Watermark" style={{ width: `${config.watermark_size * 100}%`, opacity: config.watermark_opacity / 100, maxWidth: '300px' }} />
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: DATOS FISCALES */}
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-header bg-dark text-white fw-bold py-3">🏢 Datos Fiscales</div>
          <div className="card-body p-4 bg-light">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-bold small text-muted">RAZÓN SOCIAL</label>
                <input type="text" className="form-control" name="vendedor_nombre" value={config.vendedor_nombre || ""} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold small text-muted">CUIT</label>
                <input type="text" className="form-control" name="vendedor_cuit" value={config.vendedor_cuit || ""} onChange={handleCuitChange} />
              </div>
              <div className="col-12">
                <label className="form-label fw-bold small text-muted">DIRECCIÓN</label>
                <input type="text" className="form-control" name="vendedor_direccion" value={config.vendedor_direccion || ""} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold small text-muted">TELÉFONO</label>
                <input type="text" className="form-control" name="vendedor_telefono" value={config.vendedor_telefono || ""} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold small text-muted">EMAIL FACTURACIÓN</label>
                <input type="email" className="form-control" name="vendedor_email" value={config.vendedor_email || ""} onChange={handleChange} />
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN 3: PRECIOS BASE (LA CLAVE) */}
        <div className="card shadow-sm border-0 mt-4 border-start border-success border-4">
          <div className="card-header bg-white fw-bold py-3 text-success">💰 Configuración de Precios por Defecto</div>
          <div className="card-body p-4">
            <div className="row align-items-center">
              <div className="col-md-6">
                <label className="form-label fw-bold small text-muted">PRECIO BASE POR FOTO ($)</label>
                <div className="input-group input-group-lg">
                  <span className="input-group-text bg-success text-white border-0">$</span>
                  <input 
                    type="number" 
                    className="form-control border-success" 
                    name="precio_foto_default" 
                    value={config.precio_foto_default || ""} 
                    onChange={handleChange} 
                  />
                </div>
                <div className="form-text mt-2">Este valor se sugerirá automáticamente al crear álbumes nuevos.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-end mt-5 mb-5">
          <button className="btn btn-primary btn-lg px-5 fw-bold shadow rounded-pill" onClick={handleSave} disabled={saving}>
            {saving ? "Guardando..." : "💾 Guardar Toda la Configuración"}
          </button>
        </div>
      </div>
    </>
  );
}

export default AdminConfigPage;