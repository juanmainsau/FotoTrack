import { purchaseService } from "../services/purchase.service.js";
import { userRepository } from "../repositories/user.repository.js";
import jwt from "jsonwebtoken"; 
import { db } from "../config/db.js";

export const purchaseController = {

  /**
   * POST /api/compras
   * Crea una compra completa del usuario autenticado.
   */
  async create(req, res) {
    try {
      const idUsuario = req.user.idUsuario || req.user.id;

      if (!idUsuario) {
        return res.status(401).json({
          ok: false,
          error: "Usuario no autenticado",
        });
      }

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
      const { idMetodoPago = 1 } = req.body;

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
      console.error("❌ Error en purchaseController.create:", err);
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
      console.error("❌ Error en getMyPurchases:", err);
      return res.status(500).json({
        ok: false,
        error: "No se pudieron obtener las compras",
      });
    }
  },

  /**
   * GET /api/compras/:idCompra/descargar
   * Descarga un ZIP con todas las imágenes (Botón Web "Mis Compras").
   */
  async download(req, res) {
    try {
      const idUsuario = req.user.idUsuario || req.user.id;
      const { idCompra } = req.params;

      const zipStream = await purchaseService.generateZip(idCompra, idUsuario);

      res.setHeader("Content-Type", "application/zip");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=FotoTrack_Compra_${idCompra}.zip`
      );

      zipStream.pipe(res);
    } catch (err) {
      console.error("❌ Error en purchaseController.download:", err);
      return res.status(500).json({
        ok: false,
        error: "No se pudo generar el archivo ZIP",
      });
    }
  },

  /**
   * GET /api/compras/public/download/:id
   * Descarga segura desde el enlace del correo.
   */
  async downloadPurchaseZipPublic(req, res) {
    try {
      const { id } = req.params;
      const idTransaccionMP = id; // 👈 Ahora sabemos que este es el ID largo de MP
      const { token } = req.query;

      console.log(`🔍 Petición de descarga pública recibida. ID Transacción MP: ${idTransaccionMP}`);

      if (!token) {
        return res.status(403).send("<h1>Enlace inválido 🚫</h1><p>Falta el token de seguridad.</p>");
      }

      // 1. Verificamos que el token sea válido
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        return res.status(403).send("<h1>Enlace expirado ⏳</h1><p>El link de descarga ha vencido o es inválido.</p>");
      }

      // 2. Verificamos que el token corresponda a ESTA compra
      if (String(decoded.compraId) !== String(idTransaccionMP)) {
         return res.status(403).send("<h1>Acceso denegado 🔒</h1><p>Este token no corresponde a esta compra.</p>");
      }

      console.log(`✅ Token verificado. Autorizando descarga para email: ${decoded.email}`);

      // ============================================================
      // 🧪 BLOQUE MÁGICO PARA PRUEBAS
      // ============================================================
      if (idTransaccionMP === "999999") {
        console.log("🧪 Simulación ACTIVADA: Enviando archivo de prueba.");
        res.setHeader("Content-Type", "text/plain");
        res.setHeader("Content-Disposition", "attachment; filename=prueba_exitosa.txt");
        return res.send("¡HOLA! 👋\n\nSi estás leyendo esto, significa que el sistema está 100% operativo.");
      }
      // ============================================================

      // 3. Buscar el ID interno de la base de datos usando el ID de Mercado Pago
      const [compraRows] = await db.query(
        "SELECT idCompra, idUsuario FROM compras WHERE idTransaccionMP = ?", 
        [idTransaccionMP]
      );
      
      if (compraRows.length === 0) {
        return res.status(404).send("<h1>Compra no encontrada 🕵️‍♂️</h1><p>La compra ya no existe en el sistema.</p>");
      }

      const idUsuarioReal = compraRows[0].idUsuario;
      const idCompraInterno = compraRows[0].idCompra; // El ID chiquito (ej: 8)

      // 4. Generamos el ZIP con el ID interno
      const zipStream = await purchaseService.generateZip(idCompraInterno, idUsuarioReal); 

      res.setHeader("Content-Type", "application/zip");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=FotoTrack_Pedido_${idTransaccionMP}.zip`
      );

      zipStream.pipe(res);

    } catch (err) {
      console.error("❌ Error en descarga pública:", err);
      res.status(500).send("<h1>Error de servidor 💥</h1><p>No se pudo procesar la descarga de tus fotos.</p>");
    }
  }
};