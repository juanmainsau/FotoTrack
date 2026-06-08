// src/services/purchase.service.js
import { purchaseRepository } from "../repositories/purchase.repository.js";
import archiver from "archiver";
import { db } from "../config/db.js";

export const purchaseService = {
  async createPurchase({
    idUsuario,
    idCarrito,
    idMetodoPago,
    idTransaccionMP = null,
  }) {
    let connection;

    try {
      connection = await purchaseRepository.beginTransaction();

      const idCompra = await purchaseRepository.createPurchase(
        connection,
        {
          idUsuario,
          idMetodoPago,
          idTransaccionMP,
        }
      );

      const cartItems =
        await purchaseRepository.getCartItems(idCarrito);

      if (!cartItems.length) {
        throw new Error("El carrito está vacío.");
      }

      for (const item of cartItems) {
        await purchaseRepository.insertItem(
          connection,
          {
            idCompra,

            idTipoProducto:
              item.idTipoProducto,

            idImagen:
              item.idImagen || null,

            idAlbum:
              item.idAlbum || null,

            cantidad:
              item.cantidad,

            precioUnitario:
              item.precioUnitario,

            subtotal:
              item.subtotal ??
              item.precioUnitario *
                item.cantidad,
          }
        );
      }

      await purchaseRepository.clearCart(
        connection,
        idCarrito,
        idUsuario
      );

      await purchaseRepository.commit(
        connection
      );

      return {
        ok: true,
        idCompra,
      };
    } catch (err) {
      console.error(
        "❌ Error en purchaseService.createPurchase:",
        err
      );

      if (connection) {
        await purchaseRepository.rollback(
          connection
        );
      }

      return {
        ok: false,
        error: err.message,
      };
    }
  },

  async getMyPurchases(idUsuario) {
    const rows =
      await purchaseRepository.getUserPurchases(
        idUsuario
      );

    const comprasMap = {};

    for (const row of rows) {
      if (!comprasMap[row.idCompra]) {
        comprasMap[row.idCompra] = {
          idCompra: row.idCompra,
          fechaCompra: row.fechaCompra,
          metodoPago: row.metodoPago,
          estado: row.estado,
          total: 0,
          items: [],
        };
      }

      comprasMap[row.idCompra].items.push({
        idItemCompra:
          row.idItemCompra,

        idTipoProducto:
          row.idTipoProducto,

        nombreProducto:
          row.nombreProducto,

        idImagen:
          row.idImagen,

        idAlbum:
          row.idAlbum,

        miniatura:
          row.rutaMiniatura,

        precioUnitario:
          Number(
            row.precioUnitario || 0
          ),

        subtotal:
          Number(
            row.subtotal || 0
          ),
      });

      comprasMap[row.idCompra].total +=
        Number(
          row.subtotal || 0
        );
    }

    return Object.values(
      comprasMap
    );
  },

  async generateZip(
    idCompra,
    idUsuario
  ) {
    const [compraRows] =
      await db.query(
        `
        SELECT *
        FROM compras
        WHERE idCompra = ?
          AND idUsuario = ?
          AND deleted_at IS NULL
        `,
        [
          idCompra,
          idUsuario,
        ]
      );

    if (
      compraRows.length === 0
    ) {
      throw new Error(
        "Compra no encontrada o sin permisos."
      );
    }

    const [items] =
      await db.query(
        `
        SELECT
          i.idImagen,
          i.rutaOriginal
        FROM items_compra ic

        INNER JOIN imagenes i
          ON i.idImagen = ic.idImagen

        WHERE ic.idCompra = ?
          AND ic.deleted_at IS NULL
          AND i.deleted_at IS NULL
          AND i.rutaOriginal IS NOT NULL
        `,
        [idCompra]
      );

    if (!items.length) {
      throw new Error(
        "No existen imágenes válidas para descargar."
      );
    }

    const archive =
      archiver("zip", {
        zlib: { level: 9 },
      });

    archive.on(
      "error",
      (err) => {
        console.error(
          "❌ Archiver:",
          err
        );
        throw err;
      }
    );

    for (
      let index = 0;
      index < items.length;
      index++
    ) {
      const item =
        items[index];

      try {
        const response =
          await fetch(
            item.rutaOriginal
          );

        if (
          !response.ok
        ) {
          console.warn(
            `⚠ Imagen ${item.idImagen} inaccesible`
          );
          continue;
        }

        const arrayBuffer =
          await response.arrayBuffer();

        const buffer =
          Buffer.from(
            arrayBuffer
          );

        archive.append(
          buffer,
          {
            name: `FotoTrack_${item.idImagen}_${
              index + 1
            }.jpg`,
          }
        );
      } catch (err) {
        console.error(
          `❌ Error descargando imagen ${item.idImagen}`,
          err
        );
      }
    }

    archive.finalize();

    return archive;
  },
};