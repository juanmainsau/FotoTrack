// src/pages/MisComprasPage.jsx
import { useEffect, useState } from "react";
import { authFetch } from "../api/authFetch";
import { PurchaseReceiptModal } from "../components/PurchaseReceiptModal";

const API_URL = "http://localhost:4000/api";

function isPagoAprobado(compra) {
  const estadoPago = String(compra?.estadoPago || "").toLowerCase();

  return ["approved", "aprobado", "pagado", "pagada"].includes(estadoPago);
}

function getEstadoTexto(compra) {
  if (isPagoAprobado(compra)) return "Aprobado";

  const estado = compra?.estadoPago || "Pendiente";
  return String(estado).charAt(0).toUpperCase() + String(estado).slice(1);
}

function MisComprasPage() {
  const [compras, setCompras] = useState([]);
  const [config, setConfig] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedCompra, setSelectedCompra] = useState(null);
  const [reciboAImprimir, setReciboAImprimir] = useState(null);

  async function loadData() {
    try {
      const resCompras = await authFetch(
        `${API_URL}/compras/mias?t=${Date.now()}`,
        { cache: "no-store" }
      );

      const dataCompras = await resCompras.json();

      if (dataCompras.ok) {
        setCompras(Array.isArray(dataCompras.compras) ? dataCompras.compras : []);
      }

      const resConfig = await authFetch(`${API_URL}/config?t=${Date.now()}`, {
        cache: "no-store",
      });

      const dataConfig = await resConfig.json();
      setConfig(dataConfig?.config || dataConfig);

      const resUser = await authFetch(`${API_URL}/auth/me?t=${Date.now()}`, {
        cache: "no-store",
      });

      const dataUser = await resUser.json();

      if (dataUser.ok) {
        setCurrentUser(dataUser.usuario || dataUser.user);
      }
    } catch (err) {
      console.error("Error cargando compras o configuración:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function descargarCompra(idCompra) {
    try {
      const res = await authFetch(`${API_URL}/compras/${idCompra}/descargar`);

      if (!res.ok) {
        throw new Error("No se pudo descargar el archivo.");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `FotoTrack_Compra_${idCompra}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error descargando compra:", err);
      alert("No se pudo descargar el ZIP.");
    }
  }

  return (
    <>
      <div className="container pb-5 pt-4">
        <div className="mb-4">
          <h2 className="fw-bold mb-1">Mis Compras</h2>
          <p className="text-muted mb-0">
            Historial de compras realizadas y descargas disponibles.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2 text-muted">Cargando historial...</p>
          </div>
        ) : compras.length === 0 ? (
          <div className="alert alert-info shadow-sm">
            🛒 No tenés compras registradas.
          </div>
        ) : (
          <div className="card border-0 shadow-sm">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4"># ID</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                    <th>Total</th>
                    <th className="text-end pe-4">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {compras.map((compra) => {
                    const aprobado = isPagoAprobado(compra);

                    return (
                      <tr
                        key={compra.idCompra}
                        style={{ cursor: "pointer" }}
                        onClick={() => setSelectedCompra(compra)}
                      >
                        <td className="ps-4 fw-bold text-muted">
                          #{compra.idCompra}
                        </td>

                        <td>
                          {compra.fechaCompra
                            ? new Date(compra.fechaCompra).toLocaleDateString("es-AR")
                            : "-"}
                        </td>

                        <td>
                          <span
                            className={`badge rounded-pill ${
                              aprobado ? "bg-success" : "bg-warning text-dark"
                            }`}
                          >
                            {getEstadoTexto(compra)}
                          </span>
                        </td>

                        <td className="fw-semibold text-dark">
                          ${Number(compra.total || 0).toLocaleString("es-AR")}
                        </td>

                        <td className="text-end pe-4">
                          <div className="d-flex justify-content-end gap-2">
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCompra(compra);
                              }}
                            >
                              Ver Resumen
                            </button>

                            {aprobado && (
                              <button
                                className="btn btn-sm btn-outline-primary fw-bold"
                                onClick={(e) => {
                                  e.stopPropagation();

                                  setReciboAImprimir({
                                    ...compra,
                                    nombreUsuario: currentUser?.nombre,
                                    correo: currentUser?.correo,
                                    cuitCliente: currentUser?.cuit,
                                  });
                                }}
                              >
                                📄 Descargar Recibo
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {reciboAImprimir && (
        <PurchaseReceiptModal
          venta={reciboAImprimir}
          config={config}
          onClose={() => setReciboAImprimir(null)}
        />
      )}

      {selectedCompra && !reciboAImprimir && (
        <>
          <div className="modal-backdrop fade show"></div>

          <div
            className="modal fade show"
            style={{ display: "block" }}
            tabIndex="-1"
            onClick={() => setSelectedCompra(null)}
          >
            <div
              className="modal-dialog modal-dialog-centered"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-content border-0 shadow-lg">
                <div className="modal-header bg-light">
                  <h5 className="modal-title fw-bold text-dark">
                    Resumen de Compra #{selectedCompra.idCompra}
                  </h5>

                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setSelectedCompra(null)}
                  ></button>
                </div>

                <div className="modal-body p-4">
                  <div className="d-flex justify-content-between mb-4 text-muted small border-bottom pb-3">
                    <span>
                      📅{" "}
                      {selectedCompra.fechaCompra
                        ? new Date(selectedCompra.fechaCompra).toLocaleString("es-AR")
                        : "-"}
                    </span>

                    <span>
                      Estado: <strong>{getEstadoTexto(selectedCompra)}</strong>
                    </span>
                  </div>

                  <h6 className="fw-bold mb-3">
                    📸 Fotos incluidas en este paquete:
                  </h6>

                  <div
                    className="list-group list-group-flush mb-4 border rounded"
                    style={{ maxHeight: "250px", overflowY: "auto" }}
                  >
                    {selectedCompra.items?.map((item) => (
                      <div
                        key={item.idItemCompra || item.idImagen}
                        className="list-group-item d-flex align-items-center gap-3 py-3"
                      >
                        <img
                          src={item.miniatura}
                          alt="miniatura"
                          className="rounded shadow-sm"
                          style={{
                            width: 60,
                            height: 60,
                            objectFit: "cover",
                          }}
                        />

                        <div className="flex-grow-1">
                          <div className="small fw-bold">
                            Foto #{item.idImagen}
                          </div>

                          <div className="text-muted small">
                            {item.nombreAlbum ||
                              item.nombreProducto ||
                              "Evento Fotográfico"}
                          </div>
                        </div>

                        <div className="fw-semibold text-dark">
                          ${Number(item.precioUnitario || 0).toLocaleString("es-AR")}
                        </div>
                      </div>
                    ))}

                    {(!selectedCompra.items ||
                      selectedCompra.items.length === 0) && (
                      <div className="p-3 text-center text-danger small fw-bold">
                        ⚠️ Las imágenes de este álbum ya no se encuentran disponibles.
                      </div>
                    )}
                  </div>

                  <div className="d-flex justify-content-between align-items-center bg-light border p-3 rounded mb-4">
                    <span className="fs-6 fw-semibold text-muted">
                      Total Abonado:
                    </span>

                    <span className="fs-4 fw-bold text-success">
                      ${Number(selectedCompra.total || 0).toLocaleString("es-AR")}
                    </span>
                  </div>

                  <div className="alert alert-primary py-3 small border-0 shadow-sm mb-0">
                    <div className="fw-bold mb-2">
                      🔗 Link de descarga generado:
                    </div>

                    <div className="d-flex flex-column gap-2">
                      <code
                        className="bg-white text-dark rounded px-2 py-2 d-block"
                        style={{
                          wordBreak: "break-all",
                          whiteSpace: "normal",
                        }}
                      >
                        {`${API_URL}/compras/${selectedCompra.idCompra}/descargar`}
                      </code>

                      <button
                        className="btn btn-sm btn-primary fw-bold"
                        onClick={() => descargarCompra(selectedCompra.idCompra)}
                      >
                        ⬇️ Descargar imágenes en alta calidad
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default MisComprasPage;