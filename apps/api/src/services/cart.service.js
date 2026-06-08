// apps/api/src/services/cart.service.js
import { cartRepository } from "../repositories/cart.repository.js";
import { userRepository } from "../repositories/user.repository.js";

export const cartService = {
  async getOrCreateCart(idUsuario) {
    let carrito = await cartRepository.findActiveCartByUser(idUsuario);

    if (!carrito) {
      carrito = await cartRepository.createCartForUser(idUsuario);

      // Compatibilidad: en la nueva DB no hace nada crítico,
      // pero se mantiene para no romper otros flujos.
      await userRepository.updateUserCart(idUsuario, carrito.idCarrito);
    }

    return carrito;
  },

  async getMyCart(idUsuario) {
    const { carrito, items } = await cartRepository.getCartWithItemsByUser(idUsuario);

    if (!carrito) {
      return {
        idCarrito: null,
        total: 0,
        items: [],
      };
    }

    const mappedItems = items.map((item) => {
      const cantidad = Number(item.cantidad || 1);
      const precioUnitario = Number(item.precioUnitario || 0);
      const subtotal = Number(item.subtotal ?? precioUnitario * cantidad);

      return {
        idItem: item.idItem,

        idTipoProducto: item.idTipoProducto,
        tipoProducto: item.tipoProducto,
        codigoProducto: item.codigoProducto,
        nombreProducto: item.nombreProducto,

        idImagen: item.idImagen,
        idAlbum: item.idAlbum,

        cantidad,
        precioUnitario,
        subtotal,

        miniatura: item.rutaMiniatura,
        rutaOptimizado: item.rutaOptimizado,
        rutaOriginal: item.rutaOriginal,

        nombreAlbum: item.nombreAlbum,
        albumOrigen: item.albumOrigen,
      };
    });

    const total = mappedItems.reduce(
      (acc, item) => acc + Number(item.subtotal || 0),
      0
    );

    return {
      idCarrito: carrito.idCarrito,
      total,
      items: mappedItems,
    };
  },

  async addImageToCart(idUsuario, idImagen) {
    if (!idImagen) {
      throw new Error("idImagen es requerido");
    }

    const carrito = await this.getOrCreateCart(idUsuario);

    const existing = await cartRepository.findItemByCartAndImage(
      carrito.idCarrito,
      idImagen
    );

    if (existing) {
      throw new Error("La imagen ya está en el carrito");
    }

    const precio = await cartRepository.getPriceForImage(idImagen);

    if (precio === null || precio === undefined || Number(precio) <= 0) {
      throw new Error("El álbum no tiene precio configurado para esta imagen");
    }

    await cartRepository.addImageItem({
      idCarrito: carrito.idCarrito,
      idImagen,
      precioUnitario: Number(precio),
    });

    return { ok: true };
  },

  async removeItem(idUsuario, idItem) {
    const deleted = await cartRepository.deleteItemForUser(idUsuario, idItem);

    if (!deleted) {
      throw new Error("Ítem no encontrado o no pertenece al usuario");
    }

    return { ok: true };
  },

  async clearMyCart(idUsuario) {
    await cartRepository.clearCartByUser(idUsuario);
    return { ok: true };
  },
};