// apps/api/src/repositories/cart.repository.js
import { db } from "../config/db.js";

export const cartRepository = {
  async findActiveCartByUser(idUsuario) {
    const [rows] = await db.query(
      `
      SELECT
        c.idCarrito,
        c.idUsuario,
        c.fechaCreacion,
        er.nombre AS estado
      FROM carritos c
      INNER JOIN estados_registro er
        ON er.idEstadoRegistro = c.idEstadoRegistro
      WHERE c.idUsuario = ?
        AND c.deleted_at IS NULL
        AND er.nombre = 'activo'
      LIMIT 1
      `,
      [idUsuario]
    );

    return rows[0] || null;
  },

  async createCartForUser(idUsuario) {
    const [result] = await db.query(
      `
      INSERT INTO carritos (
        idUsuario,
        fechaCreacion,
        idEstadoRegistro
      )
      VALUES (
        ?,
        NOW(),
        (SELECT idEstadoRegistro FROM estados_registro WHERE nombre = 'activo' LIMIT 1)
      )
      `,
      [idUsuario]
    );

    return {
      idCarrito: result.insertId,
      idUsuario,
      estado: "activo",
    };
  },

  async getCartWithItemsByUser(idUsuario) {
    const carrito = await this.findActiveCartByUser(idUsuario);

    if (!carrito) {
      return { carrito: null, items: [] };
    }

    const [items] = await db.query(
      `
      SELECT
        ic.idItem,
        ic.idTipoProducto AS tipoProducto,
        tp.codigo AS codigoProducto,
        tp.nombre AS nombreProducto,
        ic.idImagen,
        ic.idAlbum,
        ic.cantidad,
        ic.precioUnitario,
        ic.subtotal,
        ic.fechaAgregado,

        img.rutaMiniatura,
        img.rutaOptimizado,
        img.rutaOriginal,

        COALESCE(alb_img.nombreEvento, alb_direct.nombreEvento) AS nombreAlbum,
        COALESCE(alb_img.idAlbum, alb_direct.idAlbum) AS albumOrigen,

        er.nombre AS estado
      FROM items_carrito ic

      INNER JOIN tipos_producto tp
        ON tp.idTipoProducto = ic.idTipoProducto

      INNER JOIN estados_registro er
        ON er.idEstadoRegistro = ic.idEstadoRegistro

      LEFT JOIN imagenes img
        ON img.idImagen = ic.idImagen
       AND img.deleted_at IS NULL

      LEFT JOIN album alb_img
        ON alb_img.idAlbum = img.idAlbum
       AND alb_img.deleted_at IS NULL

      LEFT JOIN album alb_direct
        ON alb_direct.idAlbum = ic.idAlbum
       AND alb_direct.deleted_at IS NULL

      WHERE ic.idCarrito = ?
        AND ic.deleted_at IS NULL
        AND er.nombre = 'activo'

      ORDER BY ic.idItem DESC
      `,
      [carrito.idCarrito]
    );

    return { carrito, items };
  },

  async findItemByCartAndImage(idCarrito, idImagen) {
    const [rows] = await db.query(
      `
      SELECT
        ic.*
      FROM items_carrito ic
      INNER JOIN tipos_producto tp
        ON tp.idTipoProducto = ic.idTipoProducto
      INNER JOIN estados_registro er
        ON er.idEstadoRegistro = ic.idEstadoRegistro
      WHERE ic.idCarrito = ?
        AND ic.idImagen = ?
        AND tp.codigo = 'FOTO'
        AND ic.deleted_at IS NULL
        AND er.nombre = 'activo'
      LIMIT 1
      `,
      [idCarrito, idImagen]
    );

    return rows[0] || null;
  },

  async addImageItem({ idCarrito, idImagen, precioUnitario = null }) {
    const [result] = await db.query(
      `
      INSERT INTO items_carrito (
        idCarrito,
        idTipoProducto,
        idImagen,
        idAlbum,
        cantidad,
        precioUnitario,
        fechaAgregado,
        idEstadoRegistro
      )
      VALUES (
        ?,
        (SELECT idTipoProducto FROM tipos_producto WHERE codigo = 'FOTO' LIMIT 1),
        ?,
        NULL,
        1,
        ?,
        NOW(),
        (SELECT idEstadoRegistro FROM estados_registro WHERE nombre = 'activo' LIMIT 1)
      )
      `,
      [idCarrito, idImagen, precioUnitario]
    );

    return { idItem: result.insertId };
  },

  async deleteItemForUser(idUsuario, idItem) {
    const [rows] = await db.query(
      `
      SELECT ic.idItem
      FROM items_carrito ic
      INNER JOIN carritos c
        ON c.idCarrito = ic.idCarrito
      INNER JOIN estados_registro erc
        ON erc.idEstadoRegistro = c.idEstadoRegistro
      WHERE ic.idItem = ?
        AND c.idUsuario = ?
        AND c.deleted_at IS NULL
        AND ic.deleted_at IS NULL
        AND erc.nombre = 'activo'
      LIMIT 1
      `,
      [idItem, idUsuario]
    );

    if (rows.length === 0) return false;

    await db.query(
      `
      UPDATE items_carrito
      SET
        idEstadoRegistro = (
          SELECT idEstadoRegistro
          FROM estados_registro
          WHERE nombre = 'eliminado'
          LIMIT 1
        ),
        deleted_at = NOW(),
        deleted_by = ?
      WHERE idItem = ?
        AND deleted_at IS NULL
      `,
      [idUsuario, idItem]
    );

    return true;
  },

  async clearCartByUser(idUsuario) {
    const carrito = await this.findActiveCartByUser(idUsuario);

    if (!carrito) return;

    await db.query(
      `
      UPDATE items_carrito
      SET
        idEstadoRegistro = (
          SELECT idEstadoRegistro
          FROM estados_registro
          WHERE nombre = 'eliminado'
          LIMIT 1
        ),
        deleted_at = NOW(),
        deleted_by = ?
      WHERE idCarrito = ?
        AND deleted_at IS NULL
      `,
      [idUsuario, carrito.idCarrito]
    );
  },

  async getPriceForImage(idImagen) {
    const [rows] = await db.query(
      `
      SELECT
        COALESCE(
          a.precioFoto,
          CAST(ps.valor AS DECIMAL(10,2)),
          tp.precioBase,
          0
        ) AS precioFoto
      FROM imagenes i
      INNER JOIN album a
        ON a.idAlbum = i.idAlbum
      INNER JOIN tipos_producto tp
        ON tp.codigo = 'FOTO'
      LEFT JOIN parametros_sistema ps
        ON ps.clave = 'precio_foto_default'
      WHERE i.idImagen = ?
        AND i.deleted_at IS NULL
        AND a.deleted_at IS NULL
      LIMIT 1
      `,
      [idImagen]
    );

    return Number(rows[0]?.precioFoto || 0);
  },
};