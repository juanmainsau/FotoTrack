import { purchaseRepository } from "../repositories/purchase.repository.js";
import archiver from "archiver";
import { db } from "../config/db.js";

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
      console.error("❌ Error en purchaseService.createPurchase:", err);

      if (connection) {
        await purchaseRepository.rollback(connection);
      }

      return { ok: false, error: err.message };
    }
  },

  async getMyPurchases(idUsuario) {
    // MEJORA: Cambiamos a LEFT JOIN en 'imagenes' por si en el futuro vendes algo que no sea una foto suelta (ej: un pase o álbum).
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
      LEFT JOIN imagenes i ON ic.idImagen = i.idImagen
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
        miniatura: row.rutaMiniatura || "https://via.placeholder.com/150?text=Sin+Imagen", // MEJORA: Fallback de seguridad visual
        precioUnitario: row.precioUnitario,
      });

      // Sumamos el total acumulando el precio de cada item
      comprasMap[row.idCompra].total += Number(row.precioUnitario);
    }

    return Object.values(comprasMap);
  },

  async generateZip(idCompra, idUsuario) {
    // 1. Verificar compra y propiedad
    const [compraRows] = await db.query(
      "SELECT * FROM compras WHERE idCompra = ? AND idUsuario = ?",
      [idCompra, idUsuario]
    );

    if (compraRows.length === 0) {
      throw new Error("Compra no encontrada o no tienes permisos para acceder a ella.");
    }

    // 2. Obtener imágenes originales
    const [items] = await db.query(
      `
      SELECT i.rutaOriginal AS urlOriginal, i.idImagen
      FROM items_compra ic
      JOIN imagenes i ON ic.idImagen = i.idImagen
      WHERE ic.idCompra = ? AND i.rutaOriginal IS NOT NULL
      `,
      [idCompra]
    );

    if (items.length === 0) {
      throw new Error("No hay imágenes válidas en esta compra.");
    }

    // 3. Inicializar Archiver
    const archive = archiver("zip", { zlib: { level: 9 } }); // Nivel de compresión máximo

    archive.on("error", (err) => {
      console.error("❌ Error interno del archiver:", err);
      throw err;
    });

    // 4. Descargar y adjuntar (Con manejo de errores individual)
    for (let i = 0; i < items.length; i++) {
      const { urlOriginal, idImagen } = items[i];

      try {
        const response = await fetch(urlOriginal);
        
        // MEJORA: Verificamos si la imagen real existe en el bucket/servidor antes de agregarla.
        if (!response.ok) {
          console.warn(`⚠️ Omitiendo imagen ${idImagen}: URL inaccesible (${response.status})`);
          continue; // Si falla una foto, no rompemos todo el ZIP, simplemente pasamos a la siguiente.
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        archive.append(buffer, {
          name: `FotoTrack_${idImagen}_${i + 1}.jpg`, // MEJORA: Nombres únicos y prolijos
        });
        
      } catch (fetchError) {
        console.error(`❌ Fallo al descargar la foto ID: ${idImagen}`, fetchError);
      }
    }

    // 5. Finalizar y retornar el stream
    archive.finalize(); 
    return archive; 
  }
};