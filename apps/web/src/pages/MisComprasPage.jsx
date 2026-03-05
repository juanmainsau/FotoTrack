// src/pages/MisComprasPage.jsx
import { useEffect, useState } from "react";
import { authFetch } from "../api/authFetch";
import { PageHeader } from "../components/PageHeader";
import { PurchaseReceiptModal } from "../components/PurchaseReceiptModal";

function MisComprasPage() {
  const [compras, setCompras] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Estados para los Modales
  const [selectedCompra, setSelectedCompra] = useState(null); // Para el modal de resumen rápido
  const [reciboAImprimir, setReciboAImprimir] = useState(null); // Para el modal del Comprobante

  // Carga de historial y configuración (Datos del negocio)
  async function loadData() {
    try {
      // 1. Cargar las compras del usuario
      const resCompras = await authFetch("http://localhost:4000/api/compras/mias");
      const dataCompras = await resCompras.json();

      if (dataCompras.ok) {
        setCompras(dataCompras.compras);
      }

      // 2. Cargar los datos del negocio (Para el comprobante)
      const resConfig = await authFetch("http://localhost:4000/api/config");
      const dataConfig = await resConfig.json();
      setConfig(dataConfig);

    } catch (err) {
      console.error("Error cargando compras o configuración:", err);
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
                        onClick={() => setSelectedCompra(compra)} // Click en fila abre modal de resumen
                    >
                      <td className="ps-4 fw-bold text-muted">#{compra.idCompra}</td>
                      <td>
                        {new Date(compra.fechaCompra).toLocaleDateString("es-AR")}
                      </td>
                      <td>
                        <span className={`badge rounded-pill ${compra.estadoPago === 'approved' ? 'bg-success' : 'bg-warning text-dark'}`}>
                          {compra.estadoPago === 'approved' ? 'Aprobado' : 'Pendiente'}
                        </span>
                      </td>
                      <td className="fw-semibold text-dark">${compra.total}</td>
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
                          
                          {/* 🎯 BOTÓN PARA IMPRIMIR COMPROBANTE PROPIO */}
                          {compra.estadoPago === 'approved' && (
                            <button 
                              className="btn btn-sm btn-outline-primary fw-bold"
                              onClick={(e) => {
                                  e.stopPropagation(); 
                                  setReciboAImprimir(compra);
                              }}
                            >
                              📄 Descargar Recibo
                            </button>
                          )}
                        </div>
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
      {/* 🧾 MODAL: COMPROBANTE PROPIO (REUTILIZADO) */}
      {/* ========================================= */}
      {reciboAImprimir && (
        <PurchaseReceiptModal 
          venta={reciboAImprimir} 
          config={config} 
          onClose={() => setReciboAImprimir(null)} 
        />
      )}

      {/* ========================================= */}
      {/* MODAL: RESUMEN RÁPIDO Y FOTOS */}
      {/* ========================================= */}
      {selectedCompra && !reciboAImprimir && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div 
            className="modal fade show" 
            style={{ display: 'block' }} 
            tabIndex="-1"
            onClick={() => setSelectedCompra(null)}
          >
            <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
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
                  
                  {/* Info General */}
                  <div className="d-flex justify-content-between mb-4 text-muted small border-bottom pb-3">
                    <span>📅 {new Date(selectedCompra.fechaCompra).toLocaleString("es-AR")}</span>
                    <span>Estado: <strong>{selectedCompra.estadoPago === 'approved' ? 'Aprobado' : selectedCompra.estadoPago}</strong></span>
                  </div>

                  {/* Lista de Fotos (Solo visualización) */}
                  <h6 className="fw-bold mb-3">📸 Fotos incluidas en este paquete:</h6>
                  <div className="list-group list-group-flush mb-4 border rounded" style={{maxHeight: '250px', overflowY: 'auto'}}>
                    {selectedCompra.items?.map((item) => (
                      <div key={item.idItemCompra || Math.random()} className="list-group-item d-flex align-items-center gap-3 py-3">
                         <img 
                            src={item.miniatura} 
                            alt="miniatura"
                            className="rounded shadow-sm"
                            style={{width: 60, height: 60, objectFit: "cover"}}
                         />
                         <div className="flex-grow-1">
                            <div className="small fw-bold">Foto #{item.idImagen}</div>
                            <div className="text-muted small">
                                {item.nombreAlbum || "Evento Fotográfico"}
                            </div>
                         </div>
                         <div className="fw-semibold text-dark">${item.precioUnitario}</div>
                      </div>
                    ))}
                    {(!selectedCompra.items || selectedCompra.items.length === 0) && (
                        <div className="p-3 text-center text-muted small">No se cargaron detalles visuales para esta compra.</div>
                    )}
                  </div>

                  {/* Total Abonado */}
                  <div className="d-flex justify-content-between align-items-center bg-light border p-3 rounded mb-4">
                    <span className="fs-6 fw-semibold text-muted">Total Abonado:</span>
                    <span className="fs-4 fw-bold text-success">${selectedCompra.total}</span>
                  </div>
                  
                  {/* Nota informativa sobre la entrega */}
                  <div className="alert alert-info py-2 small border-0 shadow-sm d-flex gap-2 align-items-center mb-0">
                    <span style={{ fontSize: '1.2rem' }}>ℹ️</span> 
                    <span>Los enlaces de descarga en alta calidad fueron enviados a tu correo electrónico registrado.</span>
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