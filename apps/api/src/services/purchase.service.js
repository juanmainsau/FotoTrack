import { purchaseRepository } from "../repositories/purchase.repository.js";
import archiver from "archiver";
import { db } from "../config/db.js"; // CORRECTO

export const purchaseService = {
  
  async createPurchase({ idUsuario, idCarrito, idMetodoPago }) {
    let connection;

    try {
      connection = await purchaseRepository.beginTransaction();

      const idCompra = await purchaseRepository.createPurchase(connection, {
        idUsuario,
        idMetodoPago,
        estadoPago: "pendiente",
      });

      const cartItems = await purchaseRepository.getCartItems(idCarrito);

      if (cartItems.length === 0) {
        throw new Error("El carrito está vacío.");
      }

      for (const item of cartItems) {
        await purchaseRepository.insertItem(connection, {
          idCompra,
          tipoProducto: item.tipoProducto,
          idImagen: item.idImagen || null,
          idAlbum: item.idAlbum || null,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario,
        });
      }

      await purchaseRepository.clearCart(connection, idCarrito);

      await purchaseRepository.commit(connection);

      return { ok: true, idCompra };

    } catch (err) {
      console.error("Error en purchaseService.createPurchase:", err);

      if (connection) {
        await purchaseRepository.rollback(connection);
      }

      return { ok: false, error: err.message };
    }
  },

  async getMyPurchases(idUsuario) {
    const [rows] = await db.query(
      `
      SELECT 
        c.idCompra,
        c.fecha AS fechaCompra,
        c.estadoPago,
        ic.idItemCompra,
        ic.tipoProducto,
        ic.idImagen,
        ic.precioUnitario,
        i.rutaMiniatura
      FROM compras c
      JOIN items_compra ic ON c.idCompra = ic.idCompra
      JOIN imagenes i ON ic.idImagen = i.idImagen
      WHERE c.idUsuario = ?
      ORDER BY c.fecha DESC
      `,
      [idUsuario]
    );

    const comprasMap = {};

    for (const row of rows) {
      if (!comprasMap[row.idCompra]) {
        comprasMap[row.idCompra] = {
          idCompra: row.idCompra,
          fechaCompra: row.fechaCompra,
          estadoPago: row.estadoPago,
          total: 0,
          items: [],
        };
      }

      comprasMap[row.idCompra].items.push({
        idItemCompra: row.idItemCompra,
        tipoProducto: row.tipoProducto,
        idImagen: row.idImagen,
        miniatura: row.rutaMiniatura,
        precioUnitario: row.precioUnitario,
      });

      comprasMap[row.idCompra].total += Number(row.precioUnitario);
    }

    return Object.values(comprasMap);
  },

  async generateZip(idCompra, idUsuario) {
    // Verificar compra
    const [compraRows] = await db.query(
      "SELECT * FROM compras WHERE idCompra = ? AND idUsuario = ?",
      [idCompra, idUsuario]
    );

    if (compraRows.length === 0) {
      throw new Error("Compra no encontrada o no pertenece al usuario.");
    }

    // Obtener imágenes originales
    const [items] = await db.query(
      `
      SELECT i.rutaOriginal AS urlOriginal
      FROM items_compra ic
      JOIN imagenes i ON ic.idImagen = i.idImagen
      WHERE ic.idCompra = ?
      `,
      [idCompra]
    );

    if (items.length === 0) {
      throw new Error("No hay imágenes en esta compra.");
    }

    // Crear ZIP
    const archive = archiver("zip", { zlib: { level: 9 } });

    archive.on("error", (err) => {
      throw err;
    });

    // Descargar imágenes y agregarlas al ZIP
    for (let i = 0; i < items.length; i++) {
      const { urlOriginal } = items[i];

      const response = await fetch(urlOriginal);
      const buffer = Buffer.from(await response.arrayBuffer());

      archive.append(buffer, {
        name: `foto_${i + 1}.jpg`,
      });
    }

    archive.finalize(); // <-- NECESARIO
    return archive;     // <-- DEVOLVER ZIP STREAM
  }

};
