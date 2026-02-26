import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import confetti from "canvas-confetti"; 

export function SuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const paymentId = searchParams.get("payment_id");
  const status = searchParams.get("collection_status") || searchParams.get("status");

  useEffect(() => {
    if (status) {
      // 👇 1. GRITAMOS POR LA RADIO (Guardamos en LocalStorage)
      localStorage.setItem("fototrack_mensaje_pago", JSON.stringify({
        status: status,
        paymentId: paymentId,
        tiempo: Date.now() // Para que siempre sea un mensaje nuevo
      }));
    }

    // 👇 2. ¿Somos el popup? Nos damos cuenta por el nombre que le pusimos ("PagoMP")
    if (window.name === "PagoMP" || window.opener) {
      window.close(); // Nos auto-destruimos 💣
    } else {
      // 👇 3. Somos la pestaña principal, ¡A CELEBRAR!
      if (status === "approved") {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#28a745', '#ffffff'] 
        });
      }
    }
  }, [status, paymentId]);

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

        <p className="text-muted mt-4 small">
          ID de Transacción: <strong>{paymentId || "Procesando..."}</strong>
        </p>

        <div className="mt-5 d-flex gap-3 justify-content-center">
          <button className="btn btn-outline-secondary px-4" onClick={() => navigate("/app/mainscreen")}>
            Volver al Inicio
          </button>
          <button className="btn btn-primary px-4" onClick={() => navigate("/app/mis-compras")}>
            Ir a Mis Compras
          </button>
        </div>
      </div>
    </div>
  );
}

export default SuccessPage;