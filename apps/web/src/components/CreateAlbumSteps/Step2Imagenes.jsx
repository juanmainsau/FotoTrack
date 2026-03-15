// src/components/albums/Step2Imagenes.jsx
import { useCallback, useRef, useState } from "react";

export function Step2Imagenes({ imagenes, setImagenes, next, back }) {
  const [error, setError] = useState(null);
  const fileInputRef = useRef();

  // Selección manual
  function handleFileSelect(e) {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const validFiles = files.filter((f) => f.type.startsWith("image/"));
      setImagenes((prev) => [...prev, ...validFiles]);
      setError(null);
    }
  }

  // Drag & Drop
  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files || []);

      if (files.length > 0) {
        const validFiles = files.filter((f) => f.type.startsWith("image/"));

        if (validFiles.length === 0) {
          setError("Solo se pueden subir archivos de imagen.");
          return;
        }

        setImagenes((prev) => [...prev, ...validFiles]);
        setError(null);
      }
    },
    [setImagenes]
  );

  function handleDragOver(e) {
    e.preventDefault();
  }

  // Quitar imagen individual
  function removeImage(index) {
    setImagenes((prev) => prev.filter((_, i) => i !== index));
  }

  // Eliminar todas
  function removeAllImages() {
    if (imagenes.length === 0) return;
    const seguro = window.confirm("¿Seguro que querés eliminar todas las imágenes seleccionadas?");
    if (seguro) {
      setImagenes([]);
      setError(null);
    }
  }

  // Validación antes de avanzar al Step 3 (Configuración Comercial)
  function handleNext() {
    if (imagenes.length === 0) {
      setError("Seleccioná al menos una imagen para poder calcular el costo del álbum.");
      return;
    }
    // Al llamar a next(), el Step 3 recibirá la cantidad de imágenes mediante el prop 'imagenes'
    next();
  }

  return (
    <div className="card border-0 shadow-sm p-4">
      <div className="d-flex align-items-center mb-3">
        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: 32, height: 32}}>2</div>
        <h4 className="fw-semibold mb-0">Carga de imágenes</h4>
      </div>
      
      <p className="text-muted mb-4">
        Subí las fotos del evento. En el siguiente paso el sistema calculará el precio total 
        basado en la cantidad de archivos que selecciones aquí.
      </p>

      {/* ZONA DRAG & DROP */}
      <div
        className="border rounded-3 p-5 text-center mb-4"
        style={{
          borderStyle: "dashed",
          backgroundColor: "#fafafa",
          cursor: "pointer",
          transition: "background 0.3s"
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current.click()}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f0f0f0"}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#fafafa"}
      >
        <div className="fs-1 mb-2">📸</div>
        <p className="mb-1 fw-semibold">Arrastrá tus imágenes aquí</p>
        <p className="text-muted small mb-3">o hacé clic para explorar</p>

        <button className="btn btn-primary btn-sm px-4" type="button">
          Seleccionar archivos
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="d-none"
          onChange={handleFileSelect}
        />
      </div>

      {error && <div className="alert alert-danger py-2">{error}</div>}

      {/* PREVISUALIZACIÓN */}
      {imagenes.length > 0 && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="fw-bold mb-0 text-primary">
              Fotos preparadas: {imagenes.length}
            </h6>
            <button
              className="btn btn-link text-danger btn-sm text-decoration-none"
              onClick={removeAllImages}
            >
              🗑️ Limpiar selección
            </button>
          </div>

          <div className="d-flex flex-wrap gap-2" style={{maxHeight: '300px', overflowY: 'auto', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '8px'}}>
            {imagenes.map((file, index) => {
              const imgURL = URL.createObjectURL(file);
              return (
                <div
                  key={index}
                  style={{
                    position: "relative",
                    width: 80,
                    height: 80,
                    borderRadius: 6,
                    overflow: "hidden",
                    border: "1px solid #ddd",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    style={{
                      position: "absolute",
                      top: 2,
                      right: 2,
                      background: "rgba(255,0,0,0.7)",
                      border: "none",
                      color: "white",
                      borderRadius: "50%",
                      width: 18,
                      height: 18,
                      fontSize: 10,
                      zIndex: 10
                    }}
                  >
                    ✕
                  </button>
                  <img
                    src={imgURL}
                    alt=""
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
              );
            })}
          </div>
        </>
      )}

      <div className="d-flex justify-content-between mt-5 pt-3 border-top">
        <button className="btn btn-outline-secondary px-4" onClick={back}>
          Volver
        </button>

        <button className="btn btn-primary px-5 fw-bold" onClick={handleNext}>
          Continuar al paso comercial
        </button>
      </div>
    </div>
  );
}