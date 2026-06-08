// apps/web/src/pages/AdminDashboardPage.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export function AdminDashboardPage() {
  const [resumen, setResumen] = useState({
    ingresosTotales: 0,
    ventasRealizadas: 0,
    usuariosActivos: 0,
  });

  const [loading, setLoading] = useState(true);
  const [errorCarga, setErrorCarga] = useState(false);

  useEffect(() => {
    fetchResumen();
  }, []);

  const fetchResumen = async () => {
    try {
      setErrorCarga(false);

      const res = await fetch(
        "http://localhost:4000/api/reports/executive",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              "fototrack-token"
            )}`,
          },
        }
      );

      const result = await res.json();

      if (result.ok) {
        const fuente = result.reporte || result;

        setResumen({
          ingresosTotales: Number(fuente.ingresosTotales || 0),
          ventasRealizadas: Number(fuente.ventasRealizadas || 0),
          usuariosActivos: Number(fuente.usuariosActivos || 0),
        });
      } else {
        setErrorCarga(true);
      }
    } catch (error) {
      console.error("Error al cargar resumen:", error);
      setErrorCarga(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-5 text-center">
        Cargando panel...
      </div>
    );
  }

  return (
    <div className="p-4 p-md-5">
      <section className="mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="fw-bold mb-2">
              Panel de administración
            </h2>
            <p className="text-muted mb-0">
              Centro de control y monitoreo de FotoTrack.
            </p>
          </div>

          <button
            className="btn btn-sm btn-outline-primary"
            onClick={fetchResumen}
          >
            Actualizar datos
          </button>
        </div>
      </section>

      {errorCarga && (
        <div className="alert alert-warning">
          No fue posible actualizar las métricas del sistema.
        </div>
      )}

      <section className="mb-4">
        <div className="row g-3">
          <div className="col-12 col-md-4">
            <div className="card border-0 shadow-sm h-100 bg-primary text-white">
              <div className="card-body">
                <div className="small mb-1 opacity-75">
                  Ingresos Totales
                </div>

                <div className="h2 mb-0 fw-bold">
                  $
                  {resumen.ingresosTotales.toLocaleString(
                    "es-AR"
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="text-muted small mb-1">
                  Ventas Realizadas
                </div>

                <div className="h2 mb-0 fw-bold text-dark">
                  {resumen.ventasRealizadas}
                </div>

                <small className="text-muted">
                  Compras registradas
                </small>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="text-muted small mb-1">
                  Cantidad de Usuarios
                </div>

                <div className="h2 mb-0 fw-bold text-dark">
                  {resumen.usuariosActivos}
                </div>

                <small className="text-muted">
                  Usuarios registrados en el sistema
                </small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-4">
        <h5 className="fw-semibold mb-3">
          Accesos rápidos
        </h5>

        <div className="row g-3">
          <div className="col-12 col-md-4">
            <Link
              to="/admin/albums/nuevo"
              className="card btn text-start border-0 shadow-sm py-3 h-100"
            >
              <div className="fw-semibold">
                ➕ Crear nuevo álbum
              </div>

              <small className="text-muted text-wrap">
                Registrar un nuevo evento y cargar fotografías.
              </small>
            </Link>
          </div>

          <div className="col-12 col-md-4">
            <Link
              to="/admin/reports"
              className="card btn text-start border-0 shadow-sm py-3 h-100"
            >
              <div className="fw-semibold">
                📊 Reportes
              </div>

              <small className="text-muted text-wrap">
                Consultar información de ventas y actividad.
              </small>
            </Link>
          </div>

          <div className="col-12 col-md-4">
            <Link
              to="/admin/audit"
              className="card btn text-start border-0 shadow-sm py-3 h-100"
            >
              <div className="fw-semibold">
                🕵️ Auditoría
              </div>

              <small className="text-muted text-wrap">
                Revisar acciones registradas en el sistema.
              </small>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}