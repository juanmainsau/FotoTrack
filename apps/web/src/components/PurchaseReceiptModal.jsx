// src/components/PurchaseReceiptModal.jsx
import { useEffect, useState } from "react";

export function PurchaseReceiptModal({ venta, config, onClose }) {
  // AFIP usa formato: Punto de Venta (4) - Número (8). Ej: 0001-00000024
  const numeroComprobante = `0001-${String(venta.idCompra).padStart(8, '0')}`;
  
  // Soportar tanto fechaCompra (Usuario) como fecha (Admin)
  const fechaCruda = venta.fechaCompra || venta.fecha;
  const fechaEmision = fechaCruda ? new Date(fechaCruda).toLocaleDateString("es-AR") : "Fecha no disponible";

  return (
    <>
      {/* FONDO OSCURO PARA EL MODAL (No se imprime) */}
      <div className="modal-backdrop fade show d-print-none" onClick={onClose} style={{ zIndex: 1040 }}></div>

      <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
        {/* d-print-none en los bordes del modal para que no afecten la impresión */}
        <div className="modal-dialog modal-lg modal-dialog-centered print-dialog-reset">
          <div className="modal-content shadow-lg border-0 bg-transparent print-content-reset">
            
            {/* CONTROLES DEL MODAL (No se imprimen) */}
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
              <div className="d-flex justify-content-between align-items-start border-bottom border-2 border-dark pb-3 mb-3">
                
                {/* Izquierda (Vendedor) */}
                <div style={{ width: "42%" }}>
                  <h4 className="fw-bold mb-3 text-uppercase">{config?.vendedor_nombre || "FotoTrack Studio"}</h4>
                  <div className="small lh-sm">
                    <p className="mb-1"><strong>Razón Social:</strong> {config?.vendedor_nombre || "No configurado"}</p>
                    <p className="mb-1"><strong>Domicilio Comercial:</strong> {config?.vendedor_direccion || "No configurado"}</p>
                    <p className="mb-1"><strong>Condición frente al IVA:</strong> Responsable Monotributo</p>
                    <p className="mb-0"><strong>Contacto:</strong> {config?.vendedor_email || ""} {config?.vendedor_telefono ? `| ${config?.vendedor_telefono}` : ''}</p>
                  </div>
                </div>

                {/* Centro (Letra) */}
                <div className="text-center" style={{ width: "16%" }}>
                  <div className="border border-2 border-dark fs-2 fw-bold mx-auto d-flex align-items-center justify-content-center" style={{ width: "50px", height: "50px" }}>
                    X
                  </div>
                  <div className="small fw-bold mt-1" style={{ fontSize: "0.65rem", lineHeight: "1.2" }}>
                    DOCUMENTO<br/>NO VÁLIDO<br/>COMO FACTURA
                  </div>
                </div>

                {/* Derecha (Datos del Documento) */}
                <div className="text-end" style={{ width: "42%" }}>
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
              <div className="row mb-4 border border-dark rounded p-2 mx-0 bg-light">
                <div className="col-7">
                  <div className="small text-truncate">
                    <strong>Nombre / Razón Social:</strong> {venta.nombreUsuario || "Consumidor Final"}
                  </div>
                  {/* 👈 NUEVO: Documento del cliente inyectado */}
                  <div className="small mt-1 text-truncate">
                    <strong>Documento:</strong> {venta.cuitCliente || "No especificado"}
                  </div>
                  <div className="small mt-1">
                    <strong>Condición frente al IVA:</strong> Consumidor Final
                  </div>
                </div>
                <div className="col-5 text-end">
                  <div className="small text-truncate">
                    <strong>Correo:</strong> {venta.correo || "-"}
                  </div>
                  <div className="small mt-1">
                    <strong>Ref. Pago:</strong> {venta.idTransaccionMP || "N/A"}
                  </div>
                </div>
              </div>

              {/* --- 3. GRILLA DE ÍTEMS --- */}
              <table className="table table-sm table-bordered border-dark align-middle mb-4">
                <thead className="table-light text-center small border-dark">
                  <tr>
                    <th style={{ width: "10%" }}>Cant.</th>
                    <th style={{ width: "60%", textAlign: "left" }}>Descripción</th>
                    <th style={{ width: "15%" }}>Precio Unit.</th>
                    <th style={{ width: "15%" }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody className="small border-dark">
                  <tr>
                    <td className="text-center">1</td>
                    <td>Adquisición de fotografías digitales (Ref. Compra #{venta.idCompra})</td>
                    {/* 👈 FIX: Casteo a Number para forzar el formato local */}
                    <td className="text-end">${Number(venta.total).toLocaleString('es-AR')}</td>
                    <td className="text-end fw-semibold">${Number(venta.total).toLocaleString('es-AR')}</td>
                  </tr>
                </tbody>
              </table>

              {/* --- 4. TOTALES --- */}
              <div className="row justify-content-end mt-4">
                <div className="col-6 col-md-5">
                  <div className="d-flex justify-content-between align-items-center border-top border-dark border-2 pt-2 fs-5">
                    <span className="fw-bold">Importe Total:</span>
                    {/* 👈 FIX: Casteo a Number para forzar el formato local */}
                    <span className="fw-bold">${Number(venta.total).toLocaleString('es-AR')}</span>
                  </div>
                </div>
              </div>

              {/* --- 5. FOOTER / LEGALES --- */}
              <div className="text-center text-muted mt-5 pt-3 border-top border-dark small" style={{ fontSize: "0.75rem" }}>
                Comprobante generado automáticamente por el sistema FotoTrack.<br/>
                Gracias por su compra. Las fotografías digitales no tienen cambio ni devolución.
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* 💅 CSS MÁGICO PARA IMPRESIÓN CORREGIDO */}
      <style>{`
        @media print {
          /* 1. Ocultamos la visibilidad de todo el sitio */
          body * { 
            visibility: hidden; 
          }
          
          /* 2. Hacemos visible SOLO nuestro recibo y su contenido */
          .print-container, .print-container * { 
            visibility: visible; 
          }
          
          /* 3. EVITAMOS HOJAS EXTRA: Matamos el scroll y la altura de la página de fondo */
          html, body {
            height: 100vh !important;
            overflow: hidden !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* 4. EVITAMOS EL DUPLICADO: Anulamos el position:fixed y el centrado de Bootstrap */
          .modal {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            min-height: 100% !important;
          }

          .modal-dialog {
            margin: 0 !important;
            max-width: 100% !important;
            transform: none !important;
            align-items: flex-start !important; /* Lo pega arriba, anulando el centrado vertical */
          }

          .modal-content {
            border: none !important;
            box-shadow: none !important;
            background: transparent !important;
          }

          /* 5. Posicionamos el recibo perfecto en la hoja */
          .print-container {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            border: none !important; /* Quitamos el borde gris para imprimir */
          }

          /* 6. Formato de la hoja física */
          @page {
            size: A4 portrait;
            margin: 1cm;
          }
        }
      `}</style>
    </>
  );
}