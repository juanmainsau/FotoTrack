import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Step1DatosEvento } from "../components/CreateAlbumSteps/Step1DatosEvento";
import { Step2ComercialEstado } from "../components/CreateAlbumSteps/Step2ComercialEstado";
import { Step3Imagenes } from "../components/CreateAlbumSteps/Step3Imagenes";
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

      // Validaciones mínimas
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

      // Construir FormData
      const formData = new FormData();
      
      // Si tu backend espera los datos del álbum como un JSON string en "metadata":
      formData.append("metadata", JSON.stringify(form));
      
      // O si tu backend espera los campos sueltos (ajusta según tu controlador createAlbum):
      // Object.keys(form).forEach(key => formData.append(key, form[key]));

      // 👇 CORRECCIÓN AQUÍ: Usamos "images" (en inglés) para coincidir con el backend
      imagenes.forEach((file) => {
        formData.append("images", file); 
      });

      // Enviar al backend
      // Asegúrate de que esta ruta '/api/albums/complete' use el middleware uploadMultipleImages
      const res = await fetch("http://localhost:4000/api/albums/complete", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // No poner 'Content-Type': 'multipart/form-data', el navegador lo pone solo
        },
        body: formData,
      });

      if (!res.ok) {
        const errTxt = await res.text();
        console.error("Error en backend:", errTxt);
        throw new Error("Error al crear álbum.");
      }

      const data = await res.json(); 
      // { success: true, idAlbum, codigoInterno }

      // Abrir modal de éxito
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

      {/* PASOS */}
      {step === 1 && (
        <Step1DatosEvento
          form={form}
          setForm={setForm}
          next={next}
        />
      )}

      {step === 2 && (
        <Step2ComercialEstado
          form={form}
          setForm={setForm}
          next={next}
          back={back}
        />
      )}

      {step === 3 && (
        <Step3Imagenes
          imagenes={imagenes}
          setImagenes={setImagenes}
          next={next}
          back={back}
        />
      )}

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

      {/* MODAL DE ÉXITO */}
      {modalSuccess && (
        <div
          className="modal fade show"
          style={{
            display: "block",
            background: "rgba(0,0,0,0.4)",
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              
              <div className="modal-header">
                <h5 className="modal-title">Álbum creado correctamente</h5>
              </div>

              <div className="modal-body">
                <p className="mb-2">
                  El álbum <strong>{modalSuccess.codigoInterno}</strong> se creó exitosamente.
                </p>

                <p className="text-muted small mb-0">
                  ID interno: {modalSuccess.idAlbum}
                </p>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => navigate("/admin/albums")}
                >
                  Volver al listado
                </button>

                <button
                  className="btn btn-primary"
                  onClick={() => navigate(`/admin/albums/${modalSuccess.idAlbum}`)}
                >
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