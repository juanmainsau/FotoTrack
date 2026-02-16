import { useEffect, useState } from "react";
import { authFetch } from "../api/authFetch";
import { PageHeader } from "../components/PageHeader";

function MisComprasPage() {
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para el Modal de Detalle
  const [selectedCompra, setSelectedCompra] = useState(null);

  // Carga de historial
  async function loadData() {
    try {
      const res = await authFetch("http://localhost:4000/api/compras/mias");
      const data = await res.json();

      if (data.ok) {
        setCompras(data.compras);
      }
    } catch (err) {
      console.error("Error cargando compras:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <>
      <PageHeader title="Mis Compras" />

      <div className="container pb-5">
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
          /* TABLA DE RESUMEN */
          <div className="card border-0 shadow-sm">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th scope="col" className="ps-4"># ID</th>
                    <th scope="col">Fecha</th>
                    <th scope="col">Estado</th>
                    <th scope="col">Total</th>
                    <th scope="col" className="text-end pe-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {compras.map((compra) => (
                    <tr 
                        key={compra.idCompra} 
                        style={{cursor: 'pointer'}}
                        onClick={() => setSelectedCompra(compra)} // Click en fila abre modal
                    >
                      <td className="ps-4 fw-bold">#{compra.idCompra}</td>
                      <td>
                        {new Date(compra.fechaCompra).toLocaleDateString()}
                      </td>
                      <td>
                        <span className={`badge rounded-pill ${compra.estadoPago === 'approved' ? 'bg-success' : 'bg-warning text-dark'}`}>
                          {compra.estadoPago === 'approved' ? 'Aprobado' : 'Pendiente'}
                        </span>
                      </td>
                      <td className="fw-semibold">${compra.total}</td>
                      <td className="text-end pe-4">
                        <button 
                          className="btn btn-sm btn-outline-primary"
                          onClick={(e) => {
                              e.stopPropagation(); 
                              setSelectedCompra(compra);
                          }}
                        >
                          Ver Resumen
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ========================================= */}
      {/* MODAL DE RESUMEN (POPUP) */}
      {/* ========================================= */}
      {selectedCompra && (
        <>
          {/* Fondo oscuro */}
          <div className="modal-backdrop fade show"></div>
          
          {/* Modal */}
          <div 
            className="modal fade show" 
            style={{ display: 'block' }} 
            tabIndex="-1"
            onClick={() => setSelectedCompra(null)}
          >
            <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
              <div className="modal-content">
                
                <div className="modal-header">
                  <h5 className="modal-title fw-bold">
                    Resumen de Compra #{selectedCompra.idCompra}
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setSelectedCompra(null)}
                  ></button>
                </div>

                <div className="modal-body">
                  
                  {/* Info General */}
                  <div className="d-flex justify-content-between mb-3 text-muted small border-bottom pb-2">
                    <span>📅 {new Date(selectedCompra.fechaCompra).toLocaleString()}</span>
                    <span>Estado: <strong>{selectedCompra.estadoPago}</strong></span>
                  </div>

                  {/* Lista de Fotos (Solo visualización) */}
                  <h6 className="fw-bold mb-3">📸 Fotos incluidas en este paquete:</h6>
                  <div className="list-group list-group-flush mb-4 border rounded" style={{maxHeight: '250px', overflowY: 'auto'}}>
                    {selectedCompra.items?.map((item) => (
                      <div key={item.idItemCompra || Math.random()} className="list-group-item d-flex align-items-center gap-3">
                         {/* Miniatura pequeña solo para identificar la foto */}
                         <img 
                            src={item.miniatura} 
                            alt="miniatura"
                            className="rounded border"
                            style={{width: 50, height: 50, objectFit: "cover"}}
                         />
                         <div className="flex-grow-1">
                            <div className="small fw-bold">Foto #{item.idImagen}</div>
                            <div className="text-muted small" style={{fontSize: '0.75rem'}}>
                                {item.nombreAlbum || "Evento"}
                            </div>
                         </div>
                         <div className="fw-semibold text-muted">${item.precioUnitario}</div>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="d-flex justify-content-between align-items-center bg-light p-3 rounded mb-3">
                    <span className="fs-5">Total Abonado:</span>
                    <span className="fs-4 fw-bold text-success">${selectedCompra.total}</span>
                  </div>
                  
                  {/* Nota informativa sobre la entrega */}
                  <div className="alert alert-info py-2 small">
                    ℹ️ Los enlaces de descarga fueron enviados a tu correo electrónico al momento de acreditarse el pago.
                  </div>

                  {/* Link a Comprobante MP */}
                  <div className="d-grid">
                    <a 
                        href="https://www.mercadopago.com.ar/activities" 
                        target="_blank" 
                        rel="noreferrer" 
                        className="btn btn-outline-secondary d-flex align-items-center justify-content-center gap-2"
                    >
                        <span>🧾</span> Ver Comprobante Oficial en Mercado Pago
                    </a>
                  </div>

                </div>

                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setSelectedCompra(null)}
                  >
                    Cerrar
                  </button>
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