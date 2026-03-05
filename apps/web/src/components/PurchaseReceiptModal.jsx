import { useEffect, useState } from "react";

export function PurchaseReceiptModal({ venta, config, onClose }) {
  // Generamos un número de comprobante ficticio basado en el ID de la compra
  // AFIP usa formato: Punto de Venta (4) - Número (8). Ej: 0001-00000024
  const numeroComprobante = `0001-${String(venta.idCompra).padStart(8, '0')}`;
  
  // Fecha formateada
  const fechaEmision = new Date(venta.fecha).toLocaleDateString("es-AR");

  return (
    <>
      {/* FONDO OSCURO PARA EL MODAL (No se imprime) */}
      <div className="modal-backdrop fade show d-print-none" onClick={onClose} style={{ zIndex: 1040 }}></div>

      <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content shadow-lg border-0 bg-transparent">
            
            {/* 🛠️ CONTROLES DEL MODAL (No se imprimen) */}
            <div className="d-flex justify-content-end mb-2 gap-2 d-print-none">
              <button className="btn btn-light shadow-sm" onClick={onClose}>
                ❌ Cerrar
              </button>
              <button 
                className="btn btn-primary shadow-sm fw-bold" 
                onClick={() => window.print()}
              >
                🖨️ Imprimir / Guardar PDF
              </button>
            </div>

            {/* 📄 EL COMPROBANTE (Esto es lo único que se imprime) */}
            <div 
              className="bg-white text-dark p-4 p-md-5 mx-auto print-container" 
              style={{ 
                width: "100%", 
                maxWidth: "800px",
                minHeight: "500px",
                border: "1px solid #ccc"
              }}
            >
              {/* --- 1. CABECERA ESTILO AFIP --- */}
              <div className="row position-relative border-bottom border-2 border-dark pb-3 mb-3">
                
                {/* Letra Central */}
                <div className="position-absolute top-0 start-50 translate-middle-x text-center bg-white" style={{ width: "60px" }}>
                  <div className="border border-2 border-dark fs-2 fw-bold" style={{ padding: "0px" }}>X</div>
                  <div className="small fw-bold" style={{ fontSize: "0.6rem" }}>DOCUMENTO<br/>NO VÁLIDO<br/>COMO FACTURA</div>
                </div>

                {/* Vendedor (Izquierda) */}
                <div className="col-6 pe-4">
                  <h3 className="fw-bold mb-3 text-uppercase">{config?.vendedor_nombre || "FotoTrack Studio"}</h3>
                  <div className="small lh-sm">
                    <p className="mb-1"><strong>Razón Social:</strong> {config?.vendedor_nombre || "No configurado"}</p>
                    <p className="mb-1"><strong>Domicilio Comercial:</strong> {config?.vendedor_direccion || "No configurado"}</p>
                    <p className="mb-1"><strong>Condición frente al IVA:</strong> Responsable Monotributo</p>
                    <p className="mb-0"><strong>Contacto:</strong> {config?.vendedor_email || ""} | {config?.vendedor_telefono || ""}</p>
                  </div>
                </div>

                {/* Datos del Documento (Derecha) */}
                <div className="col-6 ps-5 text-end">
                  <h4 className="fw-bold mb-3">RECIBO DE PAGO</h4>
                  <div className="small lh-sm">
                    <p className="mb-1"><strong>Comp. Nro:</strong> {numeroComprobante}</p>
                    <p className="mb-1"><strong>Fecha de Emisión:</strong> {fechaEmision}</p>
                    <p className="mb-1"><strong>CUIT:</strong> {config?.vendedor_cuit || "00-00000000-0"}</p>
                    <p className="mb-1"><strong>Ingresos Brutos:</strong> {config?.vendedor_cuit || "00-00000000-0"}</p>
                    <p className="mb-0"><strong>Inicio de Actividades:</strong> 01/01/2024</p>
                  </div>
                </div>
              </div>

              {/* --- 2. DATOS DEL CLIENTE --- */}
              <div className="row mb-4 border rounded p-2 mx-0 bg-light">
                <div className="col-8">
                  <div className="small">
                    <strong>Nombre / Razón Social:</strong> {venta.nombreUsuario || "Consumidor Final"}
                  </div>
                  <div className="small mt-1">
                    <strong>Condición frente al IVA:</strong> Consumidor Final
                  </div>
                </div>
                <div className="col-4 text-end">
                  <div className="small">
                    <strong>Correo:</strong> {venta.correo || "-"}
                  </div>
                  <div className="small mt-1">
                    <strong>Ref. Pago:</strong> {venta.idTransaccionMP || "N/A"}
                  </div>
                </div>
              </div>

              {/* --- 3. GRILLA DE ÍTEMS --- */}
              <table className="table table-sm table-bordered border-dark align-middle mb-4">
                <thead className="table-light text-center small">
                  <tr>
                    <th style={{ width: "10%" }}>Cant.</th>
                    <th style={{ width: "60%", textAlign: "left" }}>Descripción</th>
                    <th style={{ width: "15%" }}>Precio Unit.</th>
                    <th style={{ width: "15%" }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody className="small">
                  {/* Como todavía no trajimos los ítems reales del backend, hacemos un mock genérico */}
                  <tr>
                    <td className="text-center">1</td>
                    <td>Adquisición de fotografías digitales (Ref. Compra #{venta.idCompra})</td>
                    <td className="text-end">${venta.total?.toLocaleString('es-AR')}</td>
                    <td className="text-end fw-semibold">${venta.total?.toLocaleString('es-AR')}</td>
                  </tr>
                </tbody>
              </table>

              {/* --- 4. TOTALES --- */}
              <div className="row justify-content-end mt-5">
                <div className="col-5">
                  <table className="table table-sm table-borderless">
                    <tbody>
                      <tr className="border-top border-dark border-2 fs-5">
                        <td className="fw-bold text-end">Importe Total:</td>
                        <td className="fw-bold text-end">${venta.total?.toLocaleString('es-AR')}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* --- 5. FOOTER / LEGALES --- */}
              <div className="text-center text-muted mt-5 pt-3 border-top small" style={{ fontSize: "0.7rem" }}>
                Comprobante generado automáticamente por el sistema FotoTrack.<br/>
                Gracias por su compra. Las fotografías digitales no tienen cambio ni devolución.
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* 💅 CSS MÁGICO PARA IMPRESIÓN */}
      <style>{`
        @media print {
          /* Oculta TODO el sitio excepto la clase print-container */
          body * {
            visibility: hidden;
          }
          .print-container, .print-container * {
            visibility: visible;
          }
          /* Posiciona el contenedor de impresión exactamente en el papel */
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          /* Ajustes de página para PDF perfecto */
          @page {
            size: A4 portrait;
            margin: 1cm;
          }
        }
      `}</style>
    </>
  );
}