// apps/web/src/pages/CartPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function CartPage() {
  const [carrito, setCarrito] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ----------------------------
  // Cargar carrito del usuario
  // ----------------------------
  async function loadCart() {
    setLoading(true);

    try {
      const token = localStorage.getItem("fototrack-token");

      const res = await fetch("http://localhost:4000/api/carrito/mio", {
        headers: { Authorization: "Bearer " + token },
      });

      const data = await res.json();

      if (!data.ok) throw new Error("Error obteniendo carrito");

      setCarrito(data.carrito);
    } catch (err) {
      console.error("Error cargando carrito:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCart();
  }, []);

  // ----------------------------
  // Eliminar un ítem del carrito
  // ----------------------------
  async function handleRemoveItem(idItem) {
    const token = localStorage.getItem("fototrack-token");

    await fetch(`http://localhost:4000/api/carrito/item/${idItem}`, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token },
    });

    loadCart();
  }

  // ----------------------------
  // Vaciar carrito
  // ----------------------------
  async function handleClearCart() {
    const confirmar = window.confirm("¿Vaciar todo el carrito?");
    if (!confirmar) return;

    const token = localStorage.getItem("fototrack-token");

    await fetch("http://localhost:4000/api/carrito/mio", {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token },
    });

    loadCart();
  }

  // ----------------------------
  // Navegar al checkout
  // ----------------------------
  function goToCheckout() {
    navigate("/app/checkout"); // ← CORREGIDO
  }

  return (
    <div className="container py-4" style={{ maxWidth: "900px" }}>
      <h2 className="fw-bold mb-4">🛒 Mi Carrito</h2>

      {loading && <p>Cargando carrito...</p>}

      {!loading && carrito && carrito.items.length === 0 && (
        <div className="alert alert-info">
          Tu carrito está vacío. Agregá fotos desde cualquier álbum.
        </div>
      )}

      {!loading && carrito && carrito.items.length > 0 && (
        <>
          {/* LISTA DE ÍTEMS */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              {carrito.items.map((item) => (
                <div
                  key={item.idItem}
                  className="d-flex align-items-center justify-content-between mb-3 pb-3 border-bottom"
                >
                  <div className="d-flex align-items-center gap-3">
                    {/* MINIATURA */}
                    <img
                      src={item.miniatura}
                      alt="foto"
                      style={{
                        width: 80,
                        height: 80,
                        objectFit: "cover",
                        borderRadius: 8,
                        border: "1px solid #ddd",
                      }}
                    />

                    <div>
                      <div className="fw-semibold">Foto #{item.idImagen}</div>
                      <small className="text-muted">
                        {item.nombreAlbum}
                      </small>
                      <div className="mt-1">
                        <strong>${item.precioUnitario}</strong>
                      </div>
                    </div>
                  </div>

                  {/* BOTÓN ELIMINAR */}
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleRemoveItem(item.idItem)}
                  >
                    Eliminar
                  </button>
                </div>
              ))}

              {/* TOTAL */}
              <div className="d-flex justify-content-end mt-3">
                <h4 className="fw-bold">Total: ${carrito.total}</h4>
              </div>
            </div>
          </div>

          {/* ACCIONES */}
          <div className="d-flex justify-content-between">
            <button
              className="btn btn-outline-danger"
              onClick={handleClearCart}
            >
              Vaciar carrito
            </button>

            <button className="btn btn-primary" onClick={goToCheckout}>
              Continuar con la compra →
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default CartPage;
