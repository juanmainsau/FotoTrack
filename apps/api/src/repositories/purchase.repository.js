// src/repositories/purchase.repository.js
import { db } from "../config/db.js";

export const purchaseRepository = {
  async beginTransaction() {
    const connection = await db.getConnection();
    await connection.beginTransaction();
    return connection;
  },

  async createPurchase(connection, { idUsuario, idMetodoPago, idTransaccionMP = null }) {
    const [result] = await connection.execute(
      `
      INSERT INTO compras (
        idUsuario,
        idMetodoPago,
        idEstadoPago,
        idEstadoRegistro,
        idTransaccionMP,
        total
      )
      VALUES (
        ?,
        ?,
        COALESCE(
          (
            SELECT idEstadoPago
            FROM estados_pago
            WHERE nombre IN ('approved', 'aprobado', 'pagado', 'pagada')
            LIMIT 1
          ),
          1
        ),
        (
          SELECT idEstadoRegistro
          FROM estados_registro
          WHERE nombre = 'activo'
          LIMIT 1
        ),
        ?,
        0
      )
      `,
      [idUsuario, idMetodoPago, idTransaccionMP]
    );

    return result.insertId;
  },

  async getCartItems(idCarrito) {
    const [rows] = await db.execute(
      `
      SELECT *
      FROM items_carrito
      WHERE idCarrito = ?
        AND deleted_at IS NULL
      `,
      [idCarrito]
    );

    return rows;
  },

  async insertItem(connection, item) {
    const {
      idCompra,
      idTipoProducto,
      idImagen,
      idAlbum,
      cantidad,
      precioUnitario,
    } = item;

    await connection.execute(
      `
      INSERT INTO items_compra (
        idCompra,
        idTipoProducto,
        idImagen,
        idAlbum,
        cantidad,
        precioUnitario,
        idEstadoRegistro
      )
      VALUES (
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        (
          SELECT idEstadoRegistro
          FROM estados_registro
          WHERE nombre = 'activo'
          LIMIT 1
        )
      )
      `,
      [
        idCompra,
        idTipoProducto,
        idImagen,
        idAlbum,
        cantidad,
        precioUnitario,
      ]
    );

    await connection.execute(
      `
      UPDATE compras
      SET total = (
        SELECT COALESCE(SUM(ic.subtotal), 0)
        FROM items_compra ic
        WHERE ic.idCompra = ?
          AND ic.deleted_at IS NULL
      )
      WHERE idCompra = ?
      `,
      [idCompra, idCompra]
    );
  },

  async clearCart(connection, idCarrito, deletedBy = null) {
    await connection.execute(
      `
      UPDATE items_carrito
      SET
        deleted_at = NOW(),
        deleted_by = ?,
        idEstadoRegistro = (
          SELECT idEstadoRegistro
          FROM estados_registro
          WHERE nombre = 'eliminado'
          LIMIT 1
        )
      WHERE idCarrito = ?
        AND deleted_at IS NULL
      `,
      [deletedBy, idCarrito]
    );
  },

  async commit(connection) {
    await connection.commit();
    connection.release();
  },

  async rollback(connection) {
    await connection.rollback();
    connection.release();
  },

  async getUserPurchases(idUsuario) {
    const [rows] = await db.query(
      `
      SELECT
        c.idCompra,
        c.fecha AS fechaCompra,
        c.total,

        mp.nombre AS metodoPago,

        ep.nombre AS estadoPago,
        er.nombre AS estadoRegistro,
        er.nombre AS estado,

        ic.idItemCompra,
        ic.idTipoProducto,

        tp.nombre AS nombreProducto,

        ic.idImagen,
        ic.idAlbum,

        ic.cantidad,
        ic.precioUnitario,
        ic.subtotal,

        img.rutaMiniatura,
        img.rutaOptimizado,
        img.rutaOriginal

      FROM compras c

      INNER JOIN items_compra ic
        ON c.idCompra = ic.idCompra
       AND ic.deleted_at IS NULL

      LEFT JOIN tipos_producto tp
        ON tp.idTipoProducto = ic.idTipoProducto

      LEFT JOIN metodos_pago mp
        ON mp.idMetodoPago = c.idMetodoPago

      LEFT JOIN estados_pago ep
        ON ep.idEstadoPago = c.idEstadoPago

      LEFT JOIN estados_registro er
        ON er.idEstadoRegistro = c.idEstadoRegistro

      LEFT JOIN imagenes img
        ON img.idImagen = ic.idImagen
       AND img.deleted_at IS NULL

      WHERE c.idUsuario = ?
        AND c.deleted_at IS NULL

      ORDER BY c.fecha DESC
      `,
      [idUsuario]
    );

    return rows;
  },
};