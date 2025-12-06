// src/repositories/purchase.repository.js
import { db } from "../config/db.js";

export const purchaseRepository = {
  /**
   * Inicia una transacción
   */
  async beginTransaction() {
    const connection = await db.getConnection();
    await connection.beginTransaction();
    return connection;
  },

  /**
   * Guarda la compra en la tabla compras
   */
  async createPurchase(connection, { idUsuario, idMetodoPago, estadoPago }) {
    const [result] = await connection.execute(
      `INSERT INTO compras (idUsuario, idMetodoPago, estadoPago)
       VALUES (?, ?, ?)`,
      [idUsuario, idMetodoPago, estadoPago]
    );

    return result.insertId;
  },

  /**
   * Obtiene los ítems del carrito del usuario
   */
  async getCartItems(idCarrito) {
    const [rows] = await db.execute(
      `SELECT *
       FROM items_carrito
       WHERE idCarrito = ?`,
      [idCarrito]
    );
    return rows;
  },

  /**
   * Inserta un ítem comprado en items_compra
   */
  async insertItem(connection, item) {
    const {
      idCompra,
      tipoProducto,
      idImagen,
      idAlbum,
      cantidad,
      precioUnitario,
    } = item;

    await connection.execute(
      `INSERT INTO items_compra
        (idCompra, tipoProducto, idImagen, idAlbum, cantidad, precioUnitario)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [idCompra, tipoProducto, idImagen, idAlbum, cantidad, precioUnitario]
    );
  },

  /**
   * Vacía el carrito después de completar la compra
   */
  async clearCart(connection, idCarrito) {
    await connection.execute(
      `DELETE FROM items_carrito WHERE idCarrito = ?`,
      [idCarrito]
    );
  },

  /**
   * Confirma la transacción
   */
  async commit(connection) {
    await connection.commit();
    connection.release();
  },

  /**
   * Revierte la transacción en caso de error
   */
  async rollback(connection) {
    await connection.rollback();
    connection.release();
  },

  // Obtener compras del usuario con sus ítems
  async getUserPurchases(idUsuario) {
    const [rows] = await db.query(
      `
      SELECT 
        c.idCompra,
        c.fecha AS fechaCompra,
        c.estadoPago,
        ic.idItemCompra,
        ic.tipoProducto,
        ic.idImagen,
        ic.idAlbum,
        ic.precioUnitario,
        img.rutaMiniatura
      FROM compras c
      INNER JOIN items_compra ic ON ic.idCompra = c.idCompra
      LEFT JOIN imagenes img ON img.idImagen = ic.idImagen
      WHERE c.idUsuario = ?
      ORDER BY c.fecha DESC
      `,
      [idUsuario]
    );

    return rows;
  }
};
