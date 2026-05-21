import { useEffect, useState, useCallback } from "react";

export function AdminAuditPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Estados para los Filtros y Paginación
  const [filtros, setFiltros] = useState({
    modulo: "",
    fechaDesde: "",
    fechaHasta: "",
    usuario: "" // 👈 Agregado para el nuevo filtro
  });
  
  const [paginacion, setPaginacion] = useState({
    paginaActual: 1,
    paginas: 1,
    total: 0,
    limite: 20
  });

  // Usamos useCallback para que useEffect no se queje si lo ponemos en las dependencias
  const fetchLogs = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("fototrack-token");
      
      // 2. Construimos la URL con los parámetros dinámicos
      const queryParams = new URLSearchParams({
        page: page,
        limit: paginacion.limite,
        modulo: filtros.modulo,
        fechaDesde: filtros.fechaDesde,
        fechaHasta: filtros.fechaHasta,
        usuario: filtros.usuario // 👈 Agregado a la petición
      }).toString();

      const res = await fetch(`http://localhost:4000/api/users/audit?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Error en la respuesta del servidor");

      const data = await res.json();
      
      if (data.ok) {
        setLogs(data.logs || []);
        // Si el backend manda paginación, la actualizamos
        if (data.paginacion) setPaginacion(data.paginacion);
      }
    } catch (err) {
      console.error("Error cargando auditoría:", err);
    } finally {
      setLoading(false);
    }
  }, [filtros, paginacion.limite]);

  // Ejecuta la búsqueda al montar o al cambiar filtros
  useEffect(() => {
    fetchLogs(1); // Siempre vuelve a la página 1 cuando cambian los filtros
  }, [filtros, fetchLogs]);

  const handleFilterChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const limpiarFiltros = () => {
    setFiltros({ modulo: "", fechaDesde: "", fechaHasta: "", usuario: "" });
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Auditoría del Sistema 🛡️</h2>
          <p className="text-muted">Registro detallado de acciones críticas realizadas por los usuarios.</p>
        </div>
        <button className="btn btn-outline-primary btn-sm rounded-pill px-3" onClick={() => fetchLogs(paginacion.paginaActual)}>
          🔄 Actualizar
        </button>
      </div>

      {/* 🛠️ BARRA DE FILTROS REORGANIZADA */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-light">
        <div className="row g-3 align-items-end">
          
          {/* 👈 NUEVO INPUT: Usuario */}
          <div className="col-md-3">
            <label className="form-label small text-muted fw-bold mb-1">Buscar Usuario</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Nombre o Correo..."
              name="usuario" 
              value={filtros.usuario} 
              onChange={handleFilterChange} 
            />
          </div>

          <div className="col-md-3">
            <label className="form-label small text-muted fw-bold mb-1">Módulo del Sistema</label>
            <select className="form-select" name="modulo" value={filtros.modulo} onChange={handleFilterChange}>
              <option value="">Todos los módulos</option>
              <option value="ADMIN">Administración (Usuarios/Roles)</option>
              <option value="PERFIL">Perfil de Usuario</option>
              <option value="VENTAS">Ventas y Pagos</option>
              <option value="AUTH">Login y Seguridad</option>
              <option value="IA">Reconocimiento Facial</option>
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label small text-muted fw-bold mb-1">Desde Fecha</label>
            <input type="date" className="form-control" name="fechaDesde" value={filtros.fechaDesde} onChange={handleFilterChange} />
          </div>
          <div className="col-md-2">
            <label className="form-label small text-muted fw-bold mb-1">Hasta Fecha</label>
            <input type="date" className="form-control" name="fechaHasta" value={filtros.fechaHasta} onChange={handleFilterChange} />
          </div>
          <div className="col-md-2 d-flex gap-2">
            <button 
              className="btn btn-secondary flex-grow-1" 
              onClick={limpiarFiltros} 
              disabled={!filtros.modulo && !filtros.fechaDesde && !filtros.fechaHasta && !filtros.usuario}
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-2 text-muted">Consultando base de datos...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="alert alert-info rounded-4 border-0 shadow-sm text-center py-4">
          <h5 className="mb-0">No se encontraron registros de auditoría</h5>
          <p className="small mb-0">No hay acciones que coincidan con los filtros seleccionados.</p>
        </div>
      ) : (
        <>
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="ps-4">Fecha y Hora</th>
                    <th>Usuario</th>
                    <th>Acción</th>
                    <th>Módulo</th>
                    <th>Detalles</th>
                    <th className="pe-4 text-end">IP Origen</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.idAuditoria}>
                      <td className="ps-4 small">
                        {new Date(log.fechaHora).toLocaleString('es-AR')}
                      </td>
                      <td>
                        <span className="fw-bold text-dark">{log.usuario || 'Sistema'}</span>
                      </td>
                      <td>
                        <span className={`badge rounded-pill ${getBadgeClass(log.accion)}`}>
                          {log.accion}
                        </span>
                      </td>
                      <td><small className="text-uppercase fw-bold text-muted">{log.modulo}</small></td>
                      <td className="text-muted small" style={{maxWidth: '300px'}}>
                        {log.detalle}
                      </td>
                      <td className="pe-4 text-end">
                        <code className="small text-secondary bg-light px-2 py-1 rounded">
                          {log.ipOrigen}
                        </code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 🔢 CONTROLES DE PAGINACIÓN */}
          {paginacion.paginas > 1 && (
            <div className="d-flex justify-content-between align-items-center px-2">
              <div className="small text-muted fw-semibold">
                Mostrando página {paginacion.paginaActual} de {paginacion.paginas} (Total: {paginacion.total} registros)
              </div>
              <div className="btn-group shadow-sm">
                <button 
                  className="btn btn-outline-primary px-4" 
                  disabled={paginacion.paginaActual === 1}
                  onClick={() => fetchLogs(paginacion.paginaActual - 1)}
                >
                  ◀ Anterior
                </button>
                <button 
                  className="btn btn-outline-primary px-4" 
                  disabled={paginacion.paginaActual === paginacion.paginas}
                  onClick={() => fetchLogs(paginacion.paginaActual + 1)}
                >
                  Siguiente ▶
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Función auxiliar para colores de badges según la acción
const getBadgeClass = (accion) => {
  if (!accion) return 'bg-secondary-subtle text-secondary';
  const a = accion.toUpperCase();
  if (a.includes('DELETE') || a.includes('REJECT') || a.includes('ERROR') || a.includes('SUSPEND') || a.includes('INACTIVO')) return 'bg-danger-subtle text-danger';
  if (a.includes('CREATE') || a.includes('CONFIRM') || a.includes('SUCCESS') || a.includes('NUEVA') || a.includes('REGISTRO')) return 'bg-success-subtle text-success';
  if (a.includes('PAYMENT') || a.includes('PURCHASE') || a.includes('COMPRA')) return 'bg-primary-subtle text-primary';
  if (a.includes('LOGIN') || a.includes('PROFILE') || a.includes('UPDATE')) return 'bg-info-subtle text-info';
  return 'bg-secondary-subtle text-secondary';
};

export default AdminAuditPage;