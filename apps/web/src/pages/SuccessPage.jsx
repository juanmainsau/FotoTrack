import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import confetti from "canvas-confetti"; 

export function SuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // 🔍 TRIPLE CHEQUEO: Buscamos el ID en todas las variantes posibles de Mercado Pago
  const paymentId = 
    searchParams.get("payment_id") || 
    searchParams.get("collection_id") || 
    searchParams.get("merchant_order_id");

  const status = searchParams.get("collection_status") || searchParams.get("status");

  useEffect(() => {
    // 📢 Log de depuración para ver qué llega exactamente en la URL (puedes quitarlo después)
    console.log("🔍 Query Params recibidos:", Object.fromEntries(searchParams));

    if (status) {
      // 👇 1. GRITAMOS POR LA RADIO (Guardamos en LocalStorage)
      localStorage.setItem("fototrack_mensaje_pago", JSON.stringify({
        status: status,
        paymentId: paymentId,
        tiempo: Date.now()
      }));
    }

    // 👇 2. Manejo de Popup vs Pestaña Principal
    if (window.name === "PagoMP" || window.opener) {
      // Si somos popup, esperamos un breve momento para asegurar el localStorage y cerramos
      const timer = setTimeout(() => {
        window.close();
      }, 600); 
      return () => clearTimeout(timer);
    } else {
      // 👇 3. Somos la pestaña principal, ¡A CELEBRAR!
      if (status === "approved" || status === "success") {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#28a745', '#ffffff'] 
        });
      }
    }
  }, [status, paymentId, searchParams]);

  return (
    <div className="container d-flex flex-column align-items-center justify-content-center py-5" style={{ minHeight: "70vh" }}>
      <div className="text-center animate__animated animate__fadeInUp">
        
        <div className="mb-4 position-relative d-inline-block">
          <div style={{ width: 100, height: 100, background: "#e8f5e9", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 50 }}>📩</span>
          </div>
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success">✓</span>
        </div>

        <h2 className="fw-bold text-dark mb-3">¡Gracias por elegirnos!</h2>
        
        <div className="card border-0 shadow-sm p-4 mx-auto bg-light" style={{ maxWidth: 500 }}>
          <p className="lead mb-0 text-secondary">
            La entrega de tu compra estará disponible en tu casilla de correo electrónico en los próximos minutos.
          </p>
        </div>

        {/* 🆔 ID de Transacción Real con triple validación */}
        <div className="mt-4">
          <p className="text-muted mb-1 small text-uppercase fw-bold" style={{ letterSpacing: "1px" }}>
            Comprobante de operación
          </p>
          <div className="badge bg-white text-dark border px-3 py-2 shadow-sm" style={{ fontSize: "0.9rem" }}>
            #{paymentId || "Procesando ID..."}
          </div>
        </div>

        <div className="mt-5 d-flex gap-3 justify-content-center">
          <button className="btn btn-outline-secondary px-4 shadow-sm" onClick={() => navigate("/app/mainscreen")}>
            Volver al Inicio
          </button>
          <button className="btn btn-primary px-4 shadow-sm" onClick={() => navigate("/app/mis-compras")}>
            Ir a Mis Compras
          </button>
        </div>
      </div>
    </div>
  );
}

export default SuccessPage;