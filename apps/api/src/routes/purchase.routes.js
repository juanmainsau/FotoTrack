// src/routes/purchase.routes.js
import { Router } from "express";
import { purchaseController } from "../controllers/purchase.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/roles.middleware.js"; // 👈 Importante para proteger los datos sensibles

const router = Router();

// ==========================================
// 🔒 RUTAS ADMINISTRADOR (Gestión Global)
// ==========================================
// Esta es la ruta que consulta tu AdminVentasPage.jsx
router.get(
  "/admin", 
  authMiddleware, 
  requireAdmin, 
  purchaseController.getAllAdmin
);

// ==========================================
// 🔒 RUTAS PROTEGIDAS (Usuario Final)
// ==========================================
router.post("/", authMiddleware, purchaseController.create);
router.get("/mias", authMiddleware, purchaseController.getMyPurchases);

// Descargar ZIP desde el botón de la web ("Mis Compras")
router.get("/:idCompra/descargar", authMiddleware, purchaseController.download);

// ==========================================
// 🌍 RUTA PÚBLICA (Validada por Token JWT del correo)
// ==========================================
router.get("/public/download/:id", purchaseController.downloadPurchaseZipPublic);

export default router;