// src/controllers/report.controller.js
import { db } from "../config/db.js";

export const reportController = {
  async getExecutiveReport(req, res) {
    try {
      const [ingresosRows] = await db.query(`
        SELECT
          COALESCE(SUM(total), 0) AS ingresosTotales
        FROM compras
        WHERE deleted_at IS NULL
      `);

      const [ventasRows] = await db.query(`
        SELECT
          COUNT(*) AS ventasRealizadas
        FROM compras
        WHERE deleted_at IS NULL
      `);

      const [usuariosRows] = await db.query(`
        SELECT
          COUNT(*) AS usuariosActivos
        FROM usuarios
        WHERE deleted_at IS NULL
      `);

      return res.json({
        ok: true,
        ingresosTotales:
          Number(ingresosRows[0]?.ingresosTotales || 0),

        ventasRealizadas:
          Number(ventasRows[0]?.ventasRealizadas || 0),

        usuariosActivos:
          Number(usuariosRows[0]?.usuariosActivos || 0),
      });
    } catch (error) {
      console.error(
        "❌ Error obteniendo métricas ejecutivas:",
        error
      );

      return res.status(500).json({
        ok: false,
        error: "Error al obtener métricas",
      });
    }
  },

  async getReport(req, res) {
    try {
      const { desde, hasta, buscador, tipo } = req.query;

      let query = "";
      const params = [];

      if (tipo === "ventas") {
        query = `
          SELECT
            c.idCompra,
            c.fechaCompra AS fecha,
            u.nombre AS cliente,
            u.correo,
            er.nombre AS estado,
            COUNT(ic.idItemCompra) AS cantidad_fotos,
            COALESCE(SUM(ic.subtotal), 0) AS total

          FROM compras c

          INNER JOIN usuarios u
            ON c.idUsuario = u.idUsuario

          INNER JOIN estados_registro er
            ON er.idEstadoRegistro = c.idEstadoRegistro

          LEFT JOIN items_compra ic
            ON c.idCompra = ic.idCompra
           AND ic.deleted_at IS NULL

          WHERE c.deleted_at IS NULL
            AND er.nombre = 'activo'
        `;

        if (desde && hasta) {
          query += `
            AND DATE(c.fechaCompra) BETWEEN ? AND ?
          `;
          params.push(desde, hasta);
        }

        if (buscador) {
          query += `
            AND (
              u.nombre LIKE ?
              OR u.correo LIKE ?
            )
          `;
          params.push(
            `%${buscador}%`,
            `%${buscador}%`
          );
        }

        query += `
          GROUP BY
            c.idCompra,
            c.fechaCompra,
            u.nombre,
            u.correo,
            er.nombre

          ORDER BY c.fechaCompra DESC
        `;
      } else {
        query = `
          SELECT
            a.fechaHora AS fecha,
            COALESCE(u.correo, 'Sistema') AS usuario,
            acc.nombre AS accion,
            acc.modulo AS modulo,
            a.detalle

          FROM auditoria a

          LEFT JOIN usuarios u
            ON a.idUsuarioResponsable = u.idUsuario

          LEFT JOIN acciones_auditoria acc
            ON a.idAccion = acc.idAccion

          WHERE 1 = 1
        `;

        if (desde && hasta) {
          query += `
            AND DATE(a.fechaHora) BETWEEN ? AND ?
          `;
          params.push(desde, hasta);
        }

        if (buscador) {
          query += `
            AND (
              u.nombre LIKE ?
              OR u.correo LIKE ?
            )
          `;
          params.push(
            `%${buscador}%`,
            `%${buscador}%`
          );
        }

        query += `
          ORDER BY a.fechaHora DESC
          LIMIT 200
        `;
      }

      const [rows] = await db.query(
        query,
        params
      );

      return res.json({
        ok: true,
        data: rows,
      });
    } catch (error) {
      console.error(
        "❌ Error obteniendo reporte:",
        error
      );

      return res.status(500).json({
        ok: false,
        error: "Error al consultar la base de datos",
      });
    }
  },
};