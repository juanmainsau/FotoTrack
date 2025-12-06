// apps/api/src/repositories/cart.repository.js
import { db } from "../config/db.js";

export const cartRepository = {
  // Buscar carrito activo del usuario
  async findActiveCartByUser(idUsuario) {
    const [rows] = await db.query(
      `
      SELECT *
      FROM carritos
      WHERE idUsuario = ?
        AND estado = 'activo'
      LIMIT 1
      `,
      [idUsuario]
    );
    return rows[0] || null;
  },

  // Crear carrito nuevo
  async createCartForUser(idUsuario) {
    const [result] = await db.query(
      `
      INSERT INTO carritos (idUsuario, estado, fechaCreacion)
      VALUES (?, 'activo', NOW())
      `,
      [idUsuario]
    );
    return {
      idCarrito: result.insertId,
      idUsuario,
      estado: "activo",
    };
  },

  // Obtener carrito + items + datos útiles para UI
  async getCartWithItemsByUser(idUsuario) {
    const [carritos] = await db.query(
      `
      SELECT *
      FROM carritos
      WHERE idUsuario = ?
        AND estado = 'activo'
      LIMIT 1
      `,
      [idUsuario]
    );

    const carrito = carritos[0];
    if (!carrito) return { carrito: null, items: [] };

    const [items] = await db.query(
      `
      SELECT
        ic.idItem,
        ic.tipoProducto,
        ic.idImagen,
        ic.idAlbum,
        ic.cantidad,
        ic.precioUnitario,
        img.rutaMiniatura,
        img.rutaOptimizado,
        alb.nombreEvento AS nombreAlbum
      FROM items_carrito ic
      LEFT JOIN imagenes img ON img.idImagen = ic.idImagen
      LEFT JOIN album alb ON alb.idAlbum = img.idAlbum
      WHERE ic.idCarrito = ?
      ORDER BY ic.idItem DESC
      `,
      [carrito.idCarrito]
    );

    return { carrito, items };
  },

  // Ver si la imagen ya está en el carrito (para evitar duplicado)
  async findItemByCartAndImage(idCarrito, idImagen) {
    const [rows] = await db.query(
      `
      SELECT *
      FROM items_carrito
      WHERE idCarrito = ?
        AND idImagen = ?
        AND tipoProducto = 1
      LIMIT 1
      `,
      [idCarrito, idImagen]
    );
    return rows[0] || null;
  },

  // Insertar ítem foto (tipoProducto = 1)
  async addImageItem({ idCarrito, idImagen, precioUnitario }) {
    const [result] = await db.query(
      `
      INSERT INTO items_carrito
      (idCarrito, tipoProducto, idImagen, idAlbum, cantidad, precioUnitario, fechaAgregado)
      VALUES (?, 1, ?, NULL, 1, ?, NOW())
      `,
      [idCarrito, idImagen, precioUnitario]
    );

    return { idItem: result.insertId };
  },

  // Eliminar ítem del carrito validando que sea del usuario
  async deleteItemForUser(idUsuario, idItem) {
    // Validamos que el item pertenece al carrito del usuario
    const [rows] = await db.query(
      `
      SELECT ic.idItem
      FROM items_carrito ic
      JOIN carritos c ON c.idCarrito = ic.idCarrito
      WHERE ic.idItem = ?
        AND c.idUsuario = ?
        AND c.estado = 'activo'
      LIMIT 1
      `,
      [idItem, idUsuario]
    );

    if (rows.length === 0) return false;

    await db.query(
      `DELETE FROM items_carrito WHERE idItem = ?`,
      [idItem]
    );

    return true;
  },

  // Vaciar carrito del usuario
  async clearCartByUser(idUsuario) {
    const [carritos] = await db.query(
      `
      SELECT idCarrito
      FROM carritos
      WHERE idUsuario = ?
        AND estado = 'activo'
      LIMIT 1
      `,
      [idUsuario]
    );

    const carrito = carritos[0];
    if (!carrito) return;

    await db.query(
      `DELETE FROM items_carrito WHERE idCarrito = ?`,
      [carrito.idCarrito]
    );
  },

  // Obtener precio por imagen
  async getPriceForImage(idImagen) {
    const [rows] = await db.query(
      `
      SELECT a.precioFoto
      FROM imagenes i
      JOIN album a ON a.idAlbum = i.idAlbum
      WHERE i.idImagen = ?
      LIMIT 1
      `,
      [idImagen]
    );

    return rows[0]?.precioFoto || 0;
  },
};
