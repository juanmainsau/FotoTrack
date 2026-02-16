import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom"; // No necesitamos navegar internamente, saldremos a MP

export function CheckoutPage() {
  const [carrito, setCarrito] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

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
      alert("Error cargando carrito.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCart();
  }, []);

  // ----------------------------
  // 👇 CAMBIO CLAVE: Pagar con Mercado Pago
  // ----------------------------
  async function handleMercadoPagoPayment() {
    if (!carrito || carrito.items.length === 0) {
      alert("El carrito está vacío.");
      return;
    }

    setProcessing(true);

    try {
      const token = localStorage.getItem("fototrack-token");

      // 1. Preparamos los ítems del carrito para Mercado Pago
      // El backend espera: { id, title, price, quantity }
      const itemsToPay = carrito.items.map((item) => ({
        id: item.idImagen, 
        title: `Foto (Álbum: ${item.nombreAlbum || 'Evento'})`, 
        price: item.precioUnitario,
        quantity: 1,
      }));

      // 2. Llamamos al endpoint de PAGOS (Payment Controller)
      // OJO: Ya no llamamos a /api/compras, sino a /api/payment/create-order
      const res = await fetch("http://localhost:4000/api/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ items: itemsToPay }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al generar la preferencia de pago");
      }

      // 3. Redirección a Mercado Pago
      if (data.url) {
        window.location.href = data.url; 
      } else {
        alert("No se recibió el link de pago.");
      }

    } catch (err) {
      console.error(err);
      alert("Hubo un error al conectar con Mercado Pago.");
      setProcessing(false);
    }
  }

  // ----------------------------
  // Render
  // ----------------------------
  return (
    <div className="container py-4" style={{ maxWidth: 900 }}>
      <h2 className="fw-bold mb-4">💳 Finalizar Compra</h2>

      {loading && (
        <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2">Cargando tu carrito...</p>
        </div>
      )}

      {!loading && carrito?.items.length === 0 && (
        <div className="alert alert-info shadow-sm">
          Tu carrito está vacío. ¡Ve a buscar tus fotos!
        </div>
      )}

      {!loading && carrito?.items.length > 0 && (
        <>
          {/* LISTADO DE FOTOS */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <h5 className="fw-semibold mb-3">Resumen del Pedido</h5>

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
                  <strong className="fs-5">${item.precioUnitario}</strong>
                </div>
              ))}

              {/* TOTAL */}
              <div className="d-flex justify-content-end mt-3 align-items-center">
                <span className="text-muted me-3">Total a pagar:</span>
                <h3 className="fw-bold text-primary m-0">${carrito.total}</h3>
              </div>
            </div>
          </div>

          {/* MÉTODO DE PAGO */}
          <div className="card border-0 shadow-sm mb-4 bg-light">
            <div className="card-body">
              <h5 className="fw-semibold mb-3">Medio de Pago</h5>
              <div className="d-flex align-items-center gap-2">
                <img 
                    src="https://img.icons8.com/color/48/mercadopago.png" 
                    alt="Logo MP" 
                    width="40" 
                />
                <div>
                    <strong>Mercado Pago</strong>
                    <p className="mb-0 text-muted small">Tarjetas de crédito, débito y dinero en cuenta.</p>
                </div>
              </div>
            </div>
          </div>

          {/* BOTÓN DE ACCIÓN */}
          <div className="d-grid gap-2 d-md-flex justify-content-md-end">
            <button
              className="btn btn-primary btn-lg px-5 shadow"
              onClick={handleMercadoPagoPayment} // 👈 Llamamos a la nueva función
              disabled={processing}
            >
              {processing ? (
                <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Redirigiendo a Mercado Pago...
                </>
              ) : (
                "Pagar ahora"
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default CheckoutPage;