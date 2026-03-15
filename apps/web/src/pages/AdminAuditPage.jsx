import { useEffect, useState } from "react";

export function AdminAuditPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("fototrack-token");
      
      // 🔍 LA CORRECCIÓN: Apuntamos a /api/users/audit que es donde está la ruta
      const res = await fetch("http://localhost:4000/api/users/audit", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Error en la respuesta del servidor");

      const data = await res.json();
      
      if (data.ok) {
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error("Error cargando auditoría:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Auditoría del Sistema 🛡️</h2>
          <p className="text-muted">Registro detallado de acciones críticas realizadas por los usuarios.</p>
        </div>
        <button className="btn btn-outline-primary btn-sm rounded-pill px-3" onClick={fetchLogs}>
          🔄 Actualizar
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-2 text-muted">Consultando base de datos...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="alert alert-info rounded-4 border-0 shadow-sm text-center py-4">
          <h5 className="mb-0">Aún no hay registros de auditoría</h5>
          <p className="small mb-0">Las acciones aparecerán aquí a medida que los usuarios interactúen con el sistema.</p>
        </div>
      ) : (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
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
      )}
    </div>
  );
}

// Función auxiliar para colores de badges según la acción
const getBadgeClass = (accion) => {
  const a = accion.toUpperCase();
  if (a.includes('DELETE') || a.includes('REJECT') || a.includes('ERROR')) return 'bg-danger-subtle text-danger';
  if (a.includes('CREATE') || a.includes('CONFIRM') || a.includes('SUCCESS')) return 'bg-success-subtle text-success';
  if (a.includes('PAYMENT') || a.includes('PURCHASE')) return 'bg-primary-subtle text-primary';
  if (a.includes('LOGIN')) return 'bg-info-subtle text-info';
  return 'bg-secondary-subtle text-secondary';
};

export default AdminAuditPage;