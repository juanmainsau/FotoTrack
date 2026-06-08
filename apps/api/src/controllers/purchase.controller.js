// src/controllers/purchase.controller.js
import { purchaseService } from "../services/purchase.service.js";
import { userRepository } from "../repositories/user.repository.js";
import jwt from "jsonwebtoken";
import { db } from "../config/db.js";

export const purchaseController = {
  async getAllAdmin(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        estado = "",
        cliente = "",
        fechaDesde = "",
        fechaHasta = "",
        sort = "DESC",
      } = req.query;

      const offset = (Number(page) - 1) * Number(limit);
      const limitNumber = Number(limit);
      const orderDir = sort.toUpperCase() === "ASC" ? "ASC" : "DESC";

      const fromTables = `
        FROM compras c

        INNER JOIN usuarios u
          ON c.idUsuario = u.idUsuario

        LEFT JOIN items_compra ic
          ON c.idCompra = ic.idCompra
         AND ic.deleted_at IS NULL

        LEFT JOIN estados_pago ep
          ON ep.idEstadoPago = c.idEstadoPago

        LEFT JOIN estados_registro er
          ON er.idEstadoRegistro = c.idEstadoRegistro
      `;

      let whereClause = `
        WHERE c.deleted_at IS NULL
      `;

      const queryParams = [];

      if (estado) {
        whereClause += `
          AND (
            ep.nombre = ?
            OR er.nombre = ?
          )
        `;
        queryParams.push(estado, estado);
      }

      if (cliente) {
        whereClause += `
          AND (
            u.nombre LIKE ?
            OR u.correo LIKE ?
          )
        `;
        queryParams.push(`%${cliente}%`, `%${cliente}%`);
      }

      if (fechaDesde) {
        whereClause += `
          AND DATE(c.fecha) >= ?
        `;
        queryParams.push(fechaDesde);
      }

      if (fechaHasta) {
        whereClause += `
          AND DATE(c.fecha) <= ?
        `;
        queryParams.push(fechaHasta);
      }

      const countQuery = `
        SELECT COUNT(DISTINCT c.idCompra) AS total
        ${fromTables}
        ${whereClause}
      `;

      const [countResult] = await db.query(countQuery, queryParams);
      const totalRegistros = countResult[0]?.total || 0;

      const incomeQuery = `
        SELECT
          COALESCE(SUM(ic.subtotal), 0) AS ingresosGlobales
        ${fromTables}
        ${whereClause}
      `;

      const [incomeResult] = await db.query(incomeQuery, queryParams);
      const ingresosGlobales = incomeResult[0]?.ingresosGlobales || 0;

      const dataQuery = `
        SELECT
          c.idCompra,
          c.fecha AS fechaCompra,
          c.total,

          ep.nombre AS estadoPago,
          er.nombre AS estadoRegistro,

          c.idTransaccionMP,

          u.nombre AS nombreUsuario,
          u.correo,

          COALESCE(SUM(ic.subtotal), c.total, 0) AS totalCalculado

        ${fromTables}

        ${whereClause}

        GROUP BY
          c.idCompra,
          c.fecha,
          c.total,
          ep.nombre,
          er.nombre,
          c.idTransaccionMP,
          u.nombre,
          u.correo

        ORDER BY c.fecha ${orderDir}

        LIMIT ?
        OFFSET ?
      `;

      const [ventas] = await db.query(dataQuery, [
        ...queryParams,
        limitNumber,
        offset,
      ]);

      const ventasNormalizadas = ventas.map((venta) => ({
        ...venta,
        total: Number(venta.totalCalculado || venta.total || 0),
        estado: venta.estadoPago || venta.estadoRegistro,
      }));

      return res.json({
        ok: true,
        ventas: ventasNormalizadas,
        ingresosGlobales,
        paginacion: {
          total: totalRegistros,
          paginas: Math.ceil(totalRegistros / limitNumber),
          paginaActual: Number(page),
          limite: limitNumber,
        },
      });
    } catch (err) {
      console.error("❌ Error en purchaseController.getAllAdmin:", err);

      return res.status(500).json({
        ok: false,
        error: "Error interno del servidor",
      });
    }
  },

  async create(req, res) {
    try {
      const idUsuario = req.user.idUsuario || req.user.id;

      if (!idUsuario) {
        return res.status(401).json({
          ok: false,
          error: "Usuario no autenticado",
        });
      }

      const user = await userRepository.findById(idUsuario);

      if (!user) {
        return res.status(404).json({
          ok: false,
          error: "Usuario no encontrado.",
        });
      }

      if (!user.idCarrito) {
        return res.status(400).json({
          ok: false,
          error: "El usuario no posee carrito asignado.",
        });
      }

      const { idMetodoPago = 1 } = req.body;

      const result = await purchaseService.createPurchase({
        idUsuario,
        idCarrito: Number(user.idCarrito),
        idMetodoPago,
      });

      if (!result.ok) {
        return res.status(400).json({
          ok: false,
          error: result.error,
        });
      }

      return res.json({
        ok: true,
        idCompra: result.idCompra,
      });
    } catch (err) {
      console.error("❌ Error en purchaseController.create:", err);

      return res.status(500).json({
        ok: false,
        error: "Error interno al procesar la compra",
      });
    }
  },

  async getMyPurchases(req, res) {
    try {
      const idUsuario = req.user.idUsuario || req.user.id;

      const compras = await purchaseService.getMyPurchases(idUsuario);

      return res.json({
        ok: true,
        compras,
      });
    } catch (err) {
      console.error("❌ Error en getMyPurchases:", err);

      return res.status(500).json({
        ok: false,
        error: "No se pudieron obtener las compras",
      });
    }
  },

  async download(req, res) {
    try {
      const idUsuario = req.user.idUsuario || req.user.id;
      const { idCompra } = req.params;

      const zipStream = await purchaseService.generateZip(idCompra, idUsuario);

      res.setHeader("Content-Type", "application/zip");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=FotoTrack_Compra_${idCompra}.zip`
      );

      zipStream.pipe(res);
    } catch (err) {
      console.error("❌ Error en purchaseController.download:", err);

      return res.status(500).json({
        ok: false,
        error: "No se pudo generar el archivo ZIP",
      });
    }
  },

  async downloadPurchaseZipPublic(req, res) {
    try {
      const { id } = req.params;
      const idTransaccionMP = id;
      const { token } = req.query;

      if (!token) {
        return res.status(403).send("<h1>Enlace inválido</h1>");
      }

      let decoded;

      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch {
        return res.status(403).send("<h1>Token inválido o expirado</h1>");
      }

      if (String(decoded.compraId) !== String(idTransaccionMP)) {
        return res.status(403).send("<h1>Acceso denegado</h1>");
      }

      const [compraRows] = await db.query(
        `
        SELECT
          idCompra,
          idUsuario
        FROM compras
        WHERE idTransaccionMP = ?
          AND deleted_at IS NULL
        LIMIT 1
        `,
        [idTransaccionMP]
      );

      if (compraRows.length === 0) {
        return res.status(404).send("<h1>Compra no encontrada</h1>");
      }

      const { idCompra, idUsuario } = compraRows[0];

      const zipStream = await purchaseService.generateZip(idCompra, idUsuario);

      res.setHeader("Content-Type", "application/zip");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=FotoTrack_Pedido_${idTransaccionMP}.zip`
      );

      zipStream.pipe(res);
    } catch (err) {
      console.error("❌ Error descarga pública:", err);

      return res.status(500).send("<h1>Error interno</h1>");
    }
  },
};