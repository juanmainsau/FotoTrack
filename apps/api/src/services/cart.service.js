// apps/api/src/services/cart.service.js
import { cartRepository } from "../repositories/cart.repository.js";
import { userRepository } from "../repositories/user.repository.js"; // 🔥 Necesario

export const cartService = {
  async getOrCreateCart(idUsuario) {
    let carrito = await cartRepository.findActiveCartByUser(idUsuario);

    // Si NO existe carrito → crearlo y ASIGNARLO AL USUARIO
    if (!carrito) {
      carrito = await cartRepository.createCartForUser(idUsuario);

      // 🔥 Paso obligatorio para que el checkout funcione
      await userRepository.updateUserCart(idUsuario, carrito.idCarrito);
    }

    return carrito;
  },

  async getMyCart(idUsuario) {
    const { carrito, items } = await cartRepository.getCartWithItemsByUser(idUsuario);

    if (!carrito) {
      return { idCarrito: null, total: 0, items: [] };
    }

    const total = items.reduce(
      (acc, item) => acc + (item.precioUnitario * item.cantidad),
      0
    );

    return {
      idCarrito: carrito.idCarrito,
      total,
      items: items.map(item => ({
        idItem: item.idItem,
        tipoProducto: item.tipoProducto,
        idImagen: item.idImagen,
        idAlbum: item.idAlbum,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
        miniatura: item.rutaMiniatura,
        nombreAlbum: item.nombreAlbum
      }))
    };
  },

  async addImageToCart(idUsuario, idImagen) {
    if (!idImagen) throw new Error("idImagen es requerido");

    const carrito = await this.getOrCreateCart(idUsuario);

    // Evitar duplicado
    const existing = await cartRepository.findItemByCartAndImage(
      carrito.idCarrito,
      idImagen
    );

    if (existing) {
      throw new Error("La imagen ya está en el carrito");
    }

    // Obtener precio desde el álbum
    const precio = await cartRepository.getPriceForImage(idImagen);

    // 🚨 Validar precio antes del insert
    if (precio === null || precio === undefined || precio <= 0) {
      throw new Error("El álbum no tiene precio configurado para esta imagen");
    }

    // Insertar ítem en items_carrito
    await cartRepository.addImageItem({
      idCarrito: carrito.idCarrito,
      idImagen,
      precioUnitario: precio,
    });

    return { ok: true };
  },

  async removeItem(idUsuario, idItem) {
    const deleted = await cartRepository.deleteItemForUser(idUsuario, idItem);
    if (!deleted) throw new Error("Ítem no encontrado o no pertenece al usuario");
    return { ok: true };
  },

  async clearMyCart(idUsuario) {
    await cartRepository.clearCartByUser(idUsuario);
    return { ok: true };
  },
};
