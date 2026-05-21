import { db } from "../config/db.js";

export const reportController = {
  async getExecutiveReport(req, res) {
    try {
      const { desde, hasta, buscador, tipo } = req.query;
      let query = "";
      let params = [];

      if (tipo === "ventas") {
        // REPORTE DE VENTAS DETALLADO
        query = `
          SELECT 
            c.fecha, 
            u.nombre as cliente, 
            u.correo,
            COUNT(ic.idItemCompra) as cantidad_fotos,
            SUM(ic.precioUnitario * ic.cantidad) as total
          FROM compras c
          JOIN usuarios u ON c.idUsuario = u.idUsuario
          JOIN items_compra ic ON c.idCompra = ic.idCompra
          WHERE c.estadoPago = 'approved'
        `;
        
        if (desde && hasta) {
          query += " AND DATE(c.fecha) BETWEEN ? AND ?";
          params.push(desde, hasta);
        }

        if (buscador) {
          query += " AND (u.nombre LIKE ? OR u.correo LIKE ?)";
          params.push(`%${buscador}%`, `%${buscador}%`);
        }

        query += " GROUP BY c.idCompra, c.fecha, u.nombre, u.correo ORDER BY c.fecha DESC";

      } else {
        // REPORTE DE ACTIVIDAD (AUDITORÍA)
        query = `
          SELECT 
            a.fechaHora as fecha, 
            u.nombre as usuario, 
            acc.nombre as accion, 
            acc.modulo as modulo
          FROM auditoria a
          JOIN usuarios u ON a.idUsuarioResponsable = u.idUsuario
          JOIN acciones_auditoria acc ON a.idAccion = acc.idAccion
          WHERE 1=1
        `;
        
        if (desde && hasta) {
          query += " AND DATE(a.fechaHora) BETWEEN ? AND ?";
          params.push(desde, hasta);
        }

        if (buscador) {
          query += " AND (u.nombre LIKE ? OR u.correo LIKE ?)";
          params.push(`%${buscador}%`, `%${buscador}%`);
        }

        query += " ORDER BY a.fechaHora DESC LIMIT 200";
      }

      console.log("📊 Ejecutando Query de Reporte Parametrizado:", { tipo, buscador, desde, hasta });
      
      const [rows] = await db.query(query, params);
      
      res.json({ 
        ok: true, 
        data: rows 
      });

    } catch (error) {
      console.error("❌ Error detallado en reporte:", error);
      res.status(500).json({ 
        ok: false, 
        error: "Error al consultar la base de datos",
        details: error.message 
      });
    }
  }
};