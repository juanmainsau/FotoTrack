import { purchaseService } from "../services/purchase.service.js";
import { userRepository } from "../repositories/user.repository.js";

export const purchaseController = {

  /**
   * POST /api/compras
   * Crea una compra completa del usuario autenticado.
   */
  async create(req, res) {
    try {
      // Usuario autenticado viene de auth.middleware
      const idUsuario = req.user.idUsuario || req.user.id;

      if (!idUsuario) {
        return res.status(401).json({
          ok: false,
          error: "Usuario no autenticado",
        });
      }

      // Obtener datos del usuario (incluye idCarrito)
      const user = await userRepository.findById(idUsuario);

      if (!user) {
        return res.status(404).json({
          ok: false,
          error: "Usuario no encontrado.",
        });
      }

      if (!user.idCarrito) {
        return res.status(400).json({
          ok: false,
          error: "El usuario no posee carrito asignado.",
        });
      }

      const idCarrito = Number(user.idCarrito);

      // Método de pago (simulado)
      const { idMetodoPago = 1 } = req.body;

      // Crear la compra real
      const result = await purchaseService.createPurchase({
        idUsuario,
        idCarrito,
        idMetodoPago,
      });

      if (!result.ok) {
        return res.status(400).json({
          ok: false,
          error: result.error,
        });
      }

      return res.json({
        ok: true,
        idCompra: result.idCompra,
      });
    } catch (err) {
      console.error("Error en purchaseController.create:", err);
      return res.status(500).json({
        ok: false,
        error: "Error interno al procesar la compra",
      });
    }
  },

  /**
   * GET /api/compras/mias
   * Devuelve todas las compras del usuario autenticado.
   */
  async getMyPurchases(req, res) {
    try {
      const idUsuario = req.user.idUsuario || req.user.id;
      const compras = await purchaseService.getMyPurchases(idUsuario);

      return res.json({ ok: true, compras });
    } catch (err) {
      console.error("Error en getMyPurchases:", err);
      return res.status(500).json({
        ok: false,
        error: "No se pudieron obtener las compras",
      });
    }
  },

  /**
   * GET /api/compras/:idCompra/descargar
   * Descarga un ZIP con todas las imágenes originales de la compra.
   */
  async download(req, res) {
    try {
      const idUsuario = req.user.idUsuario || req.user.id;
      const { idCompra } = req.params;

      const zipStream = await purchaseService.generateZip(idCompra, idUsuario);

      res.setHeader("Content-Type", "application/zip");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=compra_${idCompra}.zip`
      );

      zipStream.pipe(res);
    } catch (err) {
      console.error("Error en purchaseController.download:", err);
      return res.status(500).json({
        ok: false,
        error: "No se pudo generar el archivo ZIP",
      });
    }
  },
};
