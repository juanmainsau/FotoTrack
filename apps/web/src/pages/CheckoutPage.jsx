import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // 👈 Importamos navigate

export function CheckoutPage() {
  const [carrito, setCarrito] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
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
      alert("Error cargando carrito.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCart();
  }, []);

  // ----------------------------
  // 🪟 EL TRUCO FINAL: El Vigilante del Popup
  // ----------------------------
  async function handleMercadoPagoPayment() {
    if (!carrito || carrito.items.length === 0) {
      alert("El carrito está vacío.");
      return;
    }

    const confirmarPago = window.confirm(
      "🔒 Se abrirá la pasarela segura de Mercado Pago en una nueva ventana.\n\nPor favor, no cierres esta página hasta completar la compra."
    );

    if (!confirmarPago) return;

    setProcessing(true);

    try {
      const token = localStorage.getItem("fototrack-token");
      const itemsToPay = carrito.items.map((item) => ({
        id: item.idImagen, 
        title: `Foto (Álbum: ${item.nombreAlbum || 'Evento'})`, 
        price: item.precioUnitario,
        quantity: 1,
      }));

      const res = await fetch("http://localhost:4000/api/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ items: itemsToPay, idCarrito: carrito.idCarrito }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Error al generar la preferencia de pago");

      if (data.url) {
        // Abrimos la ventana centrada y elegante
        const width = 800;
        const height = 650;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        const popup = window.open(
          data.url, 
          "Pago Seguro", 
          `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes,status=no`
        ); 

        // 👇 LA MAGIA: Un reloj que revisa cada 1 segundo si la ventana sigue abierta
        const vigilante = setInterval(async () => {
          if (!popup || popup.closed) {
            clearInterval(vigilante); // Dejamos de vigilar
            
            // La ventana se cerró. ¿El usuario pagó o se arrepintió?
            // Le preguntamos a nuestra base de datos verificando si el carrito sigue lleno.
            try {
              const checkRes = await fetch("http://localhost:4000/api/carrito/mio", {
                headers: { Authorization: "Bearer " + token }
              });
              const cartData = await checkRes.json();

              // Si el carrito está vacío, significa que el Webhook hizo su magia = ¡Pagó!
              if (!cartData.carrito || cartData.carrito.items.length === 0) {
                navigate("/checkout/success?status=approved");
              } else {
                // Si el carrito sigue lleno = Cerró la ventana sin pagar
                alert("La ventana de pago se cerró antes de completar la transacción.");
                setProcessing(false);
              }
            } catch (error) {
              setProcessing(false);
            }
          }
        }, 1000);

      } else {
        alert("No se recibió el link de pago.");
        setProcessing(false);
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
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <h5 className="fw-semibold mb-3">Resumen del Pedido</h5>

              {carrito.items.map((item) => (
                <div key={item.idItem} className="d-flex align-items-center justify-content-between mb-3 pb-3 border-bottom">
                  <div className="d-flex align-items-center gap-3">
                    <img
                      src={item.miniatura}
                      alt="foto"
                      style={{ width: 70, height: 70, objectFit: "cover", borderRadius: 6, border: "1px solid #ddd" }}
                    />
                    <div>
                      <div className="fw-semibold">Foto #{item.idImagen}</div>
                      <small className="text-muted">{item.nombreAlbum}</small>
                    </div>
                  </div>
                  <strong className="fs-5">${item.precioUnitario}</strong>
                </div>
              ))}
              <div className="d-flex justify-content-end mt-3 align-items-center">
                <span className="text-muted me-3">Total a pagar:</span>
                <h3 className="fw-bold text-primary m-0">${carrito.total}</h3>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm mb-4 bg-light">
            <div className="card-body">
              <h5 className="fw-semibold mb-3">Medio de Pago</h5>
              <div className="d-flex align-items-center gap-2">
                <img src="https://img.icons8.com/color/48/mercadopago.png" alt="Logo MP" width="40" />
                <div>
                    <strong>Mercado Pago</strong>
                    <p className="mb-0 text-muted small">Pagos seguros en ventana flotante.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="d-grid gap-2 d-md-flex justify-content-md-end">
            <button
              className="btn btn-primary btn-lg px-5 shadow"
              onClick={handleMercadoPagoPayment}
              disabled={processing}
            >
              {processing ? (
                <><span className="spinner-border spinner-border-sm me-2"></span> Vigilanado pago seguro...</>
              ) : (
                "Pagar de forma segura"
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default CheckoutPage;