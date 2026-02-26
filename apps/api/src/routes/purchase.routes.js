import { Router } from "express";
import { purchaseController } from "../controllers/purchase.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// ==========================================
// 🔒 RUTAS PROTEGIDAS (Requieren estar logueado en la web)
// ==========================================
router.post("/", authMiddleware, purchaseController.create);
router.get("/mias", authMiddleware, purchaseController.getMyPurchases);

// Descargar ZIP desde el botón de la web ("Mis Compras")
router.get("/:idCompra/descargar", authMiddleware, purchaseController.download);

// ==========================================
// 🌍 RUTA PÚBLICA (Validada por Token JWT del correo)
// ==========================================
// IMPORTANTE: No lleva authMiddleware porque el usuario entra desde su Gmail, no desde el sistema.
router.get("/public/download/:id", purchaseController.downloadPurchaseZipPublic);

export default router;