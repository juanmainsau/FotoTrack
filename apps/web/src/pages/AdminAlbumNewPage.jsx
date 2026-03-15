import { useState } from "react";
import { useNavigate } from "react-router-dom";

// 1. Importaciones corregidas con los nombres de archivo y componentes correctos
import { Step1DatosEvento } from "../components/CreateAlbumSteps/Step1DatosEvento";
import { Step2Imagenes } from "../components/CreateAlbumSteps/Step2Imagenes";
import { Step3ComercialEstado } from "../components/CreateAlbumSteps/Step3ComercialEstado";
import { Step4Resumen } from "../components/CreateAlbumSteps/Step4Resumen";

export function AdminAlbumNewPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    nombreEvento: "",
    fechaEvento: "",
    localizacion: "",
    descripcion: "",
    precioFoto: "",
    precioAlbum: "",
    estado: "Borrador",
    visibilidad: "Público",
    tags: "",
  });

  const [imagenes, setImagenes] = useState([]);

  // --- ESTADOS PARA SUBMIT FINAL ---
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [modalSuccess, setModalSuccess] = useState(null);

  function next() {
    setStep((prev) => prev + 1);
  }

  function back() {
    setStep((prev) => prev - 1);
  }

  // --- SUBMIT FINAL ---
  async function handleSubmitFinal() {
    setSubmitError(null);
    setSubmitting(true);

    try {
      const token = localStorage.getItem("fototrack-token");

      if (!form.nombreEvento || !form.fechaEvento || !form.localizacion) {
        setSubmitError("Faltan completar algunos datos obligatorios.");
        setSubmitting(false);
        return;
      }

      if (imagenes.length === 0) {
        setSubmitError("Debés seleccionar al menos una imagen para publicar el álbum.");
        setSubmitting(false);
        return;
      }

      const formData = new FormData();
      // Enviamos los datos del formulario como un string JSON
      formData.append("metadata", JSON.stringify(form));
      
      // Adjuntamos las imágenes
      imagenes.forEach((file) => {
        formData.append("images", file); 
      });

      const res = await fetch("http://localhost:4000/api/albums/complete", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errTxt = await res.text();
        console.error("Error en backend:", errTxt);
        throw new Error("Error al crear álbum.");
      }

      const data = await res.json(); 

      setModalSuccess({
        idAlbum: data.idAlbum,
        codigoInterno: data.codigoInterno,
      });

    } catch (err) {
      console.error(err);
      setSubmitError("Ocurrió un error al crear el álbum.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-4 p-md-5">
      {/* ENCABEZADO DEL WIZARD */}
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Crear nuevo álbum</h2>
        <p className="text-muted mb-0">Paso {step} de 4</p>
      </div>

      {/* FLUJO DE PASOS REORDENADO */}
      
      {/* PASO 1: DATOS BÁSICOS */}
      {step === 1 && (
        <Step1DatosEvento
          form={form}
          setForm={setForm}
          next={next}
        />
      )}

      {/* PASO 2: CARGA DE IMÁGENES (Ahora es el 2) */}
      {step === 2 && (
        <Step2Imagenes
          imagenes={imagenes}
          setImagenes={setImagenes}
          next={next}
          back={back}
        />
      )}

      {/* PASO 3: CONFIGURACIÓN COMERCIAL (Recibe 'imagenes' para calcular precio) */}
      {step === 3 && (
        <Step3ComercialEstado
          form={form}
          setForm={setForm}
          imagenes={imagenes}
          next={next}
          back={back}
        />
      )}

      {/* PASO 4: RESUMEN FINAL */}
      {step === 4 && (
        <Step4Resumen
          form={form}
          imagenes={imagenes}
          back={back}
          onSubmit={handleSubmitFinal}
          submitting={submitting}
          submitError={submitError}
        />
      )}

      {/* MODAL DE ÉXITO (Se mantiene igual) */}
      {modalSuccess && (
        <div
          className="modal fade show"
          style={{
            display: "block",
            background: "rgba(0,0,0,0.4)",
            zIndex: 1050
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">¡Álbum creado!</h5>
              </div>
              <div className="modal-body p-4">
                <p>El álbum <strong>{modalSuccess.codigoInterno}</strong> se creó exitosamente.</p>
                <p className="text-muted small">ID interno: {modalSuccess.idAlbum}</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => navigate("/admin/albums")}>
                  Volver al listado
                </button>
                <button className="btn btn-primary" onClick={() => navigate(`/admin/albums/${modalSuccess.idAlbum}`)}>
                  Ver álbum
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}