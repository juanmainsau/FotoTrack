// src/pages/AdminConfigPage.jsx
import { useEffect, useState } from "react";
import { AdminLayout } from "../layouts/AdminLayout";
import { PageHeader } from "../components/PageHeader";

export function AdminConfigPage() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  // Vista previa del watermark
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch("http://localhost:4000/api/config");
        const data = await res.json();
        setConfig(data);

        // Vista previa del watermark actual
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

  if (loading)
    return (
      <AdminLayout>
        <p className="p-3">Cargando configuración…</p>
      </AdminLayout>
    );

  // ---------------------------
  // Subir PNG de marca de agua
  // ---------------------------
  const handleUploadWatermark = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Vista previa instantánea
    setPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("watermark", file);

    try {
      const res = await fetch("http://localhost:4000/api/config/watermark", {
        method: "POST",
        body: formData,
      });

      const updated = await res.json();
      setConfig(updated);
      alert("Marca de agua actualizada correctamente.");
    } catch (err) {
      console.error(err);
      alert("Error subiendo watermark");
    }
  };

  // ---------------------------
  // Guardar cambios
  // ---------------------------
  const handleSave = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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

  return (
    <AdminLayout>
      <PageHeader titulo="Configuración Global" />

      <div className="container py-3">
        {/* CARD PRINCIPAL */}
        <div className="card shadow-sm">
          <div className="card-body">

            {/* ACTIVAR/DESACTIVAR */}
            <div className="form-check form-switch mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                checked={!!config.watermark_enabled}
                onChange={(e) =>
                  setConfig({ ...config, watermark_enabled: e.target.checked ? 1 : 0 })
                }
              />
              <label className="form-check-label fw-semibold">
                Activar marca de agua
              </label>
            </div>

            {/* SUBIR PNG */}
            <div className="mb-4">
              <label className="form-label fw-semibold">
                Imagen PNG de marca de agua
              </label>
              <input
                type="file"
                className="form-control"
                accept=".png"
                onChange={handleUploadWatermark}
              />

              {preview && (
                <div className="mt-3 text-center">
                  <p className="text-muted small">Vista previa</p>
                  <img
                    src={preview}
                    alt="Watermark preview"
                    style={{ maxWidth: "200px", opacity: 0.8 }}
                  />
                </div>
              )}
            </div>

            {/* OPACIDAD */}
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Opacidad de la marca (0-100)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                className="form-range"
                value={config.watermark_opacity}
                onChange={(e) =>
                  setConfig({ ...config, watermark_opacity: Number(e.target.value) })
                }
              />
              <div>{config.watermark_opacity}%</div>
            </div>

            {/* TAMAÑO RELATIVO */}
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Tamaño relativo (0.1 a 1.0)
              </label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                className="form-range"
                value={config.watermark_size}
                onChange={(e) =>
                  setConfig({ ...config, watermark_size: parseFloat(e.target.value) })
                }
              />
              <div>{config.watermark_size}</div>
            </div>

            {/* POSICIÓN */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Posición</label>
              <select
                className="form-select"
                value={config.watermark_position}
                onChange={(e) =>
                  setConfig({ ...config, watermark_position: e.target.value })
                }
              >
                <option value="south_east">Abajo derecha</option>
                <option value="south_west">Abajo izquierda</option>
                <option value="north_east">Arriba derecha</option>
                <option value="north_west">Arriba izquierda</option>
                <option value="center">Centro</option>
              </select>
            </div>

            {/* CALIDAD DEFAULT */}
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Calidad predeterminada (0–100)
              </label>
              <input
                type="number"
                className="form-control"
                min="10"
                max="100"
                value={config.calidad_default}
                onChange={(e) =>
                  setConfig({ ...config, calidad_default: Number(e.target.value) })
                }
              />
            </div>

            <div className="text-end mt-4">
              <button className="btn btn-primary px-4" onClick={handleSave}>
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminConfigPage;
