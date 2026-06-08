// apps/api/src/controllers/cart.controller.js
import { cartService } from "../services/cart.service.js";

export const cartController = {
  async getMyCart(req, res) {
    try {
      const idUsuario =
        req.user?.idUsuario ||
        req.user?.id;

      if (!idUsuario) {
        return res.status(401).json({
          ok: false,
          error: "Usuario no autenticado",
        });
      }

      const data = await cartService.getMyCart(idUsuario);

      return res.json({
        ok: true,
        carrito: data,
      });
    } catch (err) {
      console.error(
        "❌ Error en getMyCart:",
        err
      );

      return res.status(500).json({
        ok: false,
        error: "Error al obtener el carrito",
      });
    }
  },

  async addImage(req, res) {
    try {
      const idUsuario =
        req.user?.idUsuario ||
        req.user?.id;

      const { idImagen } = req.body;

      if (!idImagen) {
        return res.status(400).json({
          ok: false,
          error: "idImagen es obligatorio",
        });
      }

      await cartService.addImageToCart(
        idUsuario,
        Number(idImagen)
      );

      return res.json({
        ok: true,
        message: "Imagen agregada al carrito",
      });
    } catch (err) {
      console.error(
        "❌ Error en addImage:",
        err
      );

      return res.status(400).json({
        ok: false,
        error: err.message,
      });
    }
  },

  async removeItem(req, res) {
    try {
      const idUsuario =
        req.user?.idUsuario ||
        req.user?.id;

      const { idItem } = req.params;

      await cartService.removeItem(
        idUsuario,
        Number(idItem)
      );

      return res.json({
        ok: true,
      });
    } catch (err) {
      console.error(
        "❌ Error en removeItem:",
        err
      );

      return res.status(400).json({
        ok: false,
        error: err.message,
      });
    }
  },

  async clearMyCart(req, res) {
    try {
      const idUsuario =
        req.user?.idUsuario ||
        req.user?.id;

      await cartService.clearMyCart(
        idUsuario
      );

      return res.json({
        ok: true,
      });
    } catch (err) {
      console.error(
        "❌ Error al vaciar carrito:",
        err
      );

      return res.status(500).json({
        ok: false,
        error: "Error al vaciar el carrito",
      });
    }
  },
};