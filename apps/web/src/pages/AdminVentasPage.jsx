import { useEffect, useState, useCallback } from "react";
import { PageHeader } from "../components/PageHeader";
import { PurchaseReceiptModal } from "../components/PurchaseReceiptModal";

export function AdminVentasPage() {
  const [ventas, setVentas] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [totalIngresos, setTotalIngresos] = useState(0); // 👈 Estado para Ingresos Globales

  // 1. Estados de Filtros y Paginación
  const [filtros, setFiltros] = useState({
    estado: "",
    cliente: "",
    fechaDesde: "",
    fechaHasta: "",
    sort: "DESC" // 👈 Estado para el ordenamiento
  });

  const [paginacion, setPaginacion] = useState({
    paginaActual: 1,
    paginas: 1,
    total: 0
  });

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("fototrack-token");
      const headers = { "Authorization": `Bearer ${token}` };

      // Construir query string con sort incluido
      const queryParams = new URLSearchParams({
        page,
        limit: 10,
        estado: filtros.estado,
        cliente: filtros.cliente,
        fechaDesde: filtros.fechaDesde,
        fechaHasta: filtros.fechaHasta,
        sort: filtros.sort // 👈 Se envía al backend
      }).toString();

      // Ventas con paginación
      const resVentas = await fetch(`http://localhost:4000/api/compras/admin?${queryParams}`, { headers });
      const dataVentas = await resVentas.json();

      // Configuración (solo la primera vez)
      if (!config) {
        const resConfig = await fetch("http://localhost:4000/api/config", { headers });
        const dataConfig = await resConfig.json();
        setConfig(dataConfig);
      }

      if (dataVentas.ok) {
        setVentas(dataVentas.ventas || []);
        setTotalIngresos(dataVentas.ingresosGlobales || 0); // 👈 Seteamos el total real del backend
        if (dataVentas.paginacion) setPaginacion(dataVentas.paginacion);
      }
      
    } catch (err) {
      console.error("Error cargando datos:", err);
    } finally {
      setLoading(false);
    }
  }, [filtros, config]);

  useEffect(() => {
    fetchData(1);
  }, [filtros, fetchData]);

  const handleFilterChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const limpiarFiltros = () => {
    setFiltros({
      estado: "",
      cliente: "",
      fechaDesde: "",
      fechaHasta: "",
      sort: "DESC"
    });
  };

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
        {/* 📊 Resumen Estadístico */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm p-3 text-center">
              <h6 className="text-muted small text-uppercase">Resultados Totales</h6>
              <h4 className="fw-bold mb-0 text-primary">{paginacion.total}</h4>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm p-3 text-center border-start border-success border-4">
              <h6 className="text-muted small text-uppercase">Ingresos</h6>
              <h4 className="fw-bold mb-0 text-success">
                ${Number(totalIngresos).toLocaleString('es-AR')}
              </h4>
            </div>
          </div>
        </div>

        {/* 🛠️ BARRA DE FILTROS */}
        <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-light">
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label small text-muted fw-bold mb-1">Buscar Cliente</label>
              <input type="text" name="cliente" className="form-control shadow-sm" placeholder="Nombre o email..." value={filtros.cliente} onChange={handleFilterChange} />
            </div>
            <div className="col-md-2">
              <label className="form-label small text-muted fw-bold mb-1">Estado</label>
              <select name="estado" className="form-select shadow-sm" value={filtros.estado} onChange={handleFilterChange}>
                <option value="">Todos los estados</option>
                <option value="approved">Aprobado</option>
                <option value="pendiente">Pendiente</option> 
                <option value="rejected">Rechazado</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label small text-muted fw-bold mb-1">Orden Fecha</label>
              <select name="sort" className="form-select shadow-sm" value={filtros.sort} onChange={handleFilterChange}>
                <option value="DESC">Descendente</option>
                <option value="ASC">Ascendente</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label small text-muted fw-bold mb-1">Desde / Hasta</label>
              <div className="input-group shadow-sm">
                <input type="date" name="fechaDesde" className="form-control" value={filtros.fechaDesde} onChange={handleFilterChange} />
                <input type="date" name="fechaHasta" className="form-control" value={filtros.fechaHasta} onChange={handleFilterChange} />
              </div>
            </div>
            <div className="col-md-3">
              <button className="btn btn-secondary w-100 shadow-sm" onClick={limpiarFiltros}>
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* 📋 Tabla de Resultados */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="card-body p-0">
            {loading ? (
              <div className="p-5 text-center">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="mt-2 text-muted">Cargando transacciones...</p>
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-4">ID</th>
                        <th>Fecha / Hora</th>
                        <th>Cliente</th>
                        <th>Monto Total</th>
                        <th>Estado Pago</th>
                        <th className="text-end pe-4">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ventas.map((v) => (
                        <tr key={v.idCompra}>
                          <td className="ps-4 fw-bold text-muted">#{v.idCompra}</td>
                          <td>
                            <div className="small fw-semibold">{new Date(v.fecha).toLocaleDateString("es-AR")}</div>
                            <div className="text-muted small" style={{ fontSize: '0.7rem' }}>
                              {new Date(v.fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs
                            </div>
                          </td>
                          <td>
                            <div className="fw-semibold text-dark">{v.nombreUsuario || 'Usuario Invitado'}</div>
                            <div className="text-muted small">{v.correo}</div>
                          </td>
                          <td><span className="fw-bold text-dark">${Number(v.total).toLocaleString('es-AR')}</span></td>
                          <td>
                            <span className={`badge rounded-pill ${getStatusBadge(v.estadoPago)}`}>
                              {v.estadoPago === 'approved' ? 'Aprobado' : v.estadoPago}
                            </span>
                          </td>
                          <td className="text-end pe-4">
                            <button className="btn btn-sm btn-outline-primary fw-bold shadow-sm" onClick={() => setVentaSeleccionada(v)}>
                              📄 Ver Recibo
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 🔢 Paginación */}
                {paginacion.paginas > 1 && (
                  <div className="d-flex justify-content-between align-items-center p-3 border-top bg-light">
                    <small className="text-muted fw-bold">Página {paginacion.paginaActual} de {paginacion.paginas}</small>
                    <div className="btn-group btn-group-sm shadow-sm">
                      <button className="btn btn-outline-primary px-3" disabled={paginacion.paginaActual === 1} onClick={() => fetchData(paginacion.paginaActual - 1)}>Anterior</button>
                      <button className="btn btn-outline-primary px-3" disabled={paginacion.paginaActual === paginacion.paginas} onClick={() => fetchData(paginacion.paginaActual + 1)}>Siguiente</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {ventaSeleccionada && (
        <PurchaseReceiptModal venta={ventaSeleccionada} config={config} onClose={() => setVentaSeleccionada(null)} />
      )}
    </>
  );
}