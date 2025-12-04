import { useCallback, useRef, useState } from "react";

export function Step3Imagenes({ imagenes, setImagenes, next, back }) {
  const [error, setError] = useState(null);
  const fileInputRef = useRef();

  // Selección manual
  function handleFileSelect(e) {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setImagenes((prev) => [...prev, ...files]);
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

  // ➕ Nuevo: eliminar todas
  function removeAllImages() {
    if (imagenes.length === 0) return;

    const seguro = window.confirm(
      "¿Seguro que querés eliminar todas las imágenes seleccionadas?"
    );

    if (seguro) {
      setImagenes([]);
      setError(null);
    }
  }

  // Validación antes de avanzar
  function handleNext() {
    if (imagenes.length === 0) {
      setError("Seleccioná al menos una imagen antes de continuar.");
      return;
    }
    next();
  }

  return (
    <div className="card border-0 shadow-sm p-4">
      <h4 className="fw-semibold mb-3">Carga de imágenes</h4>
      <p className="text-muted mb-4">
        Arrastrá tus fotos al recuadro o seleccioná desde tu computadora.
        Podrás ver una vista previa antes de publicar el álbum.
      </p>

      {/* ZONA DRAG & DROP */}
      <div
        className="border rounded-3 p-4 text-center mb-4"
        style={{
          borderStyle: "dashed",
          backgroundColor: "#fafafa",
          cursor: "pointer",
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current.click()}
      >
        <p className="mb-1 fw-semibold">Arrastrá tus imágenes aquí</p>
        <p className="text-muted small mb-3">o hacé clic para seleccionarlas</p>

        <button className="btn btn-outline-primary btn-sm" type="button">
          Seleccionar imágenes
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

      {/* ERRORES */}
      {error && <div className="alert alert-danger py-2">{error}</div>}

      {/* PREVISUALIZACIÓN + BOTÓN ELIMINAR TODAS */}
      {imagenes.length > 0 && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="fw-semibold mt-3 mb-0">
              Imágenes seleccionadas ({imagenes.length})
            </h6>

            {/* BOTÓN ELIMINAR TODAS */}
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={removeAllImages}
            >
              🗑️ Eliminar todas
            </button>
          </div>

          <div className="d-flex flex-wrap gap-3">
            {imagenes.map((file, index) => {
              const imgURL = URL.createObjectURL(file);
              return (
                <div
                  key={index}
                  style={{
                    position: "relative",
                    width: 120,
                    height: 120,
                    borderRadius: 8,
                    overflow: "hidden",
                    border: "1px solid #ddd",
                  }}
                >
                  {/* Botón eliminar */}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    style={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      background: "rgba(0,0,0,0.55)",
                      border: "none",
                      color: "white",
                      borderRadius: "50%",
                      width: 22,
                      height: 22,
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    ✕
                  </button>

                  {/* Miniatura */}
                  <img
                    src={imgURL}
                    alt=""
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
        </>
      )}

      {/* BOTONES DE NAVEGACIÓN */}
      <div className="d-flex justify-content-between mt-4">
        <button className="btn btn-secondary" onClick={back}>
          Volver
        </button>

        <button className="btn btn-primary" onClick={handleNext}>
          Siguiente
        </button>
      </div>
    </div>
  );
}
