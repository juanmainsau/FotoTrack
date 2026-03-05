// src/pages/AdminVentasPage.jsx
import { useEffect, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { PurchaseReceiptModal } from "../components/PurchaseReceiptModal"; // 👈 IMPORTANTE: Asegurate de tener este archivo creado

export function AdminVentasPage() {
  const [ventas, setVentas] = useState([]);
  const [config, setConfig] = useState(null); // 👈 Aquí guardamos los datos del Vendedor
  const [loading, setLoading] = useState(true);
  
  // Estado para saber qué recibo abrir
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null); 

  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem("fototrack-token");
        const headers = { "Authorization": `Bearer ${token}` };

        // 1. Buscamos las ventas
        const resVentas = await fetch("http://localhost:4000/api/compras/admin", { headers });
        const dataVentas = await resVentas.json();
        
        // 2. Buscamos la configuración (Datos del vendedor)
        const resConfig = await fetch("http://localhost:4000/api/config", { headers });
        const dataConfig = await resConfig.json();
        
        setVentas(dataVentas);
        setConfig(dataConfig);
      } catch (err) {
        console.error("Error cargando datos de ventas:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Función para definir el color de los badges de estado
  const getStatusBadge = (status) => {
    const s = status?.toLowerCase();
    if (s === 'approved' || s === 'aprobado') return "bg-success";
    if (s === 'pending' || s === 'pendiente') return "bg-warning text-dark";
    if (s === 'rejected' || s === 'rechazado') return "bg-danger";
    return "bg-secondary";
  };

  return (
    <>
      <PageHeader titulo="Gestión de Ventas" />

      <div className="container-fluid p-4">
        {/* Resumen simple */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm p-3 text-center">
              <h6 className="text-muted small text-uppercase">Total Ventas</h6>
              <h4 className="fw-bold mb-0 text-primary">{ventas.length}</h4>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm p-3 text-center">
              <h6 className="text-muted small text-uppercase">Ingresos Totales</h6>
              <h4 className="fw-bold mb-0 text-success">
                ${ventas.reduce((acc, v) => acc + (v.estadoPago === 'approved' ? Number(v.total) : 0), 0).toLocaleString('es-AR')}
              </h4>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm">
          <div className="card-body p-0">
            {loading ? (
              <div className="p-5 text-center">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="mt-2 text-muted">Buscando transacciones...</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">ID</th>
                      <th>Fecha / Hora</th>
                      <th>Cliente</th>
                      <th>Ref. Mercado Pago</th>
                      <th>Monto Total</th>
                      <th>Estado</th>
                      <th className="text-end pe-4">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ventas.map((v) => (
                      <tr key={v.idCompra}>
                        <td className="ps-4 fw-bold text-muted">#{v.idCompra}</td>
                        <td>
                          <div className="small">{new Date(v.fecha).toLocaleDateString("es-AR")}</div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                            {new Date(v.fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs
                          </div>
                        </td>
                        <td>
                          <div className="fw-semibold">{v.nombreUsuario || 'Usuario Invitado'}</div>
                          <div className="text-muted small">{v.correo}</div>
                        </td>
                        <td>
                          <code className="small text-dark">{v.idTransaccionMP || 'N/A'}</code>
                        </td>
                        <td>
                          <span className="fw-bold text-dark">
                            ${v.total?.toLocaleString('es-AR') || '0.00'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge rounded-pill ${getStatusBadge(v.estadoPago)}`}>
                            {v.estadoPago === 'approved' ? 'Aprobado' : v.estadoPago}
                          </span>
                        </td>
                        <td className="text-end pe-4">
                          {/* 🎯 BOTÓN PARA ABRIR EL COMPROBANTE */}
                          <button 
                            className="btn btn-sm btn-outline-primary fw-bold px-3 shadow-sm"
                            onClick={() => setVentaSeleccionada(v)}
                            disabled={v.estadoPago !== 'approved'} // Opcional: solo permitir imprimir los aprobados
                            title={v.estadoPago !== 'approved' ? 'Solo para pagos aprobados' : 'Ver Comprobante'}
                          >
                            📄 Comprobante
                          </button>
                        </td>
                      </tr>
                    ))}

                    {ventas.length === 0 && (
                      <tr>
                        <td colSpan="7" className="text-center py-5">
                          <div className="text-muted">No se encontraron registros de ventas.</div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🧾 RENDERIZAMOS EL MODAL SI HAY UNA VENTA SELECCIONADA */}
      {ventaSeleccionada && (
        <PurchaseReceiptModal 
          venta={ventaSeleccionada} 
          config={config} 
          onClose={() => setVentaSeleccionada(null)} 
        />
      )}
    </>
  );
}