import { useState } from "react";

export default function AdminReportsPage() {
  const [listado, setListado] = useState([]);
  const [filtros, setFiltros] = useState({ 
    desde: "", 
    hasta: "", 
    buscador: "", // Reemplaza a usuarioId
    tipo: "ventas" 
  });
  const [loading, setLoading] = useState(false);

  const generarReporte = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams(filtros).toString();
      const res = await fetch(`http://localhost:4000/api/reports/executive?${q}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("fototrack-token")}` }
      });
      const result = await res.json();
      if (result.ok) {
        setListado(result.data);
      }
    } catch (err) {
      console.error("Error al generar reporte:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      {/* --- ESTILOS DE IMPRESIÓN MEJORADOS --- */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .report-paper, .report-paper * {
              visibility: visible;
            }
            .report-paper {
              position: absolute;
              left: 0;
              top: 0;
              width: 100% !important;
              margin: 0 !important;
              padding: 0.5cm !important;
              box-shadow: none !important;
              border: none !important;
            }
            .table-dark {
              background-color: #212529 !important;
              color: white !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .text-success {
              color: #198754 !important;
            }
            nav, aside, header, footer, .d-print-none, .navbar, [class*="sidebar"] {
              display: none !important;
            }
            @page {
              size: A4;
              margin: 1cm;
            }
          }
        `}
      </style>

      {/* PANEL DE FILTROS - NO SE IMPRIME */}
      <div className="card shadow-sm p-4 mb-4 d-print-none bg-light border-0 rounded-4">
        <h5 className="fw-bold mb-3 text-dark">Configuración de Reporte Físico</h5>
        <div className="row g-3">
          <div className="col-md-3">
            <label className="small fw-bold text-muted">Tipo de Reporte</label>
            <select className="form-select" value={filtros.tipo} onChange={e => setFiltros({ ...filtros, tipo: e.target.value })}>
              <option value="ventas">Listado de Ventas Detalladas</option>
              <option value="actividad">Actividad de Usuarios (Auditoría)</option>
            </select>
          </div>
          <div className="col-md-2">
            <label className="small fw-bold text-muted">Desde</label>
            <input type="date" className="form-control" onChange={e => setFiltros({ ...filtros, desde: e.target.value })} />
          </div>
          <div className="col-md-2">
            <label className="small fw-bold text-muted">Hasta</label>
            <input type="date" className="form-control" onChange={e => setFiltros({ ...filtros, hasta: e.target.value })} />
          </div>

          {/* CUADRO DE BÚSQUEDA IGUAL AL DE VENTAS */}
          <div className="col-md-3">
            <label className="small fw-bold text-muted">Buscar Usuario o Correo</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Nombre o correo..."
              value={filtros.buscador}
              onChange={e => setFiltros({ ...filtros, buscador: e.target.value })}
            />
          </div>

          <div className="col-md-2 d-flex align-items-end gap-2">
            <button className="btn btn-primary w-100 fw-bold" onClick={generarReporte} disabled={loading}>
              {loading ? "..." : "Generar"}
            </button>
            <button className="btn btn-danger" onClick={() => window.print()} disabled={listado.length === 0}>
              PDF
            </button>
          </div>
        </div>
      </div>

      {/* ÁREA DEL REPORTE - ESTO ES LO QUE SE DESCARGA */}
      <div className="bg-white p-5 shadow border report-paper rounded-4">
        <div className="d-flex justify-content-between border-bottom pb-3 mb-4 align-items-center">
          <div>
            <h2 className="fw-bold text-uppercase mb-0" style={{ letterSpacing: '1px' }}>FotoTrack API</h2>
            <p className="text-muted mb-0">
              Reporte de {filtros.tipo === 'ventas' ? 'Ventas Detalladas' : 'Actividad de Sistema'}
            </p>
            {filtros.buscador && (
              <span className="badge bg-primary mt-1">
                Búsqueda: "{filtros.buscador}"
              </span>
            )}
          </div>
          <div className="text-end small text-muted">
            <p className="mb-0"><b>Fecha Emisión:</b> {new Date().toLocaleDateString()}</p>
            <p className="mb-0"><b>Periodo:</b> {filtros.desde || 'Inicio'} / {filtros.hasta || 'Hoy'}</p>
          </div>
        </div>

        <table className="table table-bordered table-striped align-middle">
          <thead className="table-dark">
            {filtros.tipo === 'ventas' ? (
              <tr>
                <th style={{ width: '25%' }}>Fecha</th>
                <th>Cliente / Correo</th>
                <th style={{ width: '15%' }}>Cant. Fotos</th>
                <th className="text-end" style={{ width: '20%' }}>Total</th>
              </tr>
            ) : (
              <tr>
                <th style={{ width: '25%' }}>Fecha/Hora</th>
                <th>Usuario</th>
                <th>Acción Realizada</th>
                <th style={{ width: '20%' }}>Módulo</th>
              </tr>
            )}
          </thead>
          <tbody>
            {listado.length > 0 ? listado.map((row, i) => (
              <tr key={i}>
                <td className="small">{new Date(row.fecha).toLocaleString()}</td>
                <td>
                  <div className="fw-bold text-dark">{row.cliente || row.usuario}</div>
                  {row.correo && <div className="small text-muted">{row.correo}</div>}
                </td>
                {filtros.tipo === 'ventas' ? (
                  <>
                    <td>{row.cantidad_fotos} fotos</td>
                    <td className="text-end fw-bold text-success">
                      ${Number(row.total).toLocaleString('es-AR')}
                    </td>
                  </>
                ) : (
                  <>
                    <td className="text-uppercase small fw-bold text-primary">{row.accion}</td>
                    <td><span className="badge bg-secondary">{row.modulo}</span></td>
                  </>
                )}
              </tr>
            )) : (
              <tr>
                <td colSpan="4" className="text-center py-5 text-muted">
                  No se encontraron resultados para los filtros aplicados.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {filtros.tipo === 'ventas' && listado.length > 0 && (
          <div className="text-end mt-4 pt-3 border-top">
            <h3 className="fw-bold">
              Total Recaudado: <span className="text-success">
                ${listado.reduce((acc, curr) => acc + Number(curr.total), 0).toLocaleString('es-AR')}
              </span>
            </h3>
          </div>
        )}
      </div>
    </div>
  );
}