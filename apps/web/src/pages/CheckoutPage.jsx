// apps/web/src/pages/CheckoutPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function CheckoutPage() {
  const [carrito, setCarrito] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod] = useState("simulado");
  const [showSuccess, setShowSuccess] = useState(false);

  const navigate = useNavigate();

  // ----------------------------
  // Cargar carrito
  // ----------------------------
  async function loadCart() {
    try {
      const token = localStorage.getItem("fototrack-token");

      const res = await fetch("http://localhost:4000/api/carrito/mio", {
        headers: { Authorization: "Bearer " + token },
      });

      const data = await res.json();

      if (!data.ok) throw new Error("Error cargando carrito");

      setCarrito(data.carrito);
    } catch (err) {
      console.error(err);
      alert("Error cargando carrito. Intentá recargar la página.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCart();
  }, []);

  // ----------------------------
  // Confirmar compra
  // ----------------------------
  async function handleConfirmPurchase() {
    if (!carrito || carrito.items.length === 0) {
      alert("El carrito está vacío.");
      return;
    }

    setProcessing(true);

    try {
      const token = localStorage.getItem("fototrack-token");

      const res = await fetch("http://localhost:4000/api/compras", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          idMetodoPago: 1, // pago simulado
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Error al procesar compra");
      }

      // Mostrar modal de éxito
      setShowSuccess(true);

      // Vaciar visualmente el carrito
      setCarrito({ items: [], total: 0 });

    } catch (err) {
      console.error(err);
      alert("No se pudo completar la compra.");
    } finally {
      setProcessing(false);
    }
  }

  // ----------------------------
  // Render
  // ----------------------------
  return (
    <div className="container py-4" style={{ maxWidth: 900 }}>
      <h2 className="fw-bold mb-4">💳 Confirmar compra</h2>

      {loading && <p>Cargando datos...</p>}

      {!loading && carrito?.items.length === 0 && (
        <div className="alert alert-info">
          Tu carrito está vacío. Agrega fotos para continuar.
        </div>
      )}

      {!loading && carrito?.items.length > 0 && (
        <>
          {/* LISTADO DE FOTOS */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">

              <h5 className="fw-semibold mb-3">Fotos seleccionadas</h5>

              {carrito.items.map((item) => (
                <div
                  key={item.idItem}
                  className="d-flex align-items-center justify-content-between mb-3 pb-3 border-bottom"
                >
                  <div className="d-flex align-items-center gap-3">
                    <img
                      src={item.miniatura}
                      alt="foto"
                      style={{
                        width: 70,
                        height: 70,
                        objectFit: "cover",
                        borderRadius: 6,
                        border: "1px solid #ddd",
                      }}
                    />
                    <div>
                      <div className="fw-semibold">Foto #{item.idImagen}</div>
                      <small className="text-muted">{item.nombreAlbum}</small>
                    </div>
                  </div>

                  <strong>${item.precioUnitario}</strong>
                </div>
              ))}

              {/* TOTAL */}
              <div className="d-flex justify-content-end mt-3">
                <h4 className="fw-bold">Total: ${carrito.total}</h4>
              </div>

            </div>
          </div>

          {/* MÉTODO DE PAGO */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <h5 className="fw-semibold mb-3">Método de pago</h5>

              <div className="form-check mb-2">
                <input
                  className="form-check-input"
                  type="radio"
                  checked
                  readOnly
                />
                <label className="form-check-label">
                  Pago simulado (rápido para pruebas)
                </label>
              </div>

              <p className="text-muted small">
                En la versión final podrás habilitar MercadoPago u otros medios.
              </p>
            </div>
          </div>

          {/* BOTÓN DE COMPRA */}
          <div className="d-flex justify-content-end">
            <button
              className="btn btn-success px-4"
              onClick={handleConfirmPurchase}
              disabled={processing}
            >
              {processing ? "Procesando compra..." : "Confirmar compra"}
            </button>
          </div>
        </>
      )}

      {/* =========================== */}
      {/* MODAL DE ÉXITO               */}
      {/* =========================== */}
      {showSuccess && (
        <div className="modal fade show"
          style={{
            display: "block",
            backgroundColor: "rgba(0,0,0,0.4)",
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">

              <div className="modal-header">
                <h5 className="modal-title">¡Compra realizada con éxito!</h5>
                <button className="btn-close" onClick={() => setShowSuccess(false)}></button>
              </div>

              <div className="modal-body">
                <p className="mb-2">
                  🎉 <strong>¡Gracias por tu compra!</strong>
                </p>

                <p className="text-muted">
                  Te enviamos un correo con el enlace de descarga de tus fotos en alta calidad.<br />
                  Revisá tu bandeja de entrada (o la carpeta de Spam).
                </p>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => navigate("/app/mainscreen")}
                >
                  Volver al inicio
                </button>

                <button
                  className="btn btn-primary"
                  onClick={() => navigate("/app/albums")}
                >
                  Explorar álbumes
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default CheckoutPage;
